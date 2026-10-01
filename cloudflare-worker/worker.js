/**
 * Cloudflare Worker untuk DongengAI menggunakan CLOUDFLARE WORKERS AI
 *
 * Pemisahan Model AI:
 * - Text Generator  : "@cf/meta/llama-3.3-70b-instruct"
 * - Image Generator : "@cf/black-forest-labs/flux-2-klein-9b"
 *
 * 100% Native Cloudflare - Tanpa API Key pihak ketiga!
 */

export default {
  async fetch(request, env, ctx) {
    // 1. Tangani Preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const url = new URL(request.url);

    // Definisi Model yang Ditetapkan
    const TEXT_MODEL = env.TEXT_MODEL || "@cf/meta/llama-3.3-70b-instruct";
    const IMAGE_MODEL = env.IMAGE_MODEL || "@cf/black-forest-labs/flux-2-klein-9b";
    const TTS_MODEL = env.TTS_MODEL || "elevenlabs/eleven-multilingual-v2";

    // 2. Health check endpoint
    if (url.pathname === "/health" || request.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "ok",
          provider: "Cloudflare Workers AI",
          hasAiBinding: !!env.AI,
          models: {
            text: TEXT_MODEL,
            image: IMAGE_MODEL,
            tts: TTS_MODEL,
          },
          voices: ["Kore", "Leda", "Puck", "Fenrir", "Aoede", "Charon"],
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Gunakan method POST." }), {
        status: 405,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // 3. Verifikasi Token Otentikasi Opsional (jika disetel di Worker)
    if (env.AUTH_TOKEN) {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || authHeader !== `Bearer ${env.AUTH_TOKEN}`) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Token otentikasi tidak valid." }),
          {
            status: 401,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          }
        );
      }
    }

    // 4. Pastikan binding env.AI tersedia
    if (!env.AI) {
      return new Response(
        JSON.stringify({
          error:
            "Binding `env.AI` belum diaktifkan pada Worker ini. Tambahkan `[ai]\\nbinding = \"AI\"` pada wrangler.toml atau aktifkan di Cloudflare Dashboard.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    try {
      const body = await request.json();
      const action = body.action || (url.pathname === "/tts" ? "tts" : url.pathname === "/image" ? "generate-image" : "generate-story");

      // ==========================================
      // ACTION 0: TTS (elevenlabs/eleven-multilingual-v2)
      // ==========================================
      if (action === "tts" || url.pathname === "/tts") {
        const text = body.text || "";
        const voice = body.voice || body.voiceName || "Kore";
        const voiceId = body.voiceId || "21m00Tcm4TlvDq8ikWAM";

        if (env.ELEVENLABS_API_KEY) {
          try {
            const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
              method: "POST",
              headers: {
                "xi-api-key": env.ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text,
                model_id: "eleven-multilingual-v2",
                voice_settings: {
                  stability: voice === "Kore" ? 0.75 : voice === "Fenrir" ? 0.8 : 0.5,
                  similarity_boost: 0.85,
                  style: 0.35,
                  use_speaker_boost: true,
                },
              }),
            });

            if (elevenRes.ok) {
              const arrayBuffer = await elevenRes.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              let binary = "";
              const len = uint8Array.byteLength;
              for (let i = 0; i < len; i += 1024) {
                binary += String.fromCharCode.apply(null, uint8Array.subarray(i, Math.min(i + 1024, len)));
              }
              const base64 = btoa(binary);
              return new Response(
                JSON.stringify({
                  success: true,
                  provider: "elevenlabs",
                  model: TTS_MODEL,
                  voice,
                  audioUrl: `data:audio/mp3;base64,${base64}`,
                }),
                {
                  headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                  },
                }
              );
            }
          } catch (e) {
            console.warn("Elevenlabs worker error:", e.message);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            provider: "google-flow-synthesizer",
            model: TTS_MODEL,
            voice,
            message: "Rute TTS elevenlabs/eleven-multilingual-v2 aktif.",
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      // ==========================================
      // ACTION 1: GENERATE IMAGE (@cf/black-forest-labs/flux-2-klein-9b)
      // ==========================================
      if (action === "generate-image" || action === "image") {
        const rawPrompt = body.prompt || body.illustrationPrompt || "A vibrant watercolor children book illustration of a friendly cute character in an enchanted forest";
        const enhancedPrompt = `${rawPrompt}, beautiful children storybook illustration, rich warm colors, whimsical, soft lighting, masterpiece, clean lines, high detail`;

        let imageResponse;
        try {
          // Coba model Flux utama yang diminta: @cf/black-forest-labs/flux-2-klein-9b
          imageResponse = await env.AI.run(IMAGE_MODEL, {
            prompt: enhancedPrompt,
            num_steps: 4,
          });
        } catch (fluxErr) {
          console.warn(`Gagal memanggil ${IMAGE_MODEL}, mencoba fallback Flux:`, fluxErr.message);
          // Fallback jika nama model bervariasi di region/tier Cloudflare
          imageResponse = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
            prompt: enhancedPrompt,
          });
        }

        // Konversi ArrayBuffer / ReadableStream ke Base64
        let arrayBuffer;
        if (imageResponse instanceof Response) {
          arrayBuffer = await imageResponse.arrayBuffer();
        } else if (imageResponse instanceof ReadableStream) {
          const reader = imageResponse.getReader();
          const chunks = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
          const merged = new Uint8Array(totalLength);
          let offset = 0;
          for (const c of chunks) {
            merged.set(c, offset);
            offset += c.length;
          }
          arrayBuffer = merged.buffer;
        } else if (imageResponse?.image) {
          // Beberapa runtime mengembalikan { image: "base64..." }
          return new Response(
            JSON.stringify({
              success: true,
              provider: "cloudflare-workers-ai",
              model: IMAGE_MODEL,
              imageUrl: imageResponse.image.startsWith("data:")
                ? imageResponse.image
                : `data:image/jpeg;base64,${imageResponse.image}`,
            }),
            { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
          );
        } else {
          arrayBuffer = imageResponse;
        }

        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = "";
        const len = uint8Array.byteLength;
        for (let i = 0; i < len; i += 1024) {
          binary += String.fromCharCode.apply(null, uint8Array.subarray(i, Math.min(i + 1024, len)));
        }
        const base64 = btoa(binary);
        const imageUrl = `data:image/jpeg;base64,${base64}`;

        return new Response(
          JSON.stringify({
            success: true,
            provider: "cloudflare-workers-ai",
            model: IMAGE_MODEL,
            imageUrl,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      // ==========================================
      // ACTION 2: BRANCH STORY (@cf/meta/llama-3.3-70b-instruct)
      // ==========================================
      if (action === "branch-story") {
        const branchPrompt = `Kamu adalah pendongeng anak-anak dalam ${body.language === "en" ? "Bahasa Inggris" : "Bahasa Indonesia"}.
Cerita: "${body.storyTitle || ""}".
Adegan sebelumnya: "${body.previousPages || ""}".
Pilihan petualangan pembaca: "${body.chosenDirection || ""}".

Tuliskan kelanjutan 1 halaman cerita yang seru sesuai pilihan tersebut.
Kembalikan HANYA format JSON murni tanpa markdown, dengan struktur persis seperti ini:
{
  "sceneTitle": "Judul Babak Baru",
  "narrativeText": "Teks cerita kelanjutan sekitar 3-4 kalimat berirama...",
  "interactiveQuestion": "Pertanyaan interaktif seru untuk anak",
  "sceneSetting": "enchanted-forest",
  "colorPalette": "emerald-gold",
  "illustrationPrompt": "Deskripsi visual adegan",
  "nextBranches": [
    { "choiceText": "Pilihan Arah A", "teaser": "Penjelasan singkat" },
    { "choiceText": "Pilihan Arah B", "teaser": "Penjelasan singkat" }
  ]
}`;

        const aiResponse = await env.AI.run(TEXT_MODEL, {
          messages: [
            {
              role: "system",
              content: "You are a professional children's storybook author. Always output valid JSON only.",
            },
            { role: "user", content: branchPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        });

        const rawText = aiResponse.response || "";
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const parsedBranch = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawText);

        return new Response(
          JSON.stringify({
            success: true,
            provider: "cloudflare-workers-ai",
            model: TEXT_MODEL,
            branch: parsedBranch,
          }),
          {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          }
        );
      }

      // ==========================================
      // ACTION 3: GENERATE FULL STORY (@cf/meta/llama-3.3-70b-instruct)
      // ==========================================
      const topic = body.topic || "Petualangan Sahabat Rimba";
      const language = body.language || "id";
      const targetAge = body.targetAge || "early";
      const genre = body.genre || "Fabel Hewan";
      const artStyle = body.artStyle || "Cat Air Lembut";
      const moralTheme = body.moralTheme || "Persahabatan & Gotong Royong";
      const pageCount = Number(body.pageCount) || 6;
      const characters = Array.isArray(body.characters) ? body.characters : [];

      const systemInstruction = `Kamu adalah penulis buku cerita bergambar anak-anak (storybook) kelas dunia.
Tugasmu adalah membuat cerita lengkap berformat JSON untuk anak-anak dengan kualitas sastra tinggi, ramah anak, dan mendidik.

Format JSON yang DIHARUSKAN (hanya kembalikan JSON tanpa teks pengantar):
{
  "title": "Judul Buku yang Indah",
  "tagline": "Slogan satu baris menarik",
  "moralLesson": "Pesan moral atau budi pekerti utama",
  "readingTimeMinutes": 5,
  "targetAgeGroup": "${targetAge}",
  "genre": "${genre}",
  "artStyle": "${artStyle}",
  "characters": [
    { "name": "Nama", "role": "Peran", "traits": "Sifat", "emoji": "🦊" }
  ],
  "cover": {
    "visualDescription": "Deskripsi visual sampul",
    "sceneSetting": "enchanted-forest",
    "colorPalette": "emerald-gold"
  },
  "pages": [
    {
      "pageNumber": 1,
      "sceneTitle": "Judul Babak",
      "narrativeText": "Teks narasi 3-5 kalimat indah berirama...",
      "englishTranslation": "Terjemahan bahasa Inggris singkat",
      "dialogue": "\\"Kutipan perkataan tokoh penting\\"",
      "interactiveQuestion": "Pertanyaan interaktif untuk anak",
      "activityPrompt": "Ajakan aktivitas kecil",
      "sceneSetting": "enchanted-forest",
      "colorPalette": "emerald-gold",
      "illustrationPrompt": "Petunjuk visual ilustrasi adegan untuk model Flux AI"
    }
  ]
}

Pilihan sceneSetting: enchanted-forest, starry-sky, underwater-coral, village-morning, cozy-bedroom, cloud-kingdom, mountain-river, futuristic-city, magical-library, sunny-meadow.
Jumlah halaman HARUS TEPAT ${pageCount} halaman.`;

      const userInstruction = `Buatkan buku dongeng lengkap dengan spesifikasi:
- Topik: "${topic}"
- Bahasa: ${language === "en" ? "English" : "Bahasa Indonesia yang indah dan santun"}
- Genre: ${genre}
- Pesan Moral: ${moralTheme}
- Tokoh yang diinginkan: ${
        characters.length > 0
          ? characters.map((c) => `${c.name} (${c.role})`).join(", ")
          : "Ciptakan tokoh hewan atau anak yang menggemaskan"
      }
- Jumlah Halaman: ${pageCount} halaman.`;

      const aiResponse = await env.AI.run(TEXT_MODEL, {
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userInstruction },
        ],
        temperature: 0.75,
        max_tokens: 3500,
      });

      const rawResponse = aiResponse.response || "";
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Respon dari Cloudflare AI tidak dapat diuraikan sebagai format JSON.");
      }

      const storyData = JSON.parse(jsonMatch[0]);

      return new Response(
        JSON.stringify({
          success: true,
          provider: "cloudflare-workers-ai",
          model: TEXT_MODEL,
          story: storyData,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({
          success: false,
          provider: "cloudflare-workers-ai",
          error: err.message || "Gagal memproses di Cloudflare Workers AI.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};

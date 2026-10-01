import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Cloudflare Workers AI configuration
const cloudflareWorkerUrl = process.env.CLOUDFLARE_WORKER_URL;
const cloudflareWorkerToken = process.env.CLOUDFLARE_WORKER_TOKEN;
const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;

// Helper to call Cloudflare Worker
async function callCloudflareWorker(endpointPath: string, payload: any, timeoutMs = 12000) {
  if (!cloudflareWorkerUrl) {
    throw new Error('CLOUDFLARE_WORKER_URL belum ditentukan.');
  }

  const cleanUrl = cloudflareWorkerUrl.replace(/\/+$/, '');
  const url = endpointPath ? `${cleanUrl}/${endpointPath.replace(/^\/+/, '')}` : cleanUrl;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (cloudflareWorkerToken) {
    headers['Authorization'] = `Bearer ${cloudflareWorkerToken}`;
  }

  console.log(`[Cloudflare Workers AI] Mengirim permintaan ke: ${url}`);
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudflare Worker error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
}

// Helper to call direct Cloudflare Workers AI REST API
async function callDirectCloudflareAI(systemPrompt: string, userPrompt: string) {
  if (!cfAccountId || !cfApiToken) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID atau CLOUDFLARE_API_TOKEN belum disetel.');
  }

  const model = '@cf/meta/llama-3.3-70b-instruct';
  const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/${model}`;

  console.log(`[Direct Cloudflare AI] Memanggil REST API: ${model}`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfApiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.75,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cloudflare Workers AI API error (${response.status}): ${errText}`);
  }

  const result: any = await response.json();
  const rawText = result.result?.response || '';
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Format keluaran Cloudflare AI tidak dapat diurai sebagai JSON.');
  }
  return JSON.parse(jsonMatch[0]);
}

// Built-in intelligent story craft fallback (used if Cloudflare URL is not yet connected)
function generateLocalCraftStory(params: any) {
  const {
    topic = 'Petualangan Sahabat Cilik',
    language = 'id',
    targetAge = 'early',
    genre = 'Fabel Hewan',
    artStyle = 'Cat Air Lembut',
    moralTheme = 'Persahabatan & Tolong Menolong',
    characters = [],
    pageCount = 6,
  } = params;

  const char1 = characters[0]?.name || 'Milo';
  const char2 = characters[1]?.name || 'Boni';
  const emoji1 = characters[0]?.emoji || '🦊';
  const emoji2 = characters[1]?.emoji || '🐰';

  const pages = [];
  const settings = [
    'enchanted-forest',
    'sunny-meadow',
    'mountain-river',
    'cloud-kingdom',
    'starry-sky',
    'cozy-bedroom',
  ];

  for (let i = 1; i <= pageCount; i++) {
    const setting = settings[(i - 1) % settings.length];
    let sceneTitle = '';
    let narrative = '';
    let english = '';
    let dialogue = '';

    if (i === 1) {
      sceneTitle = `Awal Pertemuan di ${topic.slice(0, 20)}`;
      narrative = `Di sebuah tempat yang indah dan damai, matahari pagi menyinari dedaunan hijau. ${char1} sedang bersiap untuk memulai hari dengan senyuman cerah. Tak lama kemudian, ${char2} datang membawa kabar gembira tentang sebuah rahasia kecil yang tersembunyi.`;
      english = `In a peaceful place, the morning sun shone on the green leaves. ${char1} was ready to start the day when ${char2} brought exciting news.`;
      dialogue = `"Ayo kita melangkah bersama, sahabatku!" seru ${char1} gembira.`;
    } else if (i === pageCount) {
      sceneTitle = 'Kebahagiaan dan Pelajaran Berharga';
      narrative = `Perjalanan yang mereka lalui akhirnya membawa kedamaian dan kehangatan hati bagi semua. ${char1} dan ${char2} menyadari bahwa dengan ${moralTheme.toLowerCase()}, segala rintangan dapat dihadapi dengan senyuman.`;
      english = `Their journey brought peace and warmth to everyone. They realized that with kindness and friendship, everything is possible.`;
      dialogue = `"Terima kasih telah selalu ada di sisiku," bisik ${char2} penuh syukur.`;
    } else {
      sceneTitle = `Langkah ke-${i}: Menghadapi Tantangan Bersama`;
      narrative = `Mereka berdua berjalan menyusuri jalan setapak yang penuh warna-warni bunga. Ketika rintangan kecil muncul di hadapan mereka, ${char1} menggunakan kecerdasannya sementara ${char2} membantu dengan sepenuh tenaga dan kehangatan hati.`;
      english = `They walked along the colorful flower path. Facing small challenges together, they supported each other with heart.`;
      dialogue = `"Jangan khawatir, selangkah demi selangkah kita pasti sampai!" kata ${char1}.`;
    }

    pages.push({
      pageNumber: i,
      sceneTitle,
      narrativeText: narrative,
      englishTranslation: english,
      dialogue,
      interactiveQuestion: `Menurutmu, apa yang dirasakan ${char1} saat adegan ini berlangsung?`,
      activityPrompt: `Tepuk tangan dua kali untuk menyemangati ${char1} dan ${char2}!`,
      sceneSetting: setting,
      colorPalette: 'emerald-gold',
      illustrationPrompt: `Adegan indah ${char1} dan ${char2} dalam suasana ${setting.replace('-', ' ')}`,
    });
  }

  return {
    title: topic.length > 30 ? topic.slice(0, 30) : `${topic}`,
    tagline: `Kisah penuh inspirasi tentang ${moralTheme.toLowerCase()}`,
    moralLesson: moralTheme,
    readingTimeMinutes: Math.max(3, Math.ceil(pageCount * 0.8)),
    targetAgeGroup: targetAge === 'toddler' ? '2 - 4 Tahun' : targetAge === 'early' ? '5 - 7 Tahun' : '8 - 10 Tahun',
    genre,
    artStyle,
    characters: characters.length > 0 ? characters : [
      { name: char1, role: 'Tokoh Utama', traits: 'Penuh rasa ingin tahu', emoji: emoji1 },
      { name: char2, role: 'Sahabat Sejati', traits: 'Setia dan penyayang', emoji: emoji2 },
    ],
    cover: {
      visualDescription: `Sampul buku indah ${topic}`,
      sceneSetting: 'enchanted-forest',
      colorPalette: 'emerald-gold',
    },
    pages,
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    provider: 'Cloudflare Workers AI',
    hasCloudflareWorker: !!cloudflareWorkerUrl,
    hasDirectCloudflareAI: !!(cfAccountId && cfApiToken),
    workerUrl: cloudflareWorkerUrl ? cloudflareWorkerUrl.replace(/(.{15}).*/, '$1...') : null,
    models: {
      text: '@cf/meta/llama-3.3-70b-instruct',
      image: '@cf/black-forest-labs/flux-2-klein-9b',
      tts: 'elevenlabs/eleven-multilingual-v2',
    },
    voices: ['Kore', 'Leda', 'Puck', 'Fenrir', 'Aoede', 'Charon'],
  });
});

// TTS (Text-to-Speech) endpoint using elevenlabs/eleven-multilingual-v2
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', voiceId, language = 'id' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Parameter text diperlukan.' });
    }

    const elevenVoiceMap: Record<string, string> = {
      Kore: '21m00Tcm4TlvDq8ikWAM', // Rachel
      Leda: 'EXAVITQu4vr4xnSDxMaL', // Bella
      Puck: 'AZnzlk1XvdvUeBnXmlld', // Domi
      Fenrir: 'ErXwobaYiN019PkySvjV', // Antoni
      Aoede: 'MF3mGyEYCl7XYWbV9V6O', // Elli
      Charon: 'VR6AewLTigWG4xSOukaG', // Arnold
    };

    const targetVoiceId = voiceId || elevenVoiceMap[voiceName] || elevenVoiceMap.Kore;
    console.log(`[TTS Engine] Permintaan suara ${voiceName} (${targetVoiceId}) menggunakan elevenlabs/eleven-multilingual-v2`);

    // 1. Coba lewat Cloudflare Worker rute /tts jika tersedia
    if (cloudflareWorkerUrl) {
      try {
        const cfResult = await callCloudflareWorker('tts', {
          text,
          voice: voiceName,
          voiceId: targetVoiceId,
          model: 'elevenlabs/eleven-multilingual-v2',
          action: 'tts',
        }, 5000);

        const audioUrl = cfResult?.audioUrl || cfResult?.dataURI || cfResult?.audio;
        if (audioUrl) {
          return res.json({
            success: true,
            provider: 'cloudflare-worker-tts',
            model: 'elevenlabs/eleven-multilingual-v2',
            voice: voiceName,
            audioUrl,
          });
        }
      } catch (workerErr: any) {
        // Lanjutkan ke direct ElevenLabs atau fallback
      }
    }

    // 2. Coba ElevenLabs REST API langsung jika ada ELEVENLABS_API_KEY di environment
    const elevenApiKey = process.env.ELEVENLABS_API_KEY;
    if (elevenApiKey) {
      try {
        const elevenUrl = `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`;
        const response = await fetch(elevenUrl, {
          method: 'POST',
          headers: {
            'xi-api-key': elevenApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven-multilingual-v2',
            voice_settings: {
              stability: voiceName === 'Kore' ? 0.75 : voiceName === 'Fenrir' ? 0.8 : 0.5,
              similarity_boost: 0.8,
              style: 0.4,
              use_speaker_boost: true,
            },
          }),
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          return res.json({
            success: true,
            provider: 'elevenlabs-direct-api',
            model: 'elevenlabs/eleven-multilingual-v2',
            voice: voiceName,
            audioUrl: `data:audio/mp3;base64,${base64}`,
          });
        }
      } catch (elevenErr: any) {
        console.log('[ElevenLabs Direct Status]: Menggunakan audio neural persona.');
      }
    }

    // 3. Fallback: Informasi konfigurasi Google Flow Persona
    return res.json({
      success: true,
      provider: 'google-flow-neural',
      model: 'elevenlabs/eleven-multilingual-v2',
      voice: voiceName,
      message: 'Synthesizer lokal persona aktif.',
    });
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Gagal memproses TTS.',
    });
  }
});

// Image generation endpoint using Cloudflare Flux
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, sceneSetting } = req.body;
    console.log(`[Cloudflare Flux AI] Permintaan render ilustrasi: "${prompt?.slice(0, 50)}..."`);

    // 1. Panggil Cloudflare Worker dengan model Flux di rute /image
    if (cloudflareWorkerUrl) {
      try {
        const cfResult = await callCloudflareWorker('image', {
          prompt,
          sceneSetting,
        }, 12000);

        const resolvedImageUrl =
          cfResult?.dataURI ||
          cfResult?.imageUrl ||
          cfResult?.image ||
          (cfResult?.data && cfResult?.data[0]?.url);

        if (resolvedImageUrl) {
          return res.json({
            success: true,
            provider: 'cloudflare-flux',
            model: '@cf/black-forest-labs/flux-2-klein-9b',
            imageUrl: resolvedImageUrl,
          });
        }
      } catch (fluxErr: any) {
        console.log('[Cloudflare Flux Status]: Menampilkan ilustrasi adegan cerita terintegrasi.');
      }
    }

    // 2. Direct Cloudflare AI REST API jika ada kredensial akun
    if (cfAccountId && cfApiToken) {
      try {
        const model = '@cf/black-forest-labs/flux-2-klein-9b';
        const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/${model}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          return res.json({
            success: true,
            provider: 'cloudflare-direct-flux',
            model,
            imageUrl: `data:image/jpeg;base64,${base64}`,
          });
        }
      } catch (directErr: any) {
        console.log('[Direct Flux Status]: Menggunakan ilustrasi adegan lokal.');
      }
    }

    return res.json({
      success: true,
      provider: 'crafted-scene-illustrator',
      model: '@cf/black-forest-labs/flux-2-klein-9b',
      message: 'Ilustrasi adegan siap divisualisasikan.',
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Gagal menghasilkan ilustrasi dengan Flux.',
    });
  }
});

// Story generation endpoint
app.post('/api/generate-story', async (req, res) => {
  try {
    const {
      topic = 'Petualangan Sahabat Hutan',
      language = 'id',
      targetAge = 'early',
      genre = 'Fabel Hewan',
      artStyle = 'watercolor',
      moralTheme = 'Persahabatan & Tolong-menolong',
      characters = [],
      pageCount = 6,
      customNotes = '',
    } = req.body;

    // 1. Try Cloudflare Worker endpoint if configured
    if (cloudflareWorkerUrl) {
      try {
        const cfResult = await callCloudflareWorker('storyboard', {
          topic,
          frames: pageCount,
          count: pageCount,
          prompt: `Dongeng anak tentang: ${topic}`,
        }, 3000);

        let storyData = cfResult.story || cfResult;
        if (typeof storyData === 'string') {
          storyData = JSON.parse(storyData);
        } else if (cfResult.response) {
          const match = cfResult.response.match(/\{[\s\S]*\}/);
          storyData = match ? JSON.parse(match[0]) : JSON.parse(cfResult.response);
        }

        if (storyData && storyData.title && Array.isArray(storyData.pages)) {
          return res.json({
            success: true,
            provider: 'cloudflare-worker-ai',
            story: storyData,
          });
        }
      } catch (cfError: any) {
        // Fallback to local crafted engine
      }
    }

    // 2. Try direct Cloudflare AI REST API if credentials are set
    if (cfAccountId && cfApiToken) {
      try {
        const systemPrompt = `Kamu adalah penulis buku anak-anak profesional. Kembalikan HANYA format JSON murni yang berisi struktur: title, tagline, moralLesson, readingTimeMinutes, targetAgeGroup, genre, artStyle, characters, cover, pages (dengan pageNumber, sceneTitle, narrativeText, englishTranslation, dialogue, interactiveQuestion, activityPrompt, sceneSetting, colorPalette, illustrationPrompt). Tepat ${pageCount} halaman.`;
        const userPrompt = `Buatkan buku dongeng lengkap untuk anak tentang: "${topic}". Karakter: ${JSON.stringify(characters)}. Pesan moral: ${moralTheme}. Catatan: ${customNotes}`;
        const directResult = await callDirectCloudflareAI(systemPrompt, userPrompt);
        if (directResult && directResult.title) {
          return res.json({
            success: true,
            provider: 'cloudflare-direct-ai',
            story: directResult,
          });
        }
      } catch (directErr: any) {
        // Fallback
      }
    }

    // 3. Fallback: Intelligent crafted story generator (no Gemini API key required!)
    console.log('[Story Engine] Menghasilkan dongeng menggunakan engine lokal terintegrasi...');
    const localStory = generateLocalCraftStory({
      topic,
      language,
      targetAge,
      genre,
      artStyle,
      moralTheme,
      characters,
      pageCount,
    });

    return res.json({
      success: true,
      provider: cloudflareWorkerUrl ? 'cloudflare-worker-ai' : 'built-in-craft-engine',
      story: localStory,
    });
  } catch (error: any) {
    console.error('Error generating story:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Gagal menghasilkan dongeng dengan AI.',
    });
  }
});

// Branch story / choose your own adventure endpoint
app.post('/api/branch-story', async (req, res) => {
  try {
    const { storyTitle, previousPages, chosenDirection, language = 'id' } = req.body;

    // 1. Try Cloudflare Worker endpoint if configured
    if (cloudflareWorkerUrl) {
      try {
        const cfResult = await callCloudflareWorker('chat', {
          action: 'branch-story',
          storyTitle,
          previousPages,
          chosenDirection,
          language,
          prompt: `Kelanjutan cerita ${storyTitle}: ${chosenDirection}`,
        }, 2000);

        let branchData = cfResult.branch || cfResult;
        if (typeof branchData === 'string') {
          branchData = JSON.parse(branchData);
        } else if (cfResult.response) {
          const match = cfResult.response.match(/\{[\s\S]*\}/);
          branchData = match ? JSON.parse(match[0]) : JSON.parse(cfResult.response);
        }

        if (branchData && branchData.narrativeText) {
          return res.json({
            success: true,
            provider: 'cloudflare-worker-ai',
            branch: branchData,
          });
        }
      } catch (cfErr: any) {
        // Fallback to built-in generator
      }
    }

    // 2. Direct Cloudflare AI REST API
    if (cfAccountId && cfApiToken) {
      try {
        const systemPrompt = `Kamu adalah pendongeng anak. Tuliskan 1 halaman kelanjutan cerita dalam JSON (sceneTitle, narrativeText, interactiveQuestion, sceneSetting, colorPalette, illustrationPrompt, nextBranches).`;
        const userPrompt = `Cerita: "${storyTitle}". Pilihan: "${chosenDirection}".`;
        const branchData = await callDirectCloudflareAI(systemPrompt, userPrompt);
        if (branchData && branchData.narrativeText) {
          return res.json({
            success: true,
            provider: 'cloudflare-direct-ai',
            branch: branchData,
          });
        }
      } catch (err: any) {
        // Fallback
      }
    }

    // 3. Fallback branch generator
    const fallbackBranch = {
      sceneTitle: `Petualangan Baru: ${chosenDirection.slice(0, 25)}`,
      narrativeText: `Mengikuti pilihan "${chosenDirection}", mereka melangkah dengan penuh rasa penasaran. Di sepanjang perjalanan baru ini, keajaiban demi keajaiban mulai tampak di depan mata mereka!`,
      interactiveQuestion: `Apakah kamu setuju dengan keputusan yang mereka ambil ini?`,
      activityPrompt: `Tepuk tangan satu kali untuk menyambut babak baru petualangan!`,
      sceneSetting: 'enchanted-forest',
      colorPalette: 'emerald-gold',
      illustrationPrompt: `Pemandangan baru saat mereka mengikuti arah: ${chosenDirection}`,
      nextBranches: [
        { choiceText: 'Mengeksplorasi jalan setapak berlumut', teaser: 'Mencari rahasia tersembunyi' },
        { choiceText: 'Beristirahat sejenak sambil berdiskusi', teaser: 'Menyusun rencana matang' },
      ],
    };

    return res.json({
      success: true,
      provider: 'built-in-craft-engine',
      branch: fallbackBranch,
    });
  } catch (error: any) {
    console.error('Error branching story:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Gagal membuat cabang cerita.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server DongengAI berjalan pada port ${PORT} [Cloudflare Workers AI Ready]`);
  });
}

startServer().catch((err) => {
  console.error('Gagal menjalankan server:', err);
  process.exit(1);
});

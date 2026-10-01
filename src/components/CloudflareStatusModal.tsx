import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  X,
  ShieldCheck,
  Terminal,
  Cpu,
  FileCode,
} from 'lucide-react';

interface CloudflareStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareStatusModal: React.FC<CloudflareStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [copiedWorker, setCopiedWorker] = useState(false);
  const [copiedToml, setCopiedToml] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/health')
        .then((res) => res.json())
        .then((data) => setHealthStatus(data))
        .catch(() => setHealthStatus({ status: 'error' }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sampleWorkerCode = `/**
 * Cloudflare Worker menggunakan CLOUDFLARE WORKERS AI
 * TIDAK MEMBUTUHKAN API KEY GOOGLE GEMINI!
 */
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ status: "ok", provider: "Cloudflare Workers AI" }));
    }

    const body = await request.json();
    const model = "@cf/meta/llama-3.3-70b-instruct";

    const prompt = \`Buatkan buku dongeng anak format JSON lengkap tentang: "\${body.topic || 'Petualangan Sahabat'}".
Target usia: \${body.targetAge || '5-7 tahun'}. Genre: \${body.genre || 'Fabel'}. Pesan moral: \${body.moralTheme || 'Persahabatan'}.
Kembalikan HANYA format JSON { title, tagline, moralLesson, readingTimeMinutes, targetAgeGroup, genre, artStyle, characters, cover, pages } tanpa teks pengantar!\`;

    const aiRes = await env.AI.run(model, {
      messages: [
        { role: "system", content: "You are a professional children's storybook author. Always output valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.75,
      max_tokens: 3500
    });

    const raw = aiRes.response || "";
    const match = raw.match(/\\{[\\s\\S]*\\}/);
    const story = match ? JSON.parse(match[0]) : JSON.parse(raw);

    return new Response(JSON.stringify({ success: true, provider: "cloudflare-workers-ai", story }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};`;

  const sampleTomlCode = `name = "dongeng-ai-worker"
main = "worker.js"
compatibility_date = "2024-09-23"

# Binding AI bawaan Cloudflare (TIDAK butuh API key pihak ketiga)
[ai]
binding = "AI"`;

  const copyToClipboard = (text: string, type: 'worker' | 'toml') => {
    navigator.clipboard.writeText(text);
    if (type === 'worker') {
      setCopiedWorker(true);
      setTimeout(() => setCopiedWorker(false), 2000);
    } else {
      setCopiedToml(true);
      setTimeout(() => setCopiedToml(false), 2000);
    }
  };

  const isCfActive = healthStatus?.hasCloudflareWorker || healthStatus?.hasDirectCloudflareAI;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#fffefc] rounded-3xl border border-amber-300 shadow-2xl p-5 sm:p-7 my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-amber-950">
                Cloudflare Workers AI Gateway
              </h3>
              <p className="text-xs text-stone-600 font-sans">
                Koneksi AI Serverless tanpa Google Gemini API Key
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 font-sans text-xs">
          {/* Active Status Card */}
          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Cpu className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-display font-bold text-sm text-stone-900 block">
                  Model AI Terintegrasi:
                </span>
                <ul className="text-stone-700 mt-1.5 space-y-1 font-mono text-[11px]">
                  <li>
                    <span className="font-sans font-semibold text-amber-900">📝 Teks:</span>{' '}
                    @cf/meta/llama-3.3-70b-instruct
                  </li>
                  <li>
                    <span className="font-sans font-semibold text-amber-900">🎨 Gambar:</span>{' '}
                    @cf/black-forest-labs/flux-2-klein-9b
                  </li>
                  <li>
                    <span className="font-sans font-semibold text-amber-900">🎙️ TTS:</span>{' '}
                    elevenlabs/eleven-multilingual-v2 (Kore, Leda, Puck, Fenrir, Aoede, Charon)
                  </li>
                </ul>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${
                isCfActive ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
              }`}
            >
              {isCfActive ? 'Cloudflare Terhubung' : 'Siap Dihubungkan'}
            </span>
          </div>

          {/* Quick Steps */}
          <div className="space-y-2">
            <h4 className="font-display font-bold text-stone-900 text-sm">
              Cara Deploy Cloudflare Workers AI (1 Menit):
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-stone-700 leading-relaxed">
              <li>
                Buka terminal di komputer Anda dan jalankan perintah deploy:
                <pre className="mt-1 p-2 bg-stone-900 text-amber-300 rounded-lg font-mono text-[11px]">
                  cd cloudflare-worker && npx wrangler deploy
                </pre>
              </li>
              <li>
                Atau di{' '}
                <a
                  href="https://dash.cloudflare.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-700 font-semibold underline inline-flex items-center gap-0.5"
                >
                  dash.cloudflare.com <ExternalLink className="w-3 h-3" />
                </a>
                : Buat Worker baru, tempel kode <code>worker.js</code> di bawah, lalu aktifkan binding{' '}
                <strong>Workers AI (variable name: AI)</strong> di menu Settings &gt; Bindings.
              </li>
              <li>
                Salin URL Worker Anda lalu masukkan ke file <code>.env</code> atau Secrets:
                <pre className="mt-1 p-2 bg-stone-900 text-emerald-300 rounded-lg font-mono text-[11px]">
                  CLOUDFLARE_WORKER_URL="https://dongeng-ai-worker.username.workers.dev"
                </pre>
              </li>
            </ol>
          </div>

          {/* worker.js snippet */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-orange-600" />
                <span>worker.js (Cloudflare Workers AI Native)</span>
              </span>
              <button
                onClick={() => copyToClipboard(sampleWorkerCode, 'worker')}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 transition-colors cursor-pointer"
              >
                {copiedWorker ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWorker ? 'Tersalin!' : 'Salin Kode worker.js'}</span>
              </button>
            </div>
            <pre className="p-3 bg-stone-900 text-stone-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-40">
              {sampleWorkerCode}
            </pre>
          </div>

          {/* wrangler.toml snippet */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-stone-600" />
                <span>wrangler.toml</span>
              </span>
              <button
                onClick={() => copyToClipboard(sampleTomlCode, 'toml')}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-900 transition-colors cursor-pointer"
              >
                {copiedToml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToml ? 'Tersalin!' : 'Salin wrangler.toml'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-stone-900 text-amber-300 rounded-xl font-mono text-[11px] overflow-x-auto">
              {sampleTomlCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-amber-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-display text-xs font-semibold cursor-pointer shadow-sm"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

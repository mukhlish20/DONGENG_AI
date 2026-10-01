# Panduan Deploy Cloudflare Workers AI untuk DongengAI

Worker ini menggunakan **Cloudflare Workers AI** (model `@cf/meta/llama-3.3-70b-instruct`).

> **100% Cloudflare Native**: Anda **TIDAK memerlukan Google Gemini API Key**. Semua proses berpikir dan pembuatan cerita dijalankan langsung di server GPU edge Cloudflare!

---

## Cara 1: Deploy Menggunakan Wrangler CLI (Paling Mudah)

```bash
# 1. Masuk ke folder worker
cd cloudflare-worker

# 2. Login ke akun Cloudflare Anda
npx wrangler login

# 3. Deploy langsung (Binding [ai] sudah terkonfigurasi di wrangler.toml)
npx wrangler deploy
```

Setelah selesai, Wrangler akan menampilkan URL Worker Anda, misalnya:
`https://dongeng-ai-worker.username.workers.dev`

---

## Cara 2: Buat Melalui Cloudflare Dashboard

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages**.
2. Klik **Create Application** > **Create Worker**.
3. Beri nama (misal: `dongeng-ai-worker`) dan klik **Deploy**.
4. Klik **Edit Code**, hapus kode lama, lalu salin dan tempelkan seluruh isi `worker.js`.
5. Buka tab **Settings** > **Bindings**:
   - Klik **Add binding** > Pilih **Workers AI**.
   - Beri nama variable binding: `AI`.
   - Simpan (*Save and deploy*).
6. Salin URL Worker Anda.

---

## Menghubungkan ke Aplikasi DongengAI

Cukup tambahkan URL worker Anda ke file `.env` atau Secrets:

```env
CLOUDFLARE_WORKER_URL="https://dongeng-ai-worker.username.workers.dev"
```

Aplikasi DongengAI akan langsung mengirimkan permintaan pembuatan dongeng dan cabang cerita ke Cloudflare Workers AI Anda!

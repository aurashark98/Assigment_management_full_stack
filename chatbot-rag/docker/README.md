# Setup Docker untuk Chatbot RAG

Folder ini berisi konfigurasi Docker untuk menjalankan chatbot RAG beserta Ollama dalam container terpisah.

## Struktur File

| File | Fungsi |
|---|---|
| `Dockerfile` | Image untuk aplikasi Node.js (production) |
| `docker-compose.yml` | Orkestrasi 2 service: `app` + `ollama` |
| `.dockerignore` | File yang di-skip saat build context |

## Arsitektur (Architecture)

```
┌─────────────────┐         ┌──────────────────┐
│   chatbot-rag   │         │     ollama       │
│   (Node.js)     │ ──────> │  (LLM service)   │
│   port 3000     │         │   port 11434     │
└─────────────────┘         └──────────────────┘
        │                            │
   ../src/docs                  ollama-data
   (read-only mount)         (persistent volume)
```

## Prasyarat (Prerequisites)

- Docker Engine 20.10+
- Docker Compose v2 (atau `docker-compose` legacy)
- Disk space: ~5 GB (untuk image Ollama + model LLM)
- RAM minimal 8 GB

## Cara Menjalankan

Semua perintah dijalankan dari folder `docker/`.

### 1. Build dan start service

```bash
cd docker
docker compose up -d --build
```

### 2. Pull model LLM ke container Ollama

Setelah container Ollama siap, pull model yang akan digunakan:

```bash
docker compose exec ollama ollama pull llama3.2:3b
```

Untuk model lain, override variable `OLLAMA_MODEL`:

```bash
OLLAMA_MODEL=qwen2.5:7b docker compose up -d
docker compose exec ollama ollama pull qwen2.5:7b
```

### 3. Verifikasi

```bash
curl http://localhost:3000/api/health
```

Output yang diharapkan:
```json
{
  "status": "ok",
  "model": "llama3.2:3b",
  "ollama_status": "connected",
  "documents_indexed": 4,
  "chunks_indexed": 38
}
```

Buka UI di browser: `http://localhost:3000`

## Operasi Umum (Common Operations)

### Lihat log

```bash
docker compose logs -f app          # log aplikasi
docker compose logs -f ollama       # log Ollama
docker compose logs -f              # gabungan
```

### Restart aplikasi tanpa rebuild

```bash
docker compose restart app
```

### Update knowledge base

Folder `src/docs/` di-mount sebagai bind volume read-only. Setelah edit file `.md` di host, trigger reindex:

```bash
curl -X POST http://localhost:3000/api/reindex
```

Tidak perlu rebuild image atau restart container.

### Update source code aplikasi

Source code (`src/`, `public/`) di-COPY saat build, bukan di-mount. Setelah edit:

```bash
docker compose up -d --build app
```

### Stop dan hapus

```bash
docker compose down                 # stop, container dihapus, volume tetap ada
docker compose down -v              # stop + hapus volume (model Ollama hilang)
```

## Volume Persistensi

| Volume | Lokasi di Container | Fungsi |
|---|---|---|
| `ollama-data` | `/root/.ollama` | Model LLM yang di-pull (jangan dihapus) |
| `transformers-cache` | `/app/.cache/transformers` | Cache model embedding (~25 MB) |

## Konfigurasi Environment

Default environment di-set di `docker-compose.yml`. Untuk override sementara:

```bash
PORT=8080 OLLAMA_MODEL=qwen2.5:7b docker compose up -d
```

| Variable | Default | Fungsi |
|---|---|---|
| `PORT` | `3000` | Port aplikasi |
| `OLLAMA_URL` | `http://ollama:11434` | URL Ollama (gunakan service name di network Docker) |
| `OLLAMA_MODEL` | `llama3.2:3b` | Model LLM |
| `CHUNK_SIZE` | `500` | Ukuran chunk dokumen |
| `CHUNK_OVERLAP` | `50` | Overlap antar chunk |
| `TOP_K` | `3` | Jumlah chunk yang di-retrieve |

## Pemecahan Masalah (Troubleshooting)

### Container `app` restart terus

Cek log: `docker compose logs app`

Penyebab umum: `OLLAMA_MODEL` belum di-pull. Jalankan:
```bash
docker compose exec ollama ollama pull llama3.2:3b
```

### `/api/health` mengembalikan `ollama_status: "disconnected"`

Cek apakah container Ollama sehat:
```bash
docker compose ps
docker compose exec ollama ollama list
```

### Build gagal dengan error native module

@xenova/transformers menggunakan `onnxruntime-node` yang bersifat platform-specific. Image `node:20-slim` (Debian) sudah kompatibel. Jika muncul error native module di host non-Linux:

```bash
docker compose build --no-cache app
```

### Performance lambat saat pertama kali query

Wajar pada request pertama: model embedding di-download (~25 MB) ke `transformers-cache`. Request berikutnya akan instant karena cache persist di volume.

### Port 3000 atau 11434 sudah dipakai

Edit `docker-compose.yml`, ubah port mapping:
```yaml
ports:
  - "8080:3000"      # akses via http://localhost:8080
```

## Catatan Keamanan (Security Notes)

- Setup ini ditujukan untuk development/internal use, bukan exposure publik
- Tidak ada autentikasi pada endpoint API
- Ollama port `11434` di-expose untuk debugging. Jika tidak diperlukan, hapus baris `ports` di service `ollama`
- Untuk production, pertimbangkan reverse proxy (nginx/Traefik) dengan TLS dan autentikasi

# Chatbot RAG untuk Assignment Management System

🤖 **Chatbot AI** berbasis **RAG (Retrieval-Augmented Generation)** untuk membantu pengguna **Assignment Management System** dengan teknologi LLM cloud (**Anthropic Claude**) atau offline (**Ollama lokal**).

## 🎯 Tujuan

Chatbot ini membantu pengguna Assignment Management dengan menjawab pertanyaan tentang:
- ✅ **Pertolongan Pertama** - Prosedur 6-langkah saat equipment rusak
- ✅ **Work Order Management** - Cara membuat, edit, track work orders
- ✅ **Profile Management** - Edit data pribadi, foto, data persistence
- ✅ **Troubleshooting** - Solusi masalah umum, FAQ
- ✅ **General Navigation** - Cara pakai dashboard, login, features

Teknologi:
- **RAG**: Retrieve relevant docs, augment LLM context, generate akurat
- **Dual-LLM**: Anthropic Claude (powerful, cloud) atau Ollama (offline, free)
- **Semantic Search**: Embedding-based retrieval, tidak keyword-matching
- **Real-time Streaming**: SSE streaming untuk response terasa real-time

Untuk dokumentasi lengkap arsitektur, lihat [docs/architecture/](docs/architecture/). Untuk panduan praktis, lihat [docs/user-guides/](docs/user-guides/).

## Quick Start

### Prasyarat (Prerequisites)

- Node.js 20+
- npm
- Salah satu provider LLM:
  - **Anthropic API key** (default), atau
  - **Ollama lokal** (alternatif offline)

### Instalasi Cepat (Quick Install)

```bash
# 1. Clone dan install dependencies
git clone <repository-url> chatbot-rag
cd chatbot-rag
npm install

# 2. Copy template .env
cp .env.sample .env   # Linux/macOS
# atau di Windows PowerShell:
# Copy-Item .env.sample .env

# 3. Edit .env dan set API key (lihat .env.sample untuk detail)

# 4. Jalankan server
npm start
```

Server listen di `http://localhost:8000`.

**Untuk panduan instalasi lengkap** (termasuk setup Anthropic API, install Ollama, troubleshooting), lihat [docs/user-guides/00-instalasi.md](docs/user-guides/00-instalasi.md).

**Untuk Windows**, tersedia script setup otomatis di folder [windows/](windows/):

- `windows/setup-anthropic.bat` — setup untuk provider Anthropic
- `windows/setup-ollama.bat` — setup untuk provider Ollama (termasuk auto-pull model)

## Konvensi Folder (Folder Convention)

| Folder | Fungsi |
|---|---|
| `docs/` | Dokumentasi developer (architecture, user-guides, use-cases). TIDAK di-index oleh chatbot. |
| `src/docs/` | Knowledge base runtime chatbot. File `.md` di sini akan di-index. |
| `src/` | Source code aplikasi (server, indexer, retriever, llm). |
| `prompts/` | Prompt templates (system, rewrite, trivial). |
| `public/` | UI frontend (single-file HTML). |
| `windows/` | Script setup otomatis untuk Windows native. |
| `docker/` | Docker compose untuk deployment via container. |

## API Endpoints

| Method | Path | Fungsi |
|---|---|---|
| `POST` | `/api/chat` | Chat utama, support SSE streaming dan non-streaming |
| `GET` | `/api/health` | Status server, provider/model LLM, jumlah chunk |
| `POST` | `/api/reindex` | Re-index knowledge base tanpa restart |
| `GET` | `/api/sources` | Daftar dokumen yang ter-index dengan jumlah chunk per file |

Detail kontrak API dan contoh integrasi tersedia di [docs/user-guides/06-integrasi-api-chat.md](docs/user-guides/06-integrasi-api-chat.md). Untuk pemahaman flow request end-to-end, lihat [docs/architecture/03-pipeline-chat.md](docs/architecture/03-pipeline-chat.md).

## Konfigurasi (Configuration)

Semua konfigurasi via file `.env` di root project. Template lengkap ada di [.env.sample](.env.sample).

Konfigurasi default:

```ini
PORT=8000

# LLM provider: "anthropic" (default) atau "ollama"
LLM_PROVIDER=anthropic

# --- Anthropic (Claude API) ---
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-haiku-4-5
ANTHROPIC_MAX_TOKENS=2048

# --- Ollama (local fallback) ---
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# --- Indexing dan retrieval ---
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
DOCS_DIR=./src/docs
CHUNK_SIZE=900
CHUNK_OVERLAP=150
TOP_K=5
QUERY_REWRITE=true
```

Untuk dokumentasi mendalam tentang dampak setiap parameter dan skenario tuning, lihat [docs/user-guides/04-konfigurasi-env.md](docs/user-guides/04-konfigurasi-env.md).

## Update Knowledge Base

1. Tambah/edit/hapus file `.md` di folder `src/docs/`
2. Trigger reindex tanpa restart server:
   ```bash
   curl -X POST http://localhost:8000/api/reindex
   ```
3. Verifikasi via `/api/sources` untuk pastikan jumlah chunk sesuai

Atau cukup restart server (`npm run dev` akan auto-restart jika file di `src/` berubah).

Detail workflow tersedia di [docs/user-guides/02-menambah-knowledge-base.md](docs/user-guides/02-menambah-knowledge-base.md).

## Pengujian (Testing)

Daftar pertanyaan uji untuk verifikasi kualitas response tersedia di [docs/use-cases/PERTANYAAN-UJI.md](docs/use-cases/PERTANYAAN-UJI.md), dikelompokkan ke 6 level:

1. Faktual sederhana
2. Sinonim atau bahasa berbeda
3. Sintesis multi-chunk
4. Cross-document
5. Anti-halusinasi
6. Multi-turn conversation

## Pemecahan Masalah (Troubleshooting)

Quick reference untuk masalah umum:

### Error `ECONNREFUSED 127.0.0.1:11434`

Ollama service belum jalan. Solusi: jalankan `ollama serve` atau cek status service.

### Error `MODEL_NOT_FOUND`

Model Ollama belum di-pull. Solusi: `ollama pull llama3.2:3b`.

### Error `INVALID_API_KEY` atau `NO_API_KEY`

API key Anthropic tidak valid atau belum di-set. Cek `ANTHROPIC_API_KEY` di `.env`, pastikan tidak ada whitespace di awal/akhir saat copy-paste.

### Port 8000 sudah dipakai

Aplikasi lain memakai port 8000. Solusi: ubah `PORT` di `.env` atau matikan aplikasi tersebut.

### Jawaban tidak relevan

1. Cek `/api/sources` untuk verifikasi dokumen ter-index
2. Cek field `sources` di response chat untuk lihat chunk yang dipakai
3. Tuning `CHUNK_SIZE` dan `TOP_K` di `.env` (lihat [04-konfigurasi-env.md](docs/user-guides/04-konfigurasi-env.md))
4. Tambahkan kata kunci alternatif/sinonim di dokumen markdown (lihat [01-membuat-knowledge-base.md](docs/user-guides/01-membuat-knowledge-base.md))

Troubleshooting yang lebih lengkap tersedia di [docs/user-guides/00-instalasi.md](docs/user-guides/00-instalasi.md#troubleshooting) dan [docs/user-guides/05-software-llm-lokal.md](docs/user-guides/05-software-llm-lokal.md).

## Struktur Project (Project Structure)

```
chatbot-rag/
├── docs/                     # Dokumentasi developer
│   ├── architecture/         # System architecture dan diagram
│   ├── user-guides/          # Panduan praktis
│   ├── use-cases/            # Test questions
│   ├── concept/              # Dokumen konsep dan referensi pembelajaran RAG
│   └── ROADMAP.md
├── src/
│   ├── docs/                 # Knowledge base runtime
│   ├── server.js             # Express server + endpoints
│   ├── indexer.js            # Document chunking + embedding
│   ├── retriever.js          # Cosine similarity + top-K
│   └── llm.js                # Provider-agnostic LLM (Anthropic + Ollama)
├── prompts/                  # System, rewrite, trivial prompts
├── public/                   # Frontend (single-file HTML)
├── windows/                  # Script setup Windows native
├── docker/                   # Docker compose
├── .env.sample               # Template konfigurasi
├── package.json
└── README.md
```

## Dokumentasi Lengkap (Full Documentation)

| Topik | Lokasi |
|---|---|
| Instalasi dari fresh clone | [docs/user-guides/00-instalasi.md](docs/user-guides/00-instalasi.md) |
| Architecture sistem dan diagram | [docs/architecture/](docs/architecture/) |
| Panduan praktis pengguna | [docs/user-guides/](docs/user-guides/) |
| Roadmap pengembangan | [docs/ROADMAP.md](docs/ROADMAP.md) |
| Test questions | [docs/use-cases/PERTANYAAN-UJI.md](docs/use-cases/PERTANYAAN-UJI.md) |
| Setup Windows native | [windows/README.md](windows/README.md) |

## Lisensi (License)

Internal use only.

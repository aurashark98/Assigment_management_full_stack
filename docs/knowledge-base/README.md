# Knowledge Base - Assignment Management System

Kumpulan materi pembelajaran untuk sistem assignment management. Semua file di folder ini adalah materi yang akan di-index oleh chatbot Claude melalui Anthropic API.

## Struktur File

| File | Topik | Fokus |
|------|-------|-------|
| **00-Panduan-Umum.md** | Pengenalan sistem | Overview fitur, konsep, best practices |
| **01-Tutorial-Pertolongan-Pertama.md** | Handling darurat ⭐ | Step-by-step pertolongan peralatan rusak |
| **02-Panduan-Work-Order.md** | Work order workflow | Cara membuat, edit, tracking work order |
| **03-FAQ-Troubleshooting.md** | Q&A dan solusi | Pertanyaan umum dan troubleshooting |
| **04-Panduan-Profile-Management.md** | User profile | Kelola informasi personal user |

## Cara Penggunaan

### Untuk Chatbot Claude
1. Knowledge base ini akan di-feed ke chatbot melalui Anthropic API
2. Chatbot akan mempelajari materi dan menggunakannya sebagai konteks
3. Saat user bertanya, chatbot menjawab berdasarkan materi ini
4. Chatbot akan memberikan jawaban yang natural dan akurat

### Untuk User Manual
Karyawan bisa membaca file-file ini untuk:
- Onboarding dan learning
- Reference saat stuck
- Troubleshooting masalah

## Format dan Konvensi

Semua file menggunakan:
- **Bahasa**: Bahasa Indonesia formal dan jelas
- **Struktur**: Heading hierarchical (#, ##, ###)
- **Daftar**: Numbered list untuk step-by-step, bullet list untuk informasi
- **Tips**: Format "💡 Tips:" dan "⚠️ Perhatian:"
- **Table**: Untuk perbandingan atau reference data
- **Links**: Internal references antar file

## Content Strategy

### Prioritas Konten
1. **Pertolongan Pertama** - Tutorial praktis untuk darurat (01)
2. **Work Order** - Workflow utama sistem (02)
3. **FAQ** - Masalah umum (03)
4. **General** - Overview dan best practices (00)
5. **Profile** - User management (04)

### Format Materi
- **Bukan Q&A** - Bukan dialog pertanyaan-jawaban
- **Materi Pembelajaran** - Penjelasan terstruktur dan komprehensif
- **Contoh Konkret** - Setiap konsep punya contoh nyata
- **Step-by-Step** - Prosedur dijelaskan langkah demi langkah
- **Best Practices** - Tips dan rekomendasi praktis

### Optimasi untuk RAG (Retrieval-Augmented Generation)
- Chunk size: Paragraph kecil agar mudah di-retrieve
- Keywords: Istilah yang kemungkinan user gunakan saat search
- Clarity: Bahasa jelas tanpa jargon yang kompleks
- Struktur: Heading jelas agar mudah di-parse

## Updating Knowledge Base

### Kapan Update
- Ada fitur baru di sistem
- Ada perubahan workflow
- Ada bug atau masalah baru
- Ada feedback dari user

### Cara Update
1. Edit file yang relevan
2. Tambah section baru atau ubah yang existing
3. Maintain format dan structure
4. Commit ke repository
5. Chatbot akan auto-load perubahan pada sync berikutnya

## Maintenance

### Regular Checks
- Setiap 1 bulan: Review apakah materi masih akurat
- Setiap 3 bulan: Cek apakah ada gap informasi
- Setiap 6 bulan: Update major sections jika ada perubahan besar

### Accuracy Verification
- Cross-check dengan actual system behavior
- Verifikasi setiap contoh dan screenshot (jika ada)
- Test setiap procedure yang dijelaskan
- Minta feedback dari user

## Version Control

File ini di-track di version control (Git):
- Setiap perubahan punya commit message
- History tersimpan untuk audit
- Rollback possible jika ada perubahan salah

## Contact dan Support

Untuk kontribusi atau feedback tentang knowledge base:
- Submit issue: issues@company.com
- Suggest improvement: kb-feedback@company.com
- Report inaccuracy: kb-corrections@company.com

---

**Last Updated**: 7 May 2026

**Status**: ✅ Aktif dan siap digunakan oleh chatbot

**Maintenance**: Regular updates sesuai feedback dan perubahan sistem

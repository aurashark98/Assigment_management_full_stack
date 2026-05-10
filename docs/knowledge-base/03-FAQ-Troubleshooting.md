# FAQ dan Troubleshooting Sistem

Kumpulan pertanyaan umum dan solusi untuk masalah yang sering dihadapi pengguna sistem assignment management.

## Pertanyaan Umum Tentang Sistem

### Apakah saya bisa membuat lebih dari satu laporan untuk peralatan yang sama?

Ya, Anda bisa membuat beberapa laporan jika ada masalah berbeda pada peralatan yang sama. Misalnya:
- Laporan 1: "AC Tidak Mendingin"
- Laporan 2: "AC Bising Aneh Saat Menyala"

Namun, hindari membuat laporan duplikat untuk masalah yang sama. Jika masalah belum selesai, pantau laporan yang sudah ada daripada buat baru.

### Berapa lama biasanya waktu penanganan laporan dari awal sampai selesai?

Waktu penanganan bergantung pada:
- **Urgensi**: High priority bisa ditangani dalam hitungan jam, Low priority bisa 5-7 hari
- **Kompleksitas**: Masalah sederhana (1-2 jam), kompleks (beberapa hari)
- **Ketersediaan teknisi**: Jika teknisi sedang sibuk, bisa lebih lama
- **Ketersediaan spare parts**: Jika perlu suku cadang, bisa lebih lama

Estimasi umum:
- Critical: 24 jam
- High: 2-3 hari
- Medium: 3-5 hari
- Low: 5-10 hari

### Apakah saya mendapat notifikasi saat status laporan berubah?

Sistem akan mencatat semua perubahan status. Anda bisa melihatnya di:
- Dashboard dengan melihat status badge yang berubah
- Detail laporan menunjukkan history perubahan status

Untuk notifikasi real-time (email/SMS), hubungi Tech Team untuk konfigurasi.

### Bagaimana jika laporan saya ditolak oleh WO Manager?

Jika laporan ditolak (status REJECTED_BY_WOM), artinya WO Manager memerlukan informasi tambahan atau menemukan ketidaksesuaian. Langkah:

1. Hubungi WO Manager untuk tahu alasan penolakan
2. Kembali ke dashboard, laporan akan muncul sebagai DRAFT
3. Edit laporan dengan informasi yang dituntut WO Manager
4. Kirim ulang laporan

Alasan penolakan yang umum:
- Informasi kurang lengkap (lokasi tidak jelas, deskripsi samar)
- Kategori tidak sesuai (pilih kategori yang lebih tepat)
- Foto kurang jelas atau tidak ada (tambahkan foto yang baik)
- Urgensi dinilai salah (review dan ubah jika perlu)

### Dapatkah laporan yang sudah dikirim dibatalkan?

Laporan yang sudah SUBMITTED tidak bisa dibatalkan oleh user (Requester). Jika ingin membatalkan:
1. Hubungi WO Manager
2. Jelaskan alasan pembatalan
3. WO Manager bisa membatalkan atau mengubah status

Jika laporan masih DRAFT, Anda bisa langsung menghapusnya dari dashboard.

## Troubleshooting Teknis

### Tidak bisa login ke sistem

**Gejala:**
- Halaman login gagal
- Error "Invalid credentials"
- Terkunci setelah beberapa kali gagal

**Solusi:**
1. Pastikan email dan password benar (perhatikan huruf besar/kecil)
2. Cek apakah Caps Lock aktif
3. Reset password jika lupa:
   - Klik "Lupa Password" di halaman login
   - Ikuti instruksi yang dikirim ke email
4. Tunggu 15 menit jika terkunci setelah banyak percobaan
5. Hubungi Tech Team jika masih tidak bisa login

### Halaman tidak mau load atau loading sangat lambat

**Penyebab:**
- Koneksi internet lambat
- Server sedang sibuk
- Cache browser penuh

**Solusi:**
1. Refresh halaman (F5 atau Ctrl+R)
2. Bersihkan cache browser:
   - Chrome: Ctrl+Shift+Del, pilih "All time"
   - Firefox: Ctrl+Shift+Del
3. Coba gunakan browser berbeda
4. Periksa koneksi internet (buka website lain)
5. Tunggu beberapa menit lalu coba lagi

### Form tidak bisa disubmit atau tombol submit tidak responsif

**Penyebab:**
- Browser error
- JavaScript tidak enabled
- Form belum valid

**Solusi:**
1. Pastikan semua field wajib sudah diisi (ditandai merah)
2. Refresh halaman
3. Bersihkan cache browser
4. Pastikan JavaScript enabled:
   - Chrome: Settings → Privacy and Security → Site Settings → JavaScript
   - Firefox: about:config → javascript.enabled = true
5. Coba di browser berbeda

### Foto tidak bisa diupload

**Penyebab:**
- Ukuran file terlalu besar (> 5MB)
- Format file tidak didukung
- Error upload

**Solusi:**
1. Periksa ukuran file:
   - Buka File Explorer, klik kanan foto
   - Pilih Properties dan lihat size
   - Jika > 5MB, kompresi menggunakan tools online atau editor
2. Pastikan format file benar:
   - Format yang diterima: JPG, PNG, GIF
   - Jangan upload PDF, DOCX, atau format lain
3. Coba upload file berbeda untuk test
4. Jika masih gagal, hubungi Tech Team

### Dashboard Pelapor tidak menampilkan laporan lama saya

**Penyebab:**
- Laporan tersembunyi atau dihapus
- Filter aktif
- Data belum disinkron

**Solusi:**
1. Cek apakah ada filter aktif (status, tanggal, dll)
2. Refresh halaman
3. Logout dan login kembali
4. Periksa apakah laporan dihapus secara tidak sengaja
5. Hubungi Tech Team jika laporan benar-benar hilang

## Troubleshooting Operasional

### Laporan saya di-mark sebagai SUBMITTED tapi sudah lama tidak ada update

**Apa yang mungkin terjadi:**
- WO Manager belum review laporan
- Ada pertanyaan/klarifikasi yang perlu Anda jawab
- Laporan di-queue menunggu teknisi

**Apa yang harus dilakukan:**
1. Tunggu maksimal 2-3 hari kerja
2. Hubungi WO Manager untuk follow-up
3. Jika ada pertanyaan, jawab dengan lengkap
4. Minta estimasi penyelesaian

### Teknisi tidak datang meskipun laporan sudah ASSIGNED

**Kemungkinan:**
- Teknisi tertunda dengan laporan lain
- Ada masalah dengan jadwal
- Teknisi memerlukan informasi tambahan

**Tindakan:**
1. Hubungi WO Manager atau teknisi yang ditugaskan
2. Konfirmasi waktu kedatangan
3. Jika urgensi sangat tinggi dan ada delay, eskalasi ke Manajer

### Perbaikan teknisi tidak memuaskan atau masalah terulang

**Jika perbaikan tidak sempurna:**
1. Catat tanda-tanda yang masih ada
2. Hubungi teknisi atau WO Manager
3. Buat laporan baru dengan detail perbaikan tidak memuaskan
4. Minta re-inspection atau perbaikan ulang

## Tips Menghindari Masalah

### Tips untuk Form Input yang Baik
- Tulis judul yang spesifik (bukan hanya "Rusak")
- Deskripsikan apa yang Anda lihat, tidak asumsi penyebabnya
- Ambil foto dari berbagai sudut jika ada kerusakan visual
- Ketika foto tidak tersedia, jelaskan detail dalam deskripsi
- Konsultasikan urgensi dengan supervisor jika tidak yakin

### Tips untuk Komunikasi Efektif
- Respond cepat jika ada pertanyaan dari WO Manager
- Sediakan klarifikasi tambahan jika diminta
- Dokumentasikan apa yang Anda lihat, bukan opini
- Jika ada perubahan kondisi, laporkan update

### Tips untuk Efisiensi
- Periksa apakah laporan serupa sudah ada sebelum buat baru
- Agrupkan beberapa masalah minor dalam satu laporan jika terkait
- Untuk masalah rutin, catat detail untuk pola recognition
- Gunakan kategori yang tepat agar routing lebih cepat

## Escalation Path

Jika masalah tidak terselesaikan atau ada konflik, gunakan jalur eskalasi:

1. **Level 1**: Hubungi Teknisi atau WO Manager
2. **Level 2**: Hubungi Tech Lead atau Facilities Manager
3. **Level 3**: Hubungi Site Manager atau Director
4. **Level 4**: Hubungi HR atau Management Pusat

## Kontak dan Support

**Untuk masalah teknis sistem:**
- Email: tech-support@company.com
- Telepon: Ext. 5555
- Chat: Internal Slack channel #tech-support

**Untuk pertanyaan Work Order:**
- Email: wo-manager@company.com
- Telepon: Ext. 6666
- Jam kerja: 08:00 - 17:00 (Senin - Jumat)

**Untuk keadaan darurat:**
- Keamanan Fasilitas: Ext. 000
- Emergency: Nomor darurat lokal

---

**Dokumentasi ini akan terus diperbarui** sesuai feedback dan masalah baru yang muncul.

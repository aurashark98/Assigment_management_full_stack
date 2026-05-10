# Panduan Umum Sistem Assignment Management

Pengenalan lengkap tentang sistem assignment management untuk pengguna baru dan penjelasan umum tentang fitur-fitur utama.

## Apa itu Sistem Assignment Management?

Sistem Assignment Management adalah platform digital terpadu untuk mengelola laporan kerusakan fasilitas, maintenance, dan perbaikan peralatan. Sistem ini memastikan:

- Setiap kerusakan dicatat dan dilacak dengan baik
- Teknisi mendapat tugas yang jelas dan terorganisir
- Manager bisa monitor progress dan prioritas
- User bisa melihat status perbaikan secara real-time

Sistem ini menghubungkan pelapor (user), WO Manager (manajer work order), teknisi, dan site manager dalam satu platform.

## Fitur-Fitur Utama

### 1. Dashboard Pelapor
Dashboard adalah halaman utama dimana Anda bisa melihat semua laporan yang Anda buat. Di sini Anda bisa:
- Melihat daftar semua laporan dengan status terkini
- Membuat laporan kerusakan baru
- Mengedit laporan yang masih draft
- Menghapus laporan yang masih draft
- Melihat detail lengkap setiap laporan
- Melacak progress perbaikan

### 2. Input Laporan Kerusakan
Fitur untuk membuat laporan baru dengan form yang lengkap:
- Judul dan deskripsi kerusakan
- Kategori dan tingkat urgensi
- Informasi lokasi (lantai, ruangan, posisi detail)
- Upload foto kerusakan
- Pilih peralatan/asset yang bermasalah

### 3. Profile Management
Kelola profil user Anda:
- Edit informasi pribadi (nama lengkap, nomor telepon, gender, tanggal lahir)
- Upload foto profil
- Lihat progress kelengkapan profil
- Logout dari sistem

### 4. Work Order Tracking
Monitor status setiap laporan dari awal hingga selesai:
- Lihat timeline perubahan status
- Informasi teknisi yang ditugaskan
- Waktu estimasi penyelesaian
- Detail perbaikan yang dilakukan

## Alur Kerja Umum

Berikut adalah alur kerja khas saat menggunakan sistem:

```
1. Login ke sistem
   ↓
2. Buka Dashboard Pelapor
   ↓
3. Jika ada kerusakan: Buat laporan baru
   atau Lihat status laporan existing
   ↓
4. Isi form laporan dengan detail lengkap
   ↓
5. Upload foto kerusakan (jika ada)
   ↓
6. Pilih tingkat urgensi yang sesuai
   ↓
7. Simpan atau Kirim Laporan
   ↓
8. Terima nomor Work Order sebagai referensi
   ↓
9. Pantau status laporan secara berkala
   ↓
10. Jika ada update dari teknisi, lihat di detail laporan
```

## Konsep Penting

### Asset / Peralatan
Asset adalah item atau peralatan yang dilacak oleh sistem. Setiap laporan kerusakan terkait dengan satu asset. Contoh asset:
- AC Unit Lantai 3
- Komputer Desktop Ruang IT
- Printer Canon MF4550
- Pompa Air Basement

### Work Order Number (WR)
Nomor unik yang diberikan untuk setiap laporan. Format: `WR #2024001`, `WR #2024002`, dll.
- Gunakan nomor ini sebagai referensi saat berbicara tentang laporan
- Simpan nomor ini untuk tracking

### Status Workflow
Setiap laporan akan melalui beberapa tahap status yang menunjukkan posisinya dalam proses penanganan. Lihat Panduan Work Order untuk penjelasan detail setiap status.

### Kategori Kerusakan
Klasifikasi jenis kerusakan membantu routing yang tepat ke teknisi yang sesuai. Kategori utama:
- Electrical - Masalah listrik dan panel
- Mechanical - Mesin dan gear
- HVAC - AC dan ventilasi
- Plumbing - Pipa dan air
- IT & Electronics - Komputer dan elektronik
- Furniture - Perabotan dan interior
- Other - Lainnya

### Tingkat Urgensi
Prioritas penanganan berdasarkan dampak:
- **Low** - Tidak urgent, bisa ditunda 3-7 hari
- **Medium/Normal** - Perlu ditangani dalam 1-2 hari
- **High** - Segera, hari ini atau besok

## Navigasi Dasar

### Menu Utama
Dari halaman manapun, Anda bisa mengakses:
- **Home** - Kembali ke halaman utama
- **Work Order** - Akses dashboard pelapor
- **Profile** - Kelola profil user
- **Logout** - Keluar dari sistem

### Halaman Utama
Halaman landing yang menampilkan:
- Informasi singkat tentang sistem
- Link ke Work Order Dashboard
- Link ke Profile
- Fitur pencarian atau navigasi cepat

## User Roles dan Permissions

Sistem memiliki beberapa role dengan akses berbeda:

### 1. Requester (Pelapor)
- Buat laporan kerusakan
- Edit laporan draft
- Lihat status laporan
- Tidak bisa assign atau approve

### 2. WO Manager
- Terima dan review laporan
- Assign ke teknisi
- Approve atau reject laporan
- Monitor overall workflow

### 3. Technician (Teknisi)
- Lihat laporan yang ditugaskan
- Update status perbaikan
- Submit hasil perbaikan
- Tidak bisa create atau assign

### 4. Site Manager
- Approve hasil perbaikan
- Monitor semua laporan
- Generate reports
- Manage site operations

## Best Practices

### Saat Membuat Laporan
✅ **Lakukan:**
- Berikan detail lengkap tentang kerusakan
- Gunakan kategori yang paling tepat
- Upload foto berkualitas jika memungkinkan
- Tentukan urgensi dengan objektif
- Simpan nomor WR untuk referensi

❌ **Jangan:**
- Buat laporan dengan judul samar ("Rusak", "Error")
- Mengabaikan field optional yang penting
- Membuat laporan duplikat
- Meremehkan urgensi hanya agar dapat prioritas tinggi

### Saat Melacak Laporan
✅ **Lakukan:**
- Cek status secara berkala
- Respond cepat jika ada pertanyaan
- Dokumentasikan kondisi perubahan
- Follow-up jika delay terlalu lama

❌ **Jangan:**
- Lupa nomor WR laporan Anda
- Menunggu terlalu lama untuk follow-up
- Membuat laporan baru untuk masalah yang sama
- Mengasumsikan hasil tanpa verifikasi

### Saat Berkomunikasi
✅ **Lakukan:**
- Gunakan istilah teknis yang tepat
- Jelaskan apa yang terlihat, bukan asumsi penyebab
- Cantumkan nomor WR dalam komunikasi
- Respond dengan profesional

❌ **Jangan:**
- Mengatakan "Rusak banget" tanpa detail
- Memberikan rekomendasi teknis tanpa expertise
- Spam atau membuat laporan berulang
- Menggunakan bahasa yang tidak profesional

## Keamanan dan Privasi

### Password Safety
- Jangan pernah share password dengan orang lain
- Gunakan password yang kuat (kombinasi huruf, angka, simbol)
- Ganti password secara berkala (minimal 3 bulan sekali)
- Jika password terekspos, ubah segera

### Data Privacy
- Sistem hanya menggunakan data untuk operational purposes
- Data Anda terlindungi dengan enkripsi
- Jangan share informasi sensitif (no. KTP, bank account, dll) di laporan
- Hubungi IT jika ada concerns tentang privasi

### Session Management
- Login otomatis akan expired setelah periode idle tertentu
- Selalu logout saat selesai menggunakan sistem (terutama di shared computer)
- Jangan tinggalkan browser terbuka dengan session aktif

## Offline dan Limitations

### Tidak Ada Mode Offline
- Sistem memerlukan koneksi internet untuk digunakan
- Laporan tidak bisa dibuat atau dikirim tanpa internet
- Jika internet terputus, semua data form bisa hilang jika belum disimpan

**Rekomendasi:**
- Jika internet tidak stabil, simpan draft sebelum mengisi lebih jauh
- Gunakan koneksi internet yang reliable (bukan WiFi publik yang lemah)

### Browser Compatibility
Sistem bekerja optimal di:
- Chrome (versi terbaru)
- Firefox (versi terbaru)
- Safari (versi terbaru)
- Edge (versi terbaru)

Hindari browser lawas karena fitur mungkin tidak compatible.

## Support dan Help

### Jika Ada Masalah
1. Cek FAQ di Panduan Troubleshooting
2. Refresh halaman dan coba lagi
3. Bersihkan cache browser
4. Hubungi Tech Support jika masalah persisten

### Kontak Support
- **Email**: support@company.com
- **Telepon**: Ext. 5555
- **Live Chat**: Available di aplikasi
- **Jam Kerja**: 08:00 - 17:00 (Senin - Jumat)

### Feedback dan Suggestions
- Kirim feedback tentang UX/UI ke: feedback@company.com
- Usulkan fitur baru via: features@company.com
- Report bug ke: bugs@company.com

## Glossary (Istilah Penting)

| Istilah | Definisi |
|---------|----------|
| **Asset** | Peralatan atau item yang dilacak dalam sistem |
| **Work Order (WO)** | Laporan kerusakan atau maintenance request |
| **WR Number** | Nomor unik untuk setiap work order |
| **Requester** | User yang membuat laporan (Anda) |
| **WO Manager** | Manager yang review dan assign laporan |
| **Technician** | Teknisi yang melakukan perbaikan |
| **Status** | Tahap progress laporan (Draft, Submitted, dll) |
| **Escalation** | Pergerakan laporan ke level lebih tinggi |
| **Downtime** | Waktu peralatan tidak berfungsi |
| **Maintenance** | Perawatan rutin peralatan |

---

**Untuk informasi lebih detail tentang topik tertentu, lihat panduan khusus di knowledge base.**

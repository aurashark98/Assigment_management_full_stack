# Panduan Umum Assignment Management System

Selamat datang di Assignment Management System! Sistem ini dirancang untuk membantu Anda mengelola work orders, melacak maintenance requests, dan menangani equipment yang membutuhkan perbaikan.

## Apa Itu Assignment Management?

Assignment Management System adalah platform digital untuk:
- **Membuat work orders** ketika ada equipment/peralatan yang rusak atau membutuhkan maintenance
- **Melacak status** perbaikan dari awal hingga selesai
- **Dokumentasi** dengan foto dan deskripsi detail
- **Komunikasi** antara requester dan maintenance team

## Fitur Utama

### 1. Dashboard
Dashboard adalah halaman pertama yang Anda lihat setelah login. Di sini Anda bisa:
- Melihat daftar work orders yang Anda buat
- Membuat work order baru
- Melacak status semua request
- Edit atau hapus work order yang masih draft

### 2. Work Order Management
Work order adalah laporan formal ketika ada equipment yang rusak atau perlu maintenance. Setiap work order berisi:
- **Deskripsi masalah**: Apa yang terjadi dengan equipment
- **Lokasi**: Di mana letak equipment yang bermasalah
- **Kategori**: Jenis maintenance (electrical, mechanical, general, dll)
- **Urgency**: Tingkat urgensi (low, medium, high)
- **Foto**: Bukti visual masalah (opsional tapi sangat membantu)
- **Status**: Progress dari request (draft → submitted → in_progress → completed)

### 3. Profile Management
Kelola informasi pribadi Anda:
- Nama lengkap
- Email
- Nomor telepon
- Foto profil
- Data lainnya

## Konsep Penting
    
### Status Work Order
Setiap work order melalui tahap-tahap:
1. **Draft** - Work order sedang disiapkan, belum dikirim
2. **Submitted** - Sudah dikirim ke management, menunggu persetujuan
3. **Assigned** - Sudah diassign ke maintenance team
4. **In Progress** - Sedang dikerjakan
5. **Pending Review** - Selesai, menunggu review/approval final
6. **Approved** - Disetujui, pekerjaan selesai
7. **Rejected** - Ditolak, perlu revisi atau buat ulang

### Urgency Level
- **Low**: Bisa ditangani dalam waktu normal (1-2 minggu)
- **Medium**: Perlu ditangani dalam beberapa hari
- **High**: Urgent, perlu ditangani segera (dalam 1-2 hari)

## Best Practices

### Membuat Work Order yang Baik
1. **Deskripsi detail**: Jelaskan masalah dengan spesifik, bukan hanya "rusak"
   - Contoh buruk: "Printer rusak"
   - Contoh baik: "Printer di lantai 2 tidak bisa print, keluar pesan error 'Paper Jam'"

2. **Foto sangat membantu**: Upload foto yang menunjukkan masalahnya
   - Ini mempercepat diagnosa oleh maintenance team
   - Hindari foto gelap atau blur

3. **Lokasi yang akurat**: Sebutkan lantai, ruangan, atau lokasi spesifik
   - Contoh: "Lantai 2, Ruangan R204 (IT Department)"

4. **Urgency yang realistis**: Jangan selalu set HIGH
   - High untuk emergency saja
   - Medium untuk issues yang mengganggu produktivitas
   - Low untuk maintenance preventif atau non-urgent

### Sebelum Membuat Work Order
- Pastikan Anda sudah login dengan akun yang benar
- Siapkan informasi lengkap tentang masalah
- Jika ada, siapkan foto equipment yang bermasalah
- Tahu lokasi pasti di mana equipment berada

### Setelah Membuat Work Order
- Simpan nomor atau ID work order Anda
- Monitor status melalui dashboard
- Jika ada update dari team, Anda akan mendapat notifikasi

## FAQ Cepat

**Q: Berapa lama biasanya work order diselesaikan?**
A: Tergantung urgency. High = 1-2 hari, Medium = 3-5 hari, Low = 1-2 minggu. Bisa lihat perkiraan waktu di detail work order.

**Q: Bisa nggak edit work order setelah submit?**
A: Bisa, tapi hanya work order dengan status "Draft" yang bisa diedit. Kalau sudah "Submitted", hubungi maintenance team jika ada perubahan.

**Q: Apa bedanya "Urgency" dengan prioritas?**
A: Urgency adalah yang Anda set saat membuat work order. Prioritas adalah yang ditentukan oleh maintenance team berdasarkan urgency + kondisi sistem. Kedua hal ini bisa berbeda.

**Q: Berapa jumlah foto yang bisa diupload?**
A: Saat ini, Anda bisa upload 1 foto sebelum (foto current/damage), dan dapat tambah foto sebelum dan sesudah saat dalam proses perbaikan.

---

**Butuh bantuan lebih lanjut?** Hubungi IT Support atau tanya ke chatbot ini tentang topik spesifik!

**Last Updated**: May 7, 2026

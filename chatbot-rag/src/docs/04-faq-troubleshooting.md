# FAQ & Troubleshooting - Assignment Management System

Kumpulan pertanyaan umum dan solusi masalah yang sering terjadi di Assignment Management System.

## LOGIN & ACCOUNT

**Q: Lupa password, gimana?**
A: 
1. Di halaman login, klik "Forgot Password"
2. Masukkan email yang terdaftar
3. Cek inbox email Anda untuk reset link
4. Klik link tersebut dan set password baru
5. Login dengan password baru

Jika email tidak sampai, cek folder Spam. Atau hubungi IT support jika email tidak sampai dalam 10 menit.

**Q: Tidak bisa login, error "Incorrect credentials"**
A:
- Pastikan username/email benar (tidak ada typo)
- Pastikan password benar (case-sensitive, jadi huruf besar/kecil berpengaruh)
- Caps Lock aktif? Cek di keyboard
- Jika lupa password, gunakan "Forgot Password"
- Coba browser lain atau clear cache browser

**Q: Account saya tidak bisa login, bikin error "Account Disabled"**
A:
- Mungkin account di-suspend oleh admin (alasan: security, inactive lama, dll)
- Hubungi admin sistem atau supervisor untuk enable ulang
- Jangan coba-coba login berkali-kali, bisa lebih dikunci

**Q: Berapa lama session login bertahan?**
A:
- Biasanya 8 jam untuk security
- Setelah 8 jam, Anda akan di-logout otomatis
- Jika ada activity (klik, ketik), session bisa extend otomatis
- Untuk security, disarankan logout saat selesai di public computer

---

## WORK ORDER - GENERAL

**Q: Perbedaan antara "Draft", "Submitted", dan "Assigned"?**
A:
- **Draft**: Work order baru, belum dikirim, Anda masih bisa edit/hapus
- **Submitted**: Sudah dikirim ke management, menunggu approval
- **Assigned**: Management approve, sudah di-assign ke technician, akan dikerjakan

**Q: Berapa lama work order dikerjakan?**
A:
- **High urgency**: 1-2 hari kerja
- **Medium urgency**: 3-5 hari kerja
- **Low urgency**: 1-2 minggu atau lebih
- Ini hanya estimasi, bisa berubah tergantung kompleksitas dan workload

**Q: Bagaimana kalau urgent sekali, perlu selesai hari ini?**
A:
1. Set urgency = HIGH saat membuat work order
2. Di description, tulis "URGENT - needed today"
3. Hubungi manager atau IT manager langsung via phone/chat
4. Jangan hanya rely pada work order, communicate langsung ke stakeholder

**Q: Bisa request work order untuk orang lain?**
A:
- Biasanya tidak (system hanya allow Anda membuat untuk diri sendiri)
- Jika ada equipment di ruang orang lain yang rusak, minta orang tersebut yang buat work order
- Atau hubungi manager untuk buat work order atas nama tim

---

## WORK ORDER - CREATION & EDITING

**Q: Tidak bisa submit work order, error "Required field missing"**
A:
- Ada field yang belum diisi
- Field wajib biasanya: Title, Description, Category, Urgency, Location
- Lihat field yang ada red asterisk (*) atau error message merah
- Isi semua field tersebut, baru bisa submit

**Q: Berapa karakter maksimum untuk deskripsi?**
A:
- Biasanya tidak ada limit ketat, tapi jangan lebih dari 5000 karakter
- Jika deskripsi panjang, pisahkan jadi paragraf
- Format dengan clear (bukan satu block teks panjang)

**Q: Bisa submit work order, tapi status tetap "Draft", tidak naik ke "Submitted"**
A:
- Tunggu 1-2 detik, server bisa perlu waktu process
- Refresh halaman
- Jika masih tetap Draft setelah 5 menit, ada error (cek notification/error message)
- Clear browser cache, coba lagi
- Hubungi IT support jika masih tidak bisa

**Q: Mau edit work order tapi tombol Edit tidak ada**
A:
- Status sudah tidak "Draft" lagi, jadi tidak bisa edit langsung
- Jika perlu perubahan:
  - Comment di work order dengan detail yang mau diubah
  - Atau hubungi manager untuk approve perubahan
  - Atau buat work order baru

**Q: Gimana cara hapus work order yang sudah submitted?**
A:
- Tidak bisa hapus setelah submitted
- Jika tidak perlu lagi, comment "Please cancel/close this work order"
- Atau hubungi manager untuk reject work order

---

## WORK ORDER - TRACKING & STATUS

**Q: Bagaimana cara lihat progress work order saya?**
A:
1. Login → Dashboard → "My Work Orders" atau "Work Requests"
2. Cari work order Anda, lihat status saat ini (warna atau text)
3. Klik work order untuk lihat detail (status timeline, comments, attachments)
4. Bisa lihat siapa technician yang handle, kapan di-assign, dll

**Q: Tidak ada update 3 hari, apakah work order saya terlupakan?**
A:
- Mungkin, tapi tidak selalu
- Comment di work order: "Cek status? Sudah 3 hari tapi belum ada progress"
- Atau hubungi manager/technician langsung
- Bisa ada alasan: parts belum datang, technician overload, priority queue, dll

**Q: Notification email work order tidak sampai**
A:
- Cek folder Spam/Junk email
- Cek apakah email di profile sudah benar
- Ada filter di email client? (Gmail folder rules, Outlook rules, dll)
- Hubungi IT jika email settings di sistem ada masalah

**Q: Work order saya sudah selesai tapi status masih "In Progress", kenapa?**
A:
- Technician lupa ubah status
- Atau system ada bug
- Comment: "Work order sudah selesai, bisa di-mark as complete?"
- Atau kirim chat/email ke technician/manager

---

## WORK ORDER - REJECTION & ISSUES

**Q: Work order saya di-reject, apa yang harus saya lakukan?**
A:
1. Baca comment dari management tentang alasan reject
2. Pahami masalahnya (mungkin informasi tidak lengkap, atau tidak urgent, dll)
3. Buat work order baru dengan perbaikan berdasarkan feedback
4. Sertakan reference dari work order yang di-reject
5. Submit ulang

**Q: Rejected karena "Information not sufficient", apa yang perlu ditambah?**
A:
1. Comment: "Bisa detail alasan apa yang kurang?" ← minta clarification
2. Atau buat work order baru dengan deskripsi lebih detail
3. Tambahkan foto jika sebelumnya tidak ada
4. Jelaskan background masalah lebih jelas

**Q: Work order approved tapi equipment masih belum beres, gimana?**
A:
1. Jangan approve sampai benar-benar fixed
2. Jika sudah approved tapi masih error, buat work order baru untuk follow-up issue
3. Referensikan work order sebelumnya
4. Jelaskan "Issue masih berlanjut, perlu follow-up perbaikan"

---

## PROFILE & DATA

**Q: Ganti nama di profile, tapi tidak muncul di work order**
A:
1. Logout dan login ulang
2. Refresh halaman browser (Ctrl+R atau F5)
3. Clear cache (Ctrl+Shift+Del)
4. Cek apakah save button benar-benar ter-klik (tunggu success notification)
5. Jika masih tidak muncul, hubungi IT

**Q: Upload foto profile gagal, error ukuran file**
A:
- Max size biasanya 5 MB
- Pilih foto lain yang lebih kecil
- Atau compress foto pake tool (online Image Compressor)
- Jika sudah di-compress tapi masih error, hubungi IT

**Q: Terhapus data profile saya, gimana recover?**
A:
- Ada backup di server, hubungi IT admin
- Jangan coba hapus lagi sampai IT bisa recover
- Minta IT untuk restore dari backup

---

## DASHBOARD & UI

**Q: Dashboard blank/tidak menampilkan work orders**
A:
1. Refresh halaman (F5)
2. Logout dan login ulang
3. Cek filter (mungkin filter set ke status yang Anda tidak punya)
4. Cek apakah ada javascript error (buka developer tools Ctrl+Shift+J)
5. Coba browser lain
6. Clear cache
7. Hubungi IT jika masih blank

**Q: Work order saya hilang dari dashboard**
A:
- Cek filter status (mungkin hilang dari view karena status change)
- Scroll down, mungkin berada di halaman selanjutnya (pagination)
- Gunakan search feature untuk cari by ID/title
- Jika tidak ketemu juga, hubungi IT

**Q: Tombol tidak bisa diklik / UI seperti hang**
A:
1. Tunggu 5-10 detik (sedang loading)
2. Cek browser console (Ctrl+Shift+J) ada error?
3. Refresh halaman
4. Close browser tab, buka ulang
5. Coba browser lain
6. Restart computer jika perlu

---

## TECHNICAL ISSUES

**Q: Loading sangat lambat, gimana?**
A:
- Cek internet connection (kecepatan, stabil?)
- Cek device (ada process yang consume resource tinggi?)
- Clear browser cache (Ctrl+Shift+Del)
- Try di browser lain
- Hubungi IT jika semua device slow

**Q: Cannot connect to server / Network error**
A:
- Cek internet connection (aktif/WiFi?)
- Cek apakah website bisa di-akses (ping server?)
- Try refresh (Ctrl+R)
- Try logout-login
- Cek status server: tanya ke IT apakah ada maintenance
- Jika persistent, hubungi IT support

**Q: Attachment/file tidak bisa di-download**
A:
- Cek internet connection
- Try di browser lain
- Try incognito/private mode
- Cek file size (mungkin network cut off untuk file besar)
- Hubungi IT jika masih tidak bisa

---

## GENERAL TROUBLESHOOTING

### Langkah-Langkah Umum Sebelum Hubungi IT

1. **Refresh browser** (F5 atau Ctrl+R)
2. **Clear cache** (Ctrl+Shift+Del → Clear all)
3. **Logout dan login ulang**
4. **Try browser lain** (Chrome, Firefox, Edge, Safari)
5. **Try dari device lain** (phone, tablet, laptop lain)
6. **Restart komputer** (turn off, turn on, wait 2 min)
7. **Jika masih error**, baru hubungi IT dengan info:
   - URL yang Anda akses
   - Error message yang muncul (screenshot)
   - Browser/device yang Anda gunakan
   - Kapan pertama kali terjadi
   - Apa yang Anda lakukan sebelum error terjadi

---

## CONTACT & ESCALATION

### Untuk Masalah Work Order
- Hubungi: Maintenance Manager / Supervisor
- Atau: Comment di work order
- Expected response: dalam 24 jam

### Untuk Masalah Technical (Login, Crash, Data Lost)
- Hubungi: IT Support / Help Desk
- Email: support@company.com atau via Zendesk ticket
- Phone: Ext. IT atau WhatsApp IT group
- Expected response: ASAP (emergency) atau dalam 1-2 jam

### Untuk Masalah Urgent (Equipment Critical, Safety Issue)
- Hubungi: IT Manager atau Director langsung
- Jangan hanya rely pada email/chat, call/visit langsung
- Expected response: Immediate

### Operating Hours
- IT Support: 8 AM - 6 PM (Mon-Fri), Emergency hotline 24/7
- Maintenance Team: Depend on shift, biasanya 7 AM - 5 PM + on-call

---

**Last Updated**: May 7, 2026

# Tutorial: Pertolongan Pertama Saat Equipment Rusak

**Prioritas Tertinggi**: Panduan ini menjelaskan prosedur 6-langkah yang WAJIB diikuti ketika ada equipment/peralatan yang rusak atau mengalami malfunction.

## Mengapa Ini Penting?

Ketika equipment rusak, respons yang cepat dan tepat sangat penting untuk:
1. **Meminimalkan downtime** (waktu equipment tidak bisa digunakan)
2. **Mencegah kerusakan lebih lanjut** (bisa jadi lebih parah kalau tidak ditangani segera)
3. **Keselamatan** (beberapa equipment bisa bahaya jika rusak)
4. **Efisiensi** (dokumentasi yang baik mempercepat perbaikan)

## Prosedur 6-Langkah Pertolongan Pertama

### Langkah 1: IDENTIFIKASI KERUSAKAN (2-5 menit)
**Tujuan**: Pahami apa yang terjadi dengan equipment

- ✓ Amati equipment dengan teliti
- ✓ Catat tanda-tanda visible (api, asap, bau aneh, suara tidak normal, tidak bisa on/off)
- ✓ Tanyakan ke pengguna equipment sebelumnya: "Kapan pertama kali terjadi? Apa yang dilakukan sebelumnya?"
- ✓ **JANGAN** coba repair sendiri jika tidak yakin
- ✓ **JANGAN** paksa tekan tombol atau gerakin bagian yang terlihat rusak

**Red Flags** (bahaya):
- Jika ada api atau asap → EVAKUASI AREA & hubungi pemadam kebakaran
- Jika ada bau chemical aneh → EVAKUASI & hubungi safety officer
- Jika ada bagian yang sangat panas → HINDARI & jangan sentuh

### Langkah 2: DOKUMENTASI DENGAN FOTO (5 menit)
**Tujuan**: Rekam kondisi equipment sebagai bukti untuk maintenance team

- ✓ Ambil foto dari berbagai sudut (depan, belakang, close-up ke bagian rusak)
- ✓ Pastikan foto jelas dan cukup terang
- ✓ Dokumentasikan error message jika ada (layar menampilkan pesan error)
- ✓ Jika ada "before" condition (equipment bagaimana saat masih normal), itu juga membantu
- ✓ **JANGAN** foto yang blur atau gelap → tidak membantu diagnosis

**Checklist Foto**:
- [  ] Foto general kondisi equipment (view luas)
- [  ] Foto bagian yang rusak/error (close-up)
- [  ] Foto layar/display jika ada error message
- [  ] Foto label serial number atau model (untuk reference)

### Langkah 3: KOMUNIKASI KE TEAM (3 menit)
**Tujuan**: Beritahu pihak yang bertanggung jawab agar siap untuk perbaikan

Hubungi atau beritahu:
- ✓ Manager/supervisor Anda
- ✓ IT/Maintenance team (jika ada contact langsung)
- ✓ Help desk atau support line (jika ada)

**Yang harus disampaikan**:
- Apa equipment-nya (nama lengkap, lokasi)
- Kapan rusak
- Gejala apa yang muncul
- Apakah sudah ada yang dicoba perbaiki
- Urgency level (low/medium/high)

**Template komunikasi**: 
"Equipment [nama] di [lokasi] rusak sejak [jam/waktu]. Gejala: [deskripsi]. Foto sudah saya ambil. Bisa diperbaiki hari ini? (High/Medium/Low urgency)"

### Langkah 4: PERSIAPAN WORK ORDER (10-15 menit)
**Tujuan**: Buat official work order di sistem sehingga maintenance team bisa track dan prioritize

**Di sistem Assignment Management**:
1. Login ke dashboard
2. Klik "New Work Order" atau "+ Create"
3. Isi field:
   - **Title**: Nama equipment yang rusak (contoh: "Printer Canon MX520 - Error Paper Jam")
   - **Description**: Detail kerusakan + langkah yang sudah dicoba
     ```
     Equipment: Printer Canon MX520 di Lantai 2, Ruang R204
     Rusak sejak: [jam] Tanggal [hari]
     Masalah: Printer tidak bisa print, keluar error "Paper Jam"
     Yang sudah dicoba: Buka compartment kertas, tidak ada kertas tersangkut
     Urgency: [Pilih: Low/Medium/High]
     ```
   - **Category**: Pilih kategori (Electrical, Mechanical, General, Software, dll)
   - **Urgency**: Set sesuai prioritas (High jika sudah mengganggu, Medium jika bisa tunda, Low jika bisa tunggu)
   - **Facility**: Facility ID tempat equipment berada
   - **Location Floor**: Lantai berapa
   - **Location Room**: Ruangan/area spesifik
   - **Location Detail**: Deskripsi lokasi (mis: "Meja utama di samping jendela")
   - **Photo**: Upload foto yang sudah diambil di step 2

4. Review semua informasi
5. Klik "Submit" atau "Create"
6. **SIMPAN** nomor Work Order ID yang dihasilkan

### Langkah 5: FOLLOW-UP & MONITORING (ongoing)
**Tujuan**: Memastikan perbaikan berjalan dan tidak ketinggalan update

- ✓ Monitor status work order di dashboard (refresh berkali-kali)
- ✓ Status bisa berubah: Draft → Submitted → Assigned → In Progress → Pending Review → Approved
- ✓ Jika ada comment dari maintenance team, BACA dengan teliti
- ✓ Jika maintenance team minta info tambahan, balas dengan cepat
- ✓ Kalau sudah selesai, verifikasi bahwa equipment benar-benar sudah normal

**Berapa lama menunggu?**
- High urgency: 1-2 hari kerja
- Medium urgency: 3-5 hari kerja
- Low urgency: 1-2 minggu
- Bisa berubah tergantung workload team

### Langkah 6: VERIFIKASI & CLOSE (5 menit, SETELAH perbaikan)
**Tujuan**: Pastikan equipment sudah fixed dan siap digunakan

Saat maintenance team bilang sudah selesai:
- ✓ Test equipment secara menyeluruh (jangan hanya sekilas)
- ✓ Verifikasi semua fungsi yang sebelumnya rusak sudah normal
- ✓ **JANGAN close work order sampai benar-benar yakin sudah ok**
- ✓ Kalau masih ada issue, comment di work order "Masih belum fixed, [deskripsi masalah]"
- ✓ Jika sudah benar-benar fixed, ubah status ke "Approved" atau biarkan system auto-close

## Situasi Khusus

### Jika Equipment SANGAT Urgent (Bisa Bikin Kerugian Besar)
- ✓ Skip langkah 2-3 yang panjang, langsung hubungi manager/IT manager secara telepon/chat urgent
- ✓ Tetap buat work order di sistem dengan urgency=HIGH
- ✓ Di description, tulis "URGENT - perlu diperbaiki hari ini"
- ✓ Jika ada, mention dampak business ("equipment ini diperlukan untuk production line")

### Jika Equipment SUDAH TIDAK BISA DIPERBAIKI (Total Loss)
- ✓ Dokumentasi dengan foto sebanyak-banyaknya (untuk insurance/warranty claim)
- ✓ Catat kondisi sebelum rusak (jika ada info)
- ✓ Di work order, set category "Equipment Replacement" atau mention di description
- ✓ Biarkan maintenance team & management handle replacement process

### Jika Tidak Tahu Apa yang Rusak (Software/Hardware)
- ✓ Tetap buat work order dengan deskripsi "unsure if software or hardware issue"
- ✓ Maintenance team akan diagnosa
- ✓ Jangan set terlalu urgent jika tidak tahu kritikalitasnya

### Jika Work Order Submitted Tapi Tidak Ada Progress Dalam 2 Hari
- ✓ Comment di work order: "Cek status please, sudah 2 hari tapi belum ada progress"
- ✓ Atau hubungi IT manager secara langsung
- ✓ Jangan buat work order baru untuk issue yang sama

## Safety Checklist

Sebelum mulai, yakinkan hal ini:

**Keselamatan Pengguna**:
- [  ] Area sekitar equipment sudah aman
- [  ] Tidak ada orang yang sedang bekerja dengan equipment itu
- [  ] Jalur escape jelas jika ada bahaya (api, ledakan, dll)

**Keselamatan Equipment**:
- [  ] Jangan coba repair tanpa izin/pengetahuan
- [  ] Jangan buka bagian dalam equipment kecuali trained
- [  ] Jangan tuang air ke equipment electronic
- [  ] Jangan paksa tekan tombol atau bagian yang stuck

**Dokumentasi**:
- [  ] Foto sudah diambil (jangan lupa backup di cloud/email)
- [  ] Work order sudah dibuat
- [  ] ID work order sudah disimpan/diingatkan

## FAQ Pertolongan Pertama

**Q: Gimana kalau tidak ada foto/dokumentasi?**
A: Tetap buat work order, tapi jelaskan deskripsi se-detail mungkin. Maintenance team mungkin minta foto tambahan dari lokasi.

**Q: Kalau maintenance team sibuk, berapa lama?**
A: Bisa lebih lama dari target SLA. Tapi mereka akan update di work order jika ada delay.

**Q: Boleh coba repair sendiri?**
A: TIDAK DISARANKAN kecuali Anda trained. Bisa membuat lebih parah. Lebih baik report via work order.

**Q: Equipment rusak tapi jarang dipakai, perlu urgent?**
A: Tidak perlu. Set urgency=Low. Maintenance team akan repair sesuai jadwal.

**Q: Siapa yang bayar kalau equipment tidak bisa diperbaiki?**
A: Itu tanggung jawab management/procurement. Anda hanya perlu report via work order.

---

**Ingat**: Respons cepat + dokumentasi baik = Perbaikan cepat! 

**Last Updated**: May 7, 2026

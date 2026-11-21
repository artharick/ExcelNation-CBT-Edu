# Panduan Menjalankan ExcelNation CBT Edu secara Online

Isi paket ini sudah lengkap: server (`server.js`, tanpa dependensi), aplikasi (`ExcelNation-CBT-Edu.html`), ikon, serta berkas Docker/Caddy/systemd. Server hanya membutuhkan **Node.js 18 ke atas** (atau Docker).

> **Kenapa harus HTTPS?** Mode layar penuh, Safe Exam Browser, dan keamanan login hanya bekerja baik di alamat `https://`. Karena itu langkah di bawah selalu memakai domain + HTTPS.

## Pilih jalur

| Jalur | Cocok untuk | Catatan |
|---|---|---|
| **A. VPS + Docker (disarankan)** | Ujian sungguhan | Menyala terus, data aman di disk, HTTPS otomatis |
| **B. VPS tanpa Docker** | Sama dengan A | Sedikit lebih manual |
| **C. Hosting gratis (Render/Koyeb/dll.)** | Uji coba saja | Biasanya mati saat sepi dan disk bisa terhapus — **jangan** untuk ujian sungguhan tanpa cadangan |
| **D. PC/laptop sekolah + Wi-Fi sekolah** | Tanpa biaya | Siswa harus di jaringan yang sama; lihat `PANDUAN-APLIKASI.md` |

---

## Jalur A — VPS + Docker (±20 menit)

**Yang dibutuhkan:** VPS Linux (Ubuntu 22.04/24.04, RAM 512 MB–1 GB sudah cukup untuk puluhan siswa), sebuah **domain** (atau subdomain) yang bisa Anda arahkan ke IP VPS.

1. **Arahkan domain** ke IP VPS: buat *A record* `cbt.namadomain.id → IP_VPS` di panel domain Anda. Tunggu beberapa menit.
2. **Masuk ke VPS** (SSH) lalu pasang Docker:
   ```bash
   curl -fsSL https://get.docker.com | sudo sh
   ```
3. **Unggah isi paket ini** ke VPS (misalnya ke folder `/opt/excelnation`) memakai `scp`, FileZilla, atau `unzip`:
   ```bash
   sudo mkdir -p /opt/excelnation && cd /opt/excelnation
   # (unggah zip ke sini lalu)
   sudo unzip excelnation-cbt-online.zip -d . && cd excelnation-cbt-online
   ```
4. **Isi pengaturan:**
   ```bash
   cp .env.example .env
   nano .env        # isi DOMAIN=cbt.namadomain.id  dan  TEACHER_CODE=kode-guru-baru
   ```
5. **Buka port** (jika memakai firewall ufw): `sudo ufw allow 80,443/tcp`
6. **Jalankan:**
   ```bash
   sudo docker compose up -d --build
   ```
7. Buka `https://cbt.namadomain.id` di HP/laptop. Sertifikat HTTPS dibuat otomatis (butuh 10–60 detik pertama kali).

**Perintah berguna:** lihat log `sudo docker compose logs -f app` · berhenti `sudo docker compose down` · perbarui aplikasi: ganti `ExcelNation-CBT-Edu.html`/`server.js` lalu `sudo docker compose up -d --build`.

## Jalur B — VPS tanpa Docker

```bash
# 1) Node.js 20 + Caddy (HTTPS otomatis)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy

# 2) Aplikasi
sudo useradd -r -s /usr/sbin/nologin excelnation
sudo mkdir -p /opt/excelnation/data
sudo cp server.js ExcelNation-CBT-Edu.html manifest.webmanifest icon-192.png icon-512.png /opt/excelnation/
sudo chown -R excelnation:excelnation /opt/excelnation
sudo cp excelnation.service /etc/systemd/system/
sudo nano /etc/systemd/system/excelnation.service    # hapus tanda # pada TEACHER_CODE dan isi kode baru
sudo systemctl daemon-reload && sudo systemctl enable --now excelnation

# 3) HTTPS: salin Caddyfile.tanpa-docker, ganti domainnya, jalankan ulang Caddy
sudo cp Caddyfile.tanpa-docker /etc/caddy/Caddyfile && sudo nano /etc/caddy/Caddyfile
sudo systemctl reload caddy
```
Cek: `curl http://127.0.0.1:8080/healthz` harus menjawab `ok`.

## Jalur C — Hosting gratis (hanya uji coba)

Buat *Web Service* dari berkas paket ini (atau repositori GitHub berisi isi paket). **Build command:** kosongkan · **Start command:** `node server.js` · **Environment:** `TEACHER_CODE=...`. Paket gratis umumnya: tertidur otomatis saat sepi (siswa menunggu ±1 menit), dan tidak menjamin disk permanen. Jadi **unduh Cadangan (Backup) dari aplikasi sebelum dan sesudah setiap uji coba**.

---

## Pengaturan penting

| Variabel | Fungsi |
|---|---|
| `TEACHER_CODE` | Kode akses guru. **Ganti dari bawaan.** Tidak pernah dikirim ke siswa; diperiksa di server |
| `DATA_DIR` | Folder penyimpanan data (taruh di disk permanen) |
| `TRUST_PROXY=1` | Aktifkan jika di belakang Caddy/Nginx (agar pembatasan percobaan per alamat IP benar) |
| `PORT`, `HOST` | Port dan alamat dengar (bawaan 8080 / 0.0.0.0) |

## Data & cadangan

- Semua data ada di `data/excelnation-data.json`. Server menyimpannya tiap beberapa detik dan saat dimatikan.
- **Cadangan otomatis harian** tersimpan di `data/backups/` (14 hari terakhir). Salin folder `data/` ke tempat lain secara berkala (mis. unduh lewat SFTP).
- Cadangan lewat aplikasi (menu Pengaturan → Cadangan) tetap dianjurkan setelah setiap ujian.
- Memulihkan: hentikan server, ganti `excelnation-data.json` dengan salinan cadangan, jalankan lagi.

## Keamanan yang sudah ada di server

- Kode guru **tidak ada** di berkas yang dikirim ke siswa. Login guru diperiksa server, menghasilkan sesi 12 jam; salah 6 kali → terkunci 15 menit.
- Soal ujian dan kunci jawaban **tidak dikirim** ke siswa sebelum kode ujian benar dan waktu ujian tiba. Kode ujian salah 10 kali → terkunci 5 menit.
- Siswa hanya bisa menulis jawabannya sendiri; kunci, hasil, dan bank soal hanya terbaca guru.
- Berkas HTML dikirim terkompresi (±1 MB) agar hemat kuota siswa.

## Batasan yang perlu Anda ketahui

1. Siswa masuk dengan **kata sandi bersama** (`ExcelNation123`) dan memilih namanya. Siswa yang paham teknis dan tahu NIS temannya secara teori bisa mengirim jawaban atas nama teman (hanya jawaban ujian teman itu). Pengawasan guru di panel Monitor tetap penting. Jika ingin lebih ketat, PIN per siswa bisa ditambahkan.
2. Keamanan layar penuh/SEB adalah pencegah, bukan jaminan mutlak; Safe Exam Browser umumnya tidak tersedia di Android.
3. Satu server dengan satu berkas data cocok untuk satu sekolah/kelas (puluhan siswa serentak). Untuk ratusan siswa serentak, perlu arsitektur lain.
4. Setelah server dimulai ulang, siswa yang sedang ujian tetap aman (jawaban tersimpan di perangkatnya dan tersinkron kembali); sesi guru perlu masuk ulang.

## Daftar periksa sebelum hari ujian

- [ ] `https://alamat-anda` terbuka dari HP siswa (bukan hanya dari laptop Anda).
- [ ] Ganti `TEACHER_CODE`, lalu login guru berhasil.
- [ ] Buat 1 ujian uji coba (kode & jadwal), kerjakan dari 2 HP, matikan Wi-Fi sebentar lalu nyalakan — jawaban harus tetap tersinkron.
- [ ] Coba blokir/buka blokir dari panel Monitor.
- [ ] Unduh Cadangan, restart server, pastikan data masih ada.
- [ ] Hapus ujian uji coba, lalu unggah soal sebenarnya.

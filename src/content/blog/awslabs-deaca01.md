---
title: "AWS Data Engineering (DEA-C01) Labs Summary & Review Guide"
description: "Panduan review AWS Certified Data Engineer – Associate (DEA-C01): lab S3 lifecycle, pipeline data, batasan emulator Floci, dan cheat sheet AWS CLI."
pubDate: "2026-05-31 15:15:00"
tags: ["data-engineering-analytics"]
categories: ["Data Engineering and Analytics"]
math: false
lang: id
---

## Dokumentasi Komprehensif: Hands-on Practice vs Emulator Floci Limitations

Dokumen ini dirancang sebagai bahan review materi sertifikasi **AWS Certified Data Engineer - Associate (DEA-C01)** sekaligus panduan teknis (*cheat sheet*) jika Anda ingin melakukan *hands-on* ulang di masa mendatang. Dokumen ini merangkum 4 skenario arsitektur data yang telah dipraktikkan, lengkap dengan perintah AWS CLI, analisis kegagalan emulator `floci`, serta solusi alternatif (*workaround*) yang diterapkan.

---

## 🏛️ Perbandingan Fundamental: AWS Cloud vs Emulator (Floci)

Sebelum masuk ke setiap skenario, pahami perbedaan mindset ini untuk kebutuhan ujian dan pekerjaan nyata:
* **AWS Cloud (Dunia Nyata):** Skalabel, aman, digerakkan oleh *background workers* otomatis, dan mematuhi standar arsitektur ketat (seperti isolasi jaringan/VPC). Kegagalan biasanya disebabkan oleh salah konfigurasi IAM, masalah jaringan (routing/security group), atau keterbatasan kuota.
* **Emulator Floci (`http://10.8.0.28:4566`):** Meniru API AWS di level permukaan (*mocking*). Floci menerima perintah CLI Anda dan merespons seolah-olah sukses (HTTP 200), namun sering kali tidak mengeksekusi logika di belakang layar (*asynchronous processes*), menggunakan mesin lokal alternatif (seperti DuckDB untuk Athena), atau bahkan belum mengimplementasikan API tertentu (*UnsupportedOperation*).

---

## 📂 Skenario 1: Data Storage & S3 Lifecycle Policies
### 🎯 Tujuan Arsitektur & Konsep DEA-C01
Mengelola siklus hidup data (*Data Lifecycle*) secara otomatis untuk mengoptimalkan biaya penyimpanan (*Cost Optimization*). Data mentah yang baru masuk disimpan di kelas penyimpanan murah, dipindahkan ke kelas penyimpanan arsip setelah tidak aktif, dan dihapus secara otomatis setelah masa retensi habis.

* **Core Concepts:** S3 Bucket, Storage Classes (Standard, Infrequent Access, Glacier Instant/Flexible/Deep Archive), Lifecycle Rules (Transitions & Expiration).

### 🛠️ Cheat Sheet Perintah AWS CLI
1.  **Membuat Bucket S3:**
    ```bash
    aws --profile rnd s3 mb s3://toko-buku-logs
    ```
2.  **Menerapkan Kebijakan Lifecycle (JSON):**
    ```bash
    aws --profile rnd s3api put-bucket-lifecycle-configuration \
        --bucket toko-buku-logs \
        --lifecycle-configuration file://lifecycle.json
    ```
    *Isi file `lifecycle.json`:*
    ```json
    {
      "Rules": [
        {
          "ID": "MoveToGlacierAndExpire",
          "Status": "Enabled",
          "Filter": {"Prefix": "logs/"},
          "Transitions": [
            {"Days": 30, "StorageClass": "GLACIER"}
          ],
          "Expiration": {"Days": 90}
        }
      ]
    }
    ```

### 🚨 Floci Bug & Skenario "Plot Twist"
* **Masalah di Emulator:** Floci berhasil menerima file konfigurasi JSON dan mengembalikan status sukses. Namun, **Floci tidak memiliki background worker (cron job) aktif** untuk memindai objek S3 setiap hari. 
* **Dampak:** File yang Anda upload ke `s3://toko-buku-logs/logs/` akan tetap berada di kelas `STANDARD` selamanya dan tidak akan pernah berpindah ke `GLACIER` atau terhapus secara otomatis setelah 90 hari.
* **Insight Ujian:** Di AWS asli, aturan Lifecycle dievaluasi sekali sehari pada tengah malam UTC. Transisi ke Glacier memiliki batas ukuran minimum objek (beberapa kelas menerapkan minimum 128 KB) dan ada biaya transisi per objek.

---

## ⚡ Skenario 2: Event-Driven Processing (SQS + Lambda)
### 🎯 Tujuan Arsitektur & Konsep DEA-C01
Membangun arsitektur tanpa server (*Serverless*) yang terurai (*Decoupled Architecture*). Ketika ada transaksi masuk, sistem tidak langsung memprosesnya secara sinkron (yang bisa membuat sistem down jika traffic melonjak), melainkan mengantrekan pesan di SQS. AWS Lambda kemudian bertindak sebagai konsumen yang mengambil pesan secara otomatis (*Event Source Mapping*) untuk diproses ke database.

* **Core Concepts:** Loose Coupling, Message Queuing, Dead Letter Queue (DLQ), Lambda Event Source Mapping, Visibility Timeout.

### 🛠️ Cheat Sheet Perintah AWS CLI
1.  **Membuat Antrean SQS:**
    ```bash
    aws --profile rnd sqs create-queue --queue-name TransaksiQueue
    ```
2.  **Membuat Fungsi Lambda:**
    ```bash
    aws --profile rnd lambda create-function \
        --function-name ProsesTransaksi \
        --runtime python3.11 \
        --role arn:aws:iam::000000000000:role/dummy-role \
        --handler lambda_function.lambda_handler \
        --zip-file fileb://function.zip
    ```
3.  **Menghubungkan SQS ke Lambda (Event Source Mapping):**
    ```bash
    aws --profile rnd lambda create-event-source-mapping \
        --event-source-arn arn:aws:sqs:us-east-1:000000000000:TransaksiQueue \
        --function-name ProsesTransaksi \
        --batch-size 10
    ```

### 🚨 Floci Bug & Skenario "Plot Twist"
* **Masalah di Emulator:** Komponen ini relatif stabil di Floci untuk fungsi-fungsi dasar. Namun, Floci sangat menyederhanakan manajemen IAM Role dan *Concurrency*. Di AWS asli, Lambda membutuhkan *Execution Role* dengan policy `AWSLambdaSQSQueueExecutionRole` agar bisa melakukan polling ke SQS.
* **Insight Ujian:** Pahami konsep **Visibility Timeout** di SQS (waktu di mana pesan disembunyikan dari konsumen lain saat sedang diproses). Jika Lambda butuh waktu 30 detik untuk berjalan, Visibility Timeout SQS minimal harus di-set ke 30 detik agar pesan tidak diproses dua kali oleh instans Lambda lain.

---

## 🔄 Skenario 3: Change Data Capture (CDC) via AWS DMS
### 🎯 Tujuan Arsitektur & Konsep DEA-C01
Melakukan replikasi data secara *real-time* dari database operasional/OLTP (PostgreSQL RDS) ke database target NoSQL (DynamoDB) tanpa mengganggu performa aplikasi utama. Setiap ada operasi `INSERT`, `UPDATE`, atau `DELETE` di Postgres, perubahan tersebut langsung disadap dan dikirim ke target.

* **Core Concepts:** Change Data Capture (CDC), AWS Database Migration Service (DMS), Replication Instance, Source & Target Endpoints, Write-Ahead Logs (WAL), Logical Replication.

### 🚨 Floci Bug & Skenario "Plot Twist" (Kegagalan Total Eksperimen)
Skenario ini adalah titik di mana emulator Floci menunjukkan keterbatasan teknis terbesarnya:

1.  **Error `UnsupportedOperation` pada DB Subnet Group:**
    Saat mencoba membuat grup subnet jaringan untuk RDS, Floci mengembalikan pesan error arsitektur tingkat tinggi. Hal ini terjadi karena kode *backend* emulator Floci belum mengimplementasikan API `CreateDBSubnetGroup`.
2.  **Bypass Jaringan & Endpoint Palsu (`localhost:7002`):**
    Saat dipaksa membuat RDS instance tanpa parameter jaringan, Floci memberikan status `Available` dengan alamat endpoint `localhost:7002`. Namun, saat dicek langsung di PC Host (`ict-metmar`):
    * Perintah `sudo ss -tulpn | grep 7002` tidak menemukan proses apa pun yang *listen* di port tersebut.
    * Container Docker Postgres baru tidak pernah dinyalakan oleh Floci. Yang ada hanyalah container Postgres lama di port standar `5432`.
    * **Kesimpulan:** Status `Available` pada RDS tersebut hanyalah *mocking* (palsu) teks JSON, tidak ada mesin database fisik yang berjalan di port 7002.
3.  **Ketiadaan Fitur AWS DMS:**
    Floci versi lokal/gratis tidak mengimplementasikan mesin replikasi AWS DMS (Replication Instance), sehingga proses CDC sesungguhnya tidak bisa disimulasikan secara *hands-on*.

### 💡 Workaround Dunia Nyata: Konsep Bastion Host
Saat mencoba menghubungkan script Python dari laptop ke port RDS, kita sempat mengalami *Connection Refused*. Kita mencoba mengatasinya menggunakan **SSH Port Forwarding (SSH Tunneling)**:
```bash
ssh -N -L 7002:localhost:7002 ict@10.8.0.28
```
**Insight DEA-C01:** Pola ini 100% akurat dengan arsitektur produksi di AWS. RDS yang berisi data sensitif wajib ditaruh di **Private Subnet** (tanpa IP Publik). Untuk mengaksesnya dari luar cloud, *Data Engineer* harus terhubung melalui **Bastion Host / Jump Box** di *Public Subnet* menggunakan SSH Tunneling demi menjaga keamanan data.

---

## 📈 Skenario 4: Real-Time Streaming & Analytics (Kinesis + S3 + Athena)
### 🎯 Tujuan Arsitektur & Konsep DEA-C01
Menangkap data aliran berskala besar (*streaming data* seperti klik website atau koordinat GPS) secara *real-time*, mengumpulkannya dalam beberapa waktu (*buffering*), menyimpannya ke dalam *Data Lake* (S3), dan menganalisisnya menggunakan SQL tanpa server (*Serverless Querying*).

* **Core Concepts:** Kinesis Data Streams (Shards, Partition Keys), Kinesis Data Firehose (Delivery Stream, Buffering Size/Interval), Schema-on-Read, Apache Hive Partitioning (YYYY/MM/DD/HH).

### 🛠️ Cheat Sheet Perintah AWS CLI
1.  **Membuat Kinesis Stream:**
    ```bash
    aws --profile rnd kinesis create-stream --stream-name clickstream-data --shard-count 1
    ```
2.  **Membuat Kinesis Firehose (Mengalirkan Stream ke S3):**
    ```bash
    aws --profile rnd firehose create-delivery-stream \
        --delivery-stream-name clickstream-firehose \
        --delivery-stream-type KinesisStreamAsSource \
        --kinesis-stream-source-configuration "KinesisStreamARN=arn:aws:kinesis:us-east-1:000000000000:stream/clickstream-data,RoleARN=arn:aws:iam::000000000000:role/dummy-role" \
        --extended-s3-destination-configuration "RoleARN=arn:aws:iam::000000000000:role/dummy-role,BucketARN=arn:aws:s3:::streaming-data-lake"
    ```
3.  **Eksekusi Query Athena via CLI:**
    ```bash
    aws --profile rnd athena start-query-execution \
        --query-string "<PERINTAH_SQL>" \
        --result-configuration OutputLocation=s3://athena-query-results/
    ```

### 🚨 Floci Bug & Skenario "Plot Twist" (The DuckDB Hack)
Skenario ini penuh dengan tantangan teknis yang membutuhkan manipulasi mesin internal emulator:

1.  **Firehose Buffer Stuck:**
    Meskipun skrip Python sukses mengirim ratusan data ke Kinesis Stream, Firehose di emulator gagal memicu pembuangan (*flush*) data ke S3 secara otomatis bahkan setelah ditunggu selama 15 menit. Hal ini karena mekanisme asinkron Firehose tidak berjalan sempurna di Floci.
    * *Workaround:* Kita bertindak sebagai Firehose manual dengan meng-upload file format NDJSON (`dummy-stream.json`) ke S3 sesuai struktur folder waktu: `s3://streaming-data-lake/2026/05/31/12/`.
2.  **Mesin Asli Terbongkar: DuckDB vs Presto/Trino:**
    Saat mencoba menjalankan query SQL, terungkap bahwa Floci tidak menggunakan mesin asli Athena (Presto/Trino), melainkan menggunakan **DuckDB** di latar belakang (`floci-duck execute returned...`).
3.  **Error 1: Parser Error Skema `default`:**
    Sintaks standar Athena `SELECT * FROM default.nama_tabel` ditolak oleh DuckDB karena kata `default` dianggap sebagai *reserved keyword* sistem yang merusak struktur pembacaan parser.
    * *Fix:* Hapus prefiks skema, cukup panggil nama tabelnya langsung.
4.  **Error 2: Kebodohan Parser Floci pada `CREATE TABLE`:**
    Saat menjalankan perintah DDL `CREATE EXTERNAL TABLE ...`, Floci secara membabi buta membungkus seluruh query ke dalam fungsi export data DuckDB: `COPY (CREATE EXTERNAL TABLE ...) TO 's3://...'`. Ini adalah cacat logika emulator karena tindakan membuat tabel tidak bisa dieksport sebagai data hasil query. Akibatnya, kita tidak bisa membuat objek tabel di dalam database.
5.  **Error 3: Masalah Titik Koma (`;`):**
    Menaruh titik koma di akhir query membuat DuckDB error karena posisinya berada di dalam tanda kurung fungsi pembungkus otomatis Floci: `(SELECT ... ORDER BY DESC;) TO ...`.
    * *Fix:* Jangan pernah menaruh titik koma di akhir perintah query jika menggunakan Athena di emulator Floci.

### 🥷 Solusi Akhir: Eksploitasi Fitur DuckDB (Bypass DDL)
Karena kita tahu bahwa di belakang layar yang berjalan adalah DuckDB, kita memanfaatkan keunggulan fitur *Schema-on-Read* bawaan DuckDB. Kita **tidak perlu membuat tabel terlebih dahulu**. Kita bisa langsung menyuruh Athena/DuckDB membaca file mentah JSON di S3 sebagai tabel dinamis menggunakan alamat path S3-nya langsung:

```sql
SELECT event, COUNT(*) as total_event 
FROM 's3://streaming-data-lake/2026/05/31/12/dummy-stream.json' 
GROUP BY event 
ORDER BY total_event DESC
```
**Hasil:** Langkah ini sukses besar mendapatkan status **"SUCCEEDED"** dan berhasil mengekstrak hasil analitik agregat data streaming.

---

## 🎯 Poin Penting Pengingat Ujian (DEA-C01 Focus)
* **Kinesis Data Streams vs Firehose:** Streams bersifat *real-time* (butuh koding konsumen, data bertahan 24 jam - 365 hari). Firehose bersifat *near real-time* (tanpa koding, otomatis kirim ke S3/Redshift dengan jeda buffer minimum 60 detik / 1MB).
* **Schema-on-Read vs Schema-on-Write:** Athena menganut *Schema-on-Read* (skema dipasang saat data dibaca). Database relasional (RDS) menganut *Schema-on-Write* (skema harus ada sebelum data dimasukkan).
* **Athena Pricing:** Biaya dihitung murni berdasarkan jumlah data (dalam hitungan Terabyte) yang *discan/disapu* oleh query di S3. Mengubah format JSON menjadi **Parquet atau ORC** (format kolom) sangat disarankan untuk menghemat biaya karena mengurangi jumlah data yang perlu dibaca.

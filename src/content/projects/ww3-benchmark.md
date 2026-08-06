---
title: "InaWaves / WW3 Performance Benchmark on BMKG DRC"
description: "Benchmark performa WAVEWATCH III / InaWaves di DRC BMKG Bali: MPI/OMPG/OMPH, resource optimal, dan bandingkan dengan legacy HPC."
pubDate: "2026-08-02"
tags: ["WW3", "InaWaves", "HPC", "benchmark", "ocean", "BMKG"]
categories: ["Ocean modelling"]
math: true
lang: id
---

> **English abstract.** Performance benchmark of **InaWaves** (WAVEWATCH III®) on BMKG’s Disaster Recovery Center in Bali: which parallelization option (MPI / OMPG / OMPH) and node/core/thread layout runs operational nested-domain wave forecasts most efficiently versus the legacy Marine Data Center stack. Written for operators and metocean data engineers who need reproducible HPC choices, not just peak FLOPS.

Laporan singkat performa **InaWaves** (WAVEWATCH III®) di Disaster Recovery Center (DRC) BMKG Bali — backup Marine Data Center (MDC) Jakarta dalam proyek Marine Meteorology System Phase 1 (MMS1). Fokusnya: opsi parallelization paling efisien dan konfigurasi node/core/thread untuk operasional.

Tim: MMS1 Technical Team, Center for Marine Meteorology (dukungan Atos Eviden).

## Konteks

DRC menjalankan InaWaves sebagai alternatif standalone jika MDC tidak tersedia. InaWaves dibangun di atas [WAVEWATCH III®](https://github.com/NOAA-EMC/WW3) (NCEP/NOAA): model gelombang generasi ketiga yang menyelesaikan *random phase spectral action density balance* untuk spektrum wavenumber–arah. Untuk benchmark ini hanya dipakai `ww3_multi` (paralel, multi-domain).

Forecast operasional: hingga 10 hari, timestep jam-jaman, empat domain nested:

| Domain | Resolusi (°) | Wilayah | Time integration (s) |
| --- | ---: | --- | ---: |
| global | 1 | 0–360E, 70S–70N | 3600 |
| regional | 0.5 | 80–160E, 30S–30N | 1800 |
| super regional | 0.25 | 85–150E, 20S–20N | 900 |
| hires | 0.0625 | 90–145E, 15S–15N | 600 |

## Metodologi

Integrasi dibatasi **6 jam** (domain tetap). Stack:

- WW3 **7.14**
- Intel ifort/icc **2021.5.0**, Intel MPI **2021.5**, GCC 8.5.0
- Scheduler **SLURM**, launcher **`srun`** (sedikit lebih baik dari `mpirun` pada beberapa konfigurasi multi-node)

### Opsi model (SWITCH)

| Opsi | Peran |
| --- | --- |
| **MPI** | Pure MPI (distributed memory) |
| **OMPG** | OpenMP eksklusif atau hybrid MPI–OpenMP |
| **OMPH** | Hybrid MPI–OpenMP saja |

Metrik: **init time**, **elapsed time**, plus

$$
S = \frac{T_1}{T_N}, \qquad E = \frac{S}{N} \times 100\%
$$

dengan $T_1$ baseline (1 node/core) dan $T_N$ waktu pada $N$ resource.

Alur: compile tiga SWITCH → bandingkan opsi pada skenario yang sama → pilih opsi terbaik → sweep node/core/thread → kumpulkan init/elapsed dari log `ww3_multi`.

## Hasil

### Opsi model (cores & threads, 1 node)

Konfigurasi terbaik di fase ini: **96 ntasks/node, 48 cores, 2 threads/core** → elapsed **158.27 s** (OMPG) dan **133.64 s** (OMPH). MPI terbaik di **96 cores × 1 thread** (~156.71 s). Secara keseluruhan **OMPH** paling konsisten (init + elapsed lebih pendek).

| Threads/core | Cores | ntasks/node | Elapsed MPI | Elapsed OMPG | Elapsed OMPH |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 96 | 96 | 156.71 | 193.51 | 180.20 |
| 1 | 48 | 48 | 185.37 | 185.34 | 188.10 |
| 1 | 24 | 24 | 295.86 | 295.76 | 293.82 |
| 2 | 48 | 96 | — | **158.27** | **133.64** |
| 4 | 24 | 96 | — | 200.47 | 145.77 |
| 2 | 24 | 48 | — | 226.14 | 190.30 |

`-` = run terhenti / tidak tersedia.

### Scaling antar node

Dengan ntasks/node & cpus-per-task yang sesuai opsi: **8 nodes** optimal untuk OMPG/OMPH; MPI peaking lebih awal (~4 nodes pada tes yang tersedia).

| Nodes | Elapsed MPI | Elapsed OMPG | Elapsed OMPH |
| ---: | ---: | ---: | ---: |
| 1 | 156.71 | 158.27 | 133.64 |
| 2 | 132.28 | 110.20 | 85.30 |
| 4 | 110.93 | 88.93 | 66.87 |
| 8 | — | **79.92** | **58.98** |

OMPH unggul karena hybrid shared + distributed memory mengurangi overhead komunikasi antar proses/node. Versi ini dipakai untuk sweep resource berikutnya.

### Konfigurasi resource (OMPH)

Sweep: pertumbuhan logaritmik threads-per-core (tasks/node) × pertumbuhan linear jumlah node.

- **Init time** turun logaritmik seiring naik thread: ~62 → 31 → 16 → 9 → 5.5 → 3.8 s untuk 1, 2, 4, 8, 16, 32 threads.
- **Elapsed time** berbentuk “valley”: optimal biasanya **8 threads**; di 1–2 nodes optimal di 2–4 threads. Melewati 8 threads, elapsed naik lagi.
- **12 nodes × 8 threads** paling cepat (~34 s), tetapi gain 10→12 nodes kecil dibanding 6→8.
- **Speed-up** mendekati linear hingga ~8 threads; di atas itu skalabilitas jatuh tajam (hingga 32 threads).

**Rekomendasi produksi:** **8 nodes · 12 cores/node · 8 threads/core**. Konfigurasi ekstrem (terlalu sedikit/banyak thread atau node) sering gagal — dugaan: thread contention dan bottleneck komunikasi antar node.

### Vs legacy supercomputer

Skenario sama: 4 nested domains, forecast **10 hari**.

| Metrik | Legacy | DRC (config optimal) |
| --- | ---: | ---: |
| Elapsed | ~2600 s | ~740 s |
| Init | ~420 s | ~10 s |

| Hardware | Legacy | DRC |
| --- | --- | --- |
| CPU | Intel Xeon E5-2670 v3 @ 2.30 GHz | AMD EPYC 7642 48-Core @ 2.30 GHz |
| Cores/socket | 12 | 48 |
| Threads/core | 2 | 1 |
| Sockets | 2 | 2 |
| RAM | 126 GB | 256 GB |

Gain datang dari hardware lebih baru **dan** model OMPH (legacy hanya default MPI).

## Kesimpulan

1. **OMPH** adalah opsi WW3 paling efisien di antara MPI, OMPG, dan OMPH pada DRC.
2. Konfigurasi operasional: **8 nodes, 12 cores/node, 8 threads/core**.
3. DRC jauh lebih cepat dari legacy untuk InaWaves 10-hari (~3.5× elapsed, init jauh lebih rendah).

## Referensi

- NOAA-EMC, *The WAVEWATCH III Framework* (2024). [github.com/NOAA-EMC/WW3](https://github.com/NOAA-EMC/WW3)
- Tolman, H. L. (2002). Distributed-memory concepts in the wave model WAVEWATCH III. *Parallel Computing*, 28(1), 35–52.
- WAMDIG (1988). The WAM model — A third generation ocean wave prediction model. *Journal of Physical Oceanography*, 18, 1775–1810.
- Rautenbach, C., Mullarney, J. C., & Bryan, K. R. (2021). Parallel computing efficiency of SWAN 40.91. *Geoscientific Model Development*, 14(7), 4241–4247.

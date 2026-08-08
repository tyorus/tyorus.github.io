---
title: "Install WaveWatch3 versi 7.14"
description: "Tutorial instalasi WAVEWATCH III (WW3) 7.14 dengan cmake: requirements, clone, compiler, dan troubleshooting build model gelombang."
pubDate: "2024-09-14 07:00:00"
tags: ["model","ocean"]
categories: ["Oceanography","Modelling"]
math: true
lang: id
---

> **English intro.** Practical guide to building **WAVEWATCH III 7.14** with `cmake` (not the older `make` flow): compilers, dependencies, clone, configure, and common build failures when standing up a wave-model stack for metocean work.

Model [WaveWatch3](https://github.com/NOAA-EMC/WW3/tree/develop) versi terbaru (7.14) dapat diinstall menggunakan bantuan `cmake`, alih-alih menggunakan `make` sebagaimana instalasi versi sebelumnya. 

Versi bundle WaveWatch3 tersedia untuk versi 6.17, sehingga distribusi versi 7.14 sepenuhnya melalui repository [github](https://github.com/NOAA-EMC/WW3/tree/develop).

## Requirements

Sistem harus terinstall compiler dan beberapa libraries pendukung, serta yang terpenting `cmake` untuk compilation.

## Installation

Merujuk ke [manual WW3](https://github.com/NOAA-EMC/WW3/tree/develop/model), berikut adalah langkah untuk instalasi WW3.

```bash
# Optionally set compiler and env vars to locate libraries, adjust with your system
export CC=icc
export FC=ifort
export NetCDF_ROOT=/path/to/netcdf

# Clone and build WW3
git clone https://github.com/NOAA-EMC/WW3.git
cd WW3
mkdir build && cd build
cmake .. -DSWITCH=/path/to/switch_NCEP_st2 -DCMAKE_INSTALL_PREFIX=install
make
make install # skip untuk step ini jika tidak memiliki akses root user
cp bin/* ../model/bin
```


## Test Cases

Test cases dapat dijalankan menggunakan program wrapper `run_cmake_test` didalam folder `~/WW3/regtest/bin`.


## Troubleshooting

Rujuk [forum WW3](https://github.com/NOAA-EMC/WW3/issues) untuk bantuan troubleshooting. Apabila cmake sudah terinstall, maka error pada saat compilation biasanya disebabkan oleh incompatibility dari settingan compiler yang digunakan dengan yang tersedia didalam sistem. Atau karena beberapa dependencies belum terinstall. Sebagai info, proses compilation menggunakan `cmake` lebih sedikit error daripada menggunakan `make` menurut pengalaman pribadi.

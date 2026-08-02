---
title: "Uji Hipotesis Statistik: Penerapannya dalam Meteorologi/Klimatologi"
description: ""
pubDate: "2022-11-28 07:00:00"
tags: ["met","stat"]
categories: ["Meteorology & Climatology","Statistics"]
math: true
---

Sebuah uji hipotesis statistik dilakukan berdasarkan data sampel untuk menguji apakah hipotesis yang diajukan dapat diterima atau ditolak. Dalam hal ini, hipotesis statistik mengacu pada asumsi mengenai parameter populasi[^1].

> <details>
    <summary>Table of Contents</summary>
    <ul style="list-style: none">
        <li>
            <a href="/blog/uji-hipotesis/#langkah">Langkah</a>
            <ol>
                <li><a href="/blog/uji-hipotesis/#1-ajukan-hipotesis">Ajukan hipotesis</a></li>
                <li><a href="/blog/uji-hipotesis/#2-tentukan-level-signifikan">Tentukan level signifikan</a></li>
                <li><a href="/blog/uji-hipotesis/#3-tentukan-uji-statistik">Tentukan uji statistik</a></li>
                <li><a href="/blog/uji-hipotesis/#4-interpretasi-hasil">Interpretasi hasil</a></li>
            </ol>
        </li>
        <li>
            <a href="/blog/uji-hipotesis/#contoh-penerapan">Contoh penerapan</a>
            <ol>
                <li><a href="/blog/uji-hipotesis/#1-merumuskan-hipotesis">Merumuskan hipotesis</a></li>
                <li><a href="/blog/uji-hipotesis/#2-menentukan-level-signifikan">Menentukan level signifikan</a></li>
                <li><a href="/blog/uji-hipotesis/#3-melakukan-uji-statistik">Melakukan uji statistik</a></li>
                <li><a href="/blog/uji-hipotesis/#4-menentukan-level-kritis">Menentukan level kritis</a></li>
                <li><a href="/blog/uji-hipotesis/#5-interpretasi-hasil">Interpretasi hasil</a></li>
            </ol>
        </li>
        <li><a href="/blog/uji-hipotesis/#implementasi-di-ncl">Implementasi di NCL</a></li>
    </ul>

## Langkah

### 1. Ajukan hipotesis

Terdapat dua jenis hipotesis dalam statistik, yaitu hipotesis nol (H0) dan hipotesis alternatif (H1). H0 diajukan dengan asumsi bahwa sampel data tidak dipengaruhi oleh penyebab tertentu atau murni karena probabilitas. Sementara, H1 diajukan dengan asumsi bahwa sampel data dipengaruhi oleh penyebab tertentu.

### 2. Tentukan level signifikan

Diterima atau tidaknya hipotesis bergantung pada area dimana nilai probabilitas itu berada. Ingat bahwa probabilitas memiliki rentang nilai 0 hingga 1. Dalam hal ini, area penentu diterima tidaknya hipotesis ditentukan oleh kita sendiri. Tidak ada batasan yang pasti berapa nilai yang dijadikan acuan, namun level signifikan yang biasa dipakai bernilai 0.01, 0.05, dan 0.1.

### 3. Tentukan uji statistik

Uji statistik dilakukan untuk menghasilkan nilai p-value yang nantinya digunakan sebagai penentu apakah hipotesis yang diajukan sebelumnya diterima atau ditolak. Terdapat beberapa jenis uji statistik yang bisa digunakan, bergantung pada seperti apa sampel data yang digunakan [^2].

### 4. Menentukan level kritis ($\alpha$)

Area lingkup probabilitas dibatasi berdasarkan dua jenis, satu sisi dan dua sisi. Apabila satu sisi, maka level kritis sama dengan level signifikan. Sementara, apabila dua sisi, maka level kritis bernilai positif dan negartif level signifikan per dua ($ \pm \frac{\alpha}{2} $)[^3].

![Level signifikan](https://raw.githubusercontent.com/tyolabs/tyolabs.github.io/a9b87a086ce96e89ad52dad97de11abf22340206/img/posts/stat_siglevel.png)
<p style="text-align: center; font-size: 14px">Level signifikan.</p>

### 5. Interpretasi hasil

Jika p-value berada diluar level signifikan, maka H0 ditolak atau H1 diterima dan data sampel dipengaruhi oleh penyebab tertentu. Begitu juga sebaliknya, jika p-value berada pada level signifikan, maka H0 diterima atau H1 ditolak dan data sampel tidak dipengaruhi oleh suatu penyebab tertentu (murni karena probabilitas).

## Contoh penerapan

Dalam studi meteorologi atau klimatologi, seringkali kita mengkaji suatu fenomena dan menghubungkannya dengan variabel meteorologi. Pada contoh ini, kita akan mencoba melakukan uji signifikansi apakah [*cold surge* (CS) dan *cross equatorial northerly surge* (CENS)](/blog/cold-surge-cross-equatorial-northerly-surge/) berpengaruh terhadap [transpor uap air](/blog/transpor-uap-air/) ketika berpropagasi di Benua Maritim Bagian Barat.

Data yang digunakan adalah data model ERA5, rentang tahun 2010-2019 dengan resolusi temporal harian.

### 1. Merumuskan hipotesis

H0 = rata-rata variabel transpor uap air saat kejadian CS dan CENS sama dengan rata-rata variabel secara keseluruhan.
H1 = rata-rata variabel transpor uap air saat kejadian CS dan CENS tidak sama dengan rata-rata variabel secara keseluruhan.

### 2. Menentukan level signifikan ($ \alpha $)

Level signifikan yang diambil bernilai 5% atau 0.05.

### 3. Melakukan uji statistik

Uji statistik dilakukan dengan menggunakan uji student-t dua sisi[^3]. Berikut merupakan formulanya.

$$
t = \frac{\overline{x_1} - \overline{x_2}} {\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}}
$$
di mana $\overline{x}$, $\overline{s}$, dan $n$ masing-masing merupakan rata-rata, varians, dan jumlah sampel data. Sementara itu, subscript 1 dan 2 menandakan variabel saat kejadian CS atau CENS dan rata-rata secara keseluruhan. Dalam hal ini, perhitungan statistik dilakukan untuk tiap grid spasial.Data tiap grid dihitung dengan memanfaatkan fungsi `ttest`[^4] yang telah tersedia di NCL. Perhitungan ini menghasilkan p-value dan nilai t.

### 4. Menentukan level kritis

Oleh karena uji statistik dilakukan menggunakan metode student-t test dua sisi, maka level kritis adalah $\pm \frac{\alpha}{2}$. Sehingga, level signifikan menjadi 2.5% untuk masing-masing sisi. Nilai 2.5% dalam uji signifikansi termasuk dalam kategori kuat (*substantial*) (Wilks, 2019).[3]

### 5. Interpretasi hasil

H0 diterima apabila p-value berada pada rentang $ \pm \frac{\alpha}{2} $. Sedangkan H0 ditolak apabila p-value bernilai lebih besar atau kurang dari sama dengan nilai $ \pm \frac{\alpha}{2} $. Dengan ditolaknya H0, maka perbedaan variabel saat kejadian CS atau CENS dengan variabel pada kondisi reratanya dapat dikatakan bermakna atau signifikan secara statistik.

## Implementasi di NCL

```js

begin

    ; use function for calculate t and p-value
    undef ("signif")
    function signif(xavg, xvar, xn, yavg, yvar, yn)
    begin
        iflag           = False                     ; population variance similar
        tval_opt        = False                     ; p-value only
        prob            = ttest(xavg,xvar,xn,yavg,yvar,yn,iflag,tval_opt)

        pval            = (/prob/)
        pval@long_name  = "probability"
        copy_VarCoords(xavg,pval)
        diff            = xavg - yavg
        diff@long_name  = "difference of the means"
        copy_VarCoords(xavg,diff)

        return ([/ xavg, diff, pval /])
    end

    ;;------------------------------------------------------------------------------------------:
    ;                                         MAIN CODE
    ;;------------------------------------------------------------------------------------------:

    ; input data

    xncs   = 32 ; number of CS days
    xncens = 31 ; number of CENS days
    yn     = 53 ; monthly average (nov-mar, 2010-2019)  
    pathin = "../data/#/"

    ;---iuq_ivq : integrated moisture flux (zonal & meridional)

    xiuqcsavg    = fmb1cs->iuqcsmean(:,:,:)
    xiuqcsvar    = fmb1cs->iuqcsvari(:,:,:)
    xivqcsavg    = fmb1cs->ivqcsmean(:,:,:)
    xivqcsvar    = fmb1cs->ivqcsvari(:,:,:)

    xiuqcensavg  = fmb1cens->iuqcensmean(:,:,:)
    xiuqcensvar  = fmb1cens->iuqcensvari(:,:,:)
    xivqcensavg  = fmb1cens->ivqcensmean(:,:,:)
    xivqcensvar  = fmb1cens->ivqcensvari(:,:,:)

    yiuqavg_     = dim_avg_n(fmb2->iuq(:,:,:),0)
    yiuqvar_     = dim_variance_n(fmb2->iuq(:,:,:),0)
    yivqavg_     = dim_avg_n(fmb2->ivq(:,:,:),0)
    yivqvar_     = dim_variance_n(fmb2->ivq(:,:,:),0)

    yiuqavg      = new((/21, 141, 121/), typeof(yiuqavg_), yiuqavg_@_FillValue)
    yiuqvar      = new((/21, 141, 121/), typeof(yiuqavg_), yiuqavg_@_FillValue)
    yivqavg      = new((/21, 141, 121/), typeof(yiuqavg_), yiuqavg_@_FillValue)
    yivqvar      = new((/21, 141, 121/), typeof(yiuqavg_), yiuqavg_@_FillValue)

    printMinMax(xiuqcsavg,0)
    print("xiuqcsvar")
    printMinMax(xiuqcsvar,0)
    printMinMax(xivqcsavg,0)
    print("xivqcsvar")
    printMinMax(xivqcsvar,0)
    printMinMax(xiuqcensavg,0)
    print("xiuqcensvar")
    printMinMax(xiuqcensvar,0)
    printMinMax(xivqcensavg,0)
    print("xivqcensvar")
    printMinMax(xivqcensvar,0)
    print(" ")

    do i=0, 20
        yiuqavg(0:0,:,:) = (/yiuqavg_/)
        yiuqvar(0:0,:,:) = (/yiuqvar_/)
        yivqavg(0:0,:,:) = (/yivqavg_/)
        yivqvar(0:0,:,:) = (/yivqvar_/)

        yiuqavg_        := yiuqavg(0:0,:,:)
        yiuqvar_        := yiuqvar(0:0,:,:)
        yivqavg_        := yivqavg(0:0,:,:)
        yivqvar_        := yivqvar(0:0,:,:)

        yiuqavg(i,:,:)   = yiuqavg_
        yiuqvar(i,:,:)   = yiuqvar_
        yivqavg(i,:,:)   = yivqavg_
        yivqvar(i,:,:)   = yivqvar_
    end do

;---{del}.[iuq, ivq] : Vertically Integrated Moisture flux divergence

    xvimfdcsavg     = fmb1cs->vimfdcsmean(:,:,:)
    xvimfdcsvar     = fmb1cs->vimfdcsvari(:,:,:)

    xvimfdcensavg   = fmb1cens->vimfdcensmean(:,:,:)
    xvimfdcensvar   = fmb1cens->vimfdcensvari(:,:,:)

    yvimfdavg_      = dim_avg_n(fmb2->vimfd(:,:,:),0)
    yvimfdvar_      = dim_variance_n(fmb2->vimfd(:,:,:),0)

    printMinMax(xvimfdcsavg,0)
    printMinMax(xvimfdcsvar,0)
    printMinMax(xvimfdcensavg,0)
    printMinMax(xvimfdcensvar,0)
    printMinMax(yvimfdavg_,0)
    printMinMax(yvimfdvar_,0)

    yvimfdavg       = new((/21, 141, 121/), typeof(yvimfdavg_), yvimfdavg_@_FillValue)
    yvimfdvar       = new((/21, 141, 121/), typeof(yvimfdavg_), yvimfdavg_@_FillValue)

    ;printVarSummary(yvimfdavg_)
    ;printVarSummary(yvimfdavg)

    do i=0, 20
        yvimfdavg(0:0,:,:)  = (/yvimfdavg_/)
        yvimfdvar(0:0,:,:)  = (/yvimfdvar_/)

        yvimfdavg_         := yvimfdavg(0:0,:,:)
        yvimfdvar_         := yvimfdvar(0:0,:,:)

        yvimfdavg(i,:,:)    = yvimfdavg_
        yvimfdvar(i,:,:)    = yvimfdvar_
    end do

    ;---Calculate significance

    ;--iuq_ivq
    print("SIGNIF IUQ_IVQ")
    iuqcs      = signif(xiuqcsavg,xiuqcsvar,xncs,yiuqavg,yiuqvar,yn)
    ivqcs      = signif(xivqcsavg,xivqcsvar,xncs,yivqavg,yivqvar,yn)
    iuqcens    = signif(xiuqcensavg,xiuqcensvar,xncens,yiuqavg,yiuqvar,yn)
    ivqcens    = signif(xivqcensavg,xivqcensvar,xncens,yivqavg,yivqvar,yn)

    ;--{del}.[iuq, ivq]
    print("SIGNIF VIMFD")
    vimfdcs      = signif(xvimfdcsavg,xvimfdcsvar,xncs,yvimfdavg,yvimfdvar,yn)
    vimfdcens    = signif(xvimfdcensavg,xvimfdcensvar,xncens,yvimfdavg,yvimfdvar,yn)

    ;printVarSummary(iuqcs[0])
    ;printVarSummary(iuqcs[1])
    ;printVarSummary(iuqcs[2])
    ;printVarSummary(ivqcs[0])
    ;printVarSummary(ivqcs[1])
    ;printVarSummary(ivqcs[2])

    ;===========================================================================================;
    ;                                       Write NetCDF
    ;===========================================================================================;

    diro                = "./"
    filo                = "moisture_transport.nc"
    ptho                = diro+filo
    system("/bin/rm -f "+ptho)
    ncdf                = addfile(ptho,"c")

    fAtt = True
    fAtt@title          = "moisture transport - CS/CENS"
    fAtt@source         = "ECMWF"
    fAtt@Conventions    = "None"
    fAtt@creation_date  = systemfunc("date")
    fileattdef(ncdf,fAtt)             ; copy file attributes
    
    filedimdef(ncdf,"timelag",-1,True)   ; make time an UNLIMITED dimension

    ncdf->iuqcsmean   = iuqcs[0]
    ncdf->iuqcsdiff   = iuqcs[1]
    ncdf->iuqcspval   = iuqcs[2]
    ncdf->iuqcensmean = iuqcens[0]
    ncdf->iuqcensdiff = iuqcens[1]
    ncdf->iuqcenspval = iuqcens[2]

    ncdf->ivqcsmean   = ivqcs[0]
    ncdf->ivqcsdiff   = ivqcs[1]
    ncdf->ivqcspval   = ivqcs[2]
    ncdf->ivqcensmean = ivqcens[0]
    ncdf->ivqcensdiff = ivqcens[1]
    ncdf->ivqcenspval = ivqcens[2]
    
    ncdf->vimfdcsmean   = vimfdcs[0]
    ncdf->vimfdcsdiff   = vimfdcs[1]
    ncdf->vimfdcspval   = vimfdcs[2]
    ncdf->vimfdcensmean = vimfdcens[0]
    ncdf->vimfdcensdiff = vimfdcens[1]
    ncdf->vimfdcenspval = vimfdcens[2]

end

```


Script diatas menghasilkan output file berformat `*.netcdf` yang nantinya divisualisasikan menggunakan GrADS untuk diinterpretasikan hasil dari uji signifikansinya. Supaya tidak terlalu panjang, kita akan lanjutkan proses visualisasi dan interpretasi di postingan berikut [Visualisasi Uji Signifikansi Statistik Menggunakan GrADS](/blog/visualisasi-uji-signifikansi-statistik-menggunakan-grads/).

## Notes

[^1]: Kata parameter digunakan untuk menyatakan properti sebenarnya dari suatu populasi, sedangkan statistik didasarkan pada properti suatu sampel yang diambil secara acak dari suatu populasi.
[^2]: [https://www.statology.org/hypothesis-testing/](https://www.statology.org/hypothesis-testing/)
[^3]: Wilks, D., 2019, Frequentist Statistical Inference, in Statistical Methods in the Atmospheric Sciences, Elsevier Ltd, Amsterdam.
[^4]: [https://www.ncl.ucar.edu/Document/Functions/Built-in/ttest.shtml](https://www.ncl.ucar.edu/Document/Functions/Built-in/ttest.shtml)

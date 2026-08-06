---
title: "Transpor Uap Air"
description: "Transpor uap air (vertically integrated moisture flux / VIMF): konsep meteorologi dan implementasi perhitungan di NCL."
pubDate: "2022-10-17 09:00:00"
tags: ["met","physical meteorology"]
categories: ["Meteorology & Climatology"]
math: true
lang: id
---

Sebagaimana yang kita tahu, air di permukaan dan atmosfer bumi secara kontinu mengalami transformasi dari satu fase ke fase lain. Proses dauriah semacam itu terjadi karena bertujuan untuk menjaga keseimbangan komponen air di laut, darat, dan atmosfer. 

Meskipun komposisinya tidak lebih dari 4%, air -yang berfase gas atau uap air- di atmosfer memegang peranan sangat penting dalam dinamika cuaca dan iklim. Uap air berpindah dari tempat asalnya di laut ke daratan atau dari satu tempat ke tempat lain dibantu oleh sirkulasi atmosfer yang prosesnya dikenal sebagai transpor uap air. Istilah transpor uap air juga dikenal sebagai [*vertically integrated moisture flux*](/blog/moisture-flux-divergence/).

Transpor uap air tidak hanya berperan penting dalam siklus hidrologi. Dari perspektif meteorologi, proses ini juga berperan dalam mengatur masa hidup dari fenomena cuaca tertentu seperti siklon tropis, sistem konvektif skala meso, *cold surge*, hingga *atmospheric river*, yang pada akhirnya bertanggung jawab sebagai faktor dominan dalam bencana hidrometeorologi.

## Formula

Pada dasarnya, transpor uap air merupakan salah satu komponen yang terdapat di persamaan [anggaran air atmosfer (*atmospheric water budget*)](/blog/budget-air-atmosfer/).

$$
E-P = \frac{\partial <q>}{\partial t} + \nabla \cdot <q\vec{V}> + \frac{\partial <q\omega>}{\partial p} \tag{1}
$$
dimana

$$
<\cdot> = \frac{1}{g} \int_{ps}^{pt} (\cdot) dp
$$
$ E-P = $ Evaporasi-Presipitasi $(mm)$<br>
$ q   = $ kelembapan spesifik $(kg/kg)$<br>
$ \vec{V} = $ komponen angin horizontal (u dan v) $(m/s)$<br>
$ \omega = $ kecepatan vertikal $(Pa/s)$<br>
$ p = $ tekanan $(hPa)$; $ps =$ tekanan permukaan; $pt =$tekanan lapisan atas (biasanya 100 hPa)<br>
$ g = $ gravitasi $(m/s^2)$<br>
$ t = $ waktu $(s)$<br>
<!---$ \nabla = $cek paper Moisture and Energy Budget Perspectives on Summer Drought in North China--><br>

Transpor uap air merupakan besaran vektor. Pada Pers. 1, transpor uap air termasuk dalam suku kedua $$ (<q\vec{V}>) $$. Untuk mengetahui daerah mana yang menjadi hulu dan hilir (*source and sink*) dari transpor uap air, maka besaran vektor harus diubah menjadi skalar melalui proses divergensi atau konvergensi $$ (\nabla \cdot <q\vec{V}>) $$.

$$
<q\vec{V}> = \frac{1}{g} \int_{1000mb}^{100mb} (q\vec{V}) dp \tag{2}
$$
Transpor uap air, berdasarkan Pers. 2, dikenal juga sebagai *vertically integrated moisture flux*. Simbol *nabla* ($\nabla$) merupakan operator divergen horizontal, yang mentransformasikan besaran vektor (transpor uap air, $$ (<qV>) $$) ke besaran skalar (divergensi transpor uap air, $$ (\nabla \cdot <qV>) $$). $\nabla = \left(\frac{\partial}{\partial x}\right)\hat{i} + \left(\frac{\partial}{\partial y}\right)\hat{j}.$

## Implementasi di NCL

Transpor uap air dapat dikalkulasi berdasarkan data reanalisis menggunakan parameter angin horizontal ($u$ dan $v$), dan kelembapan spesifik (q). Lapisan atmosfer dapat disesuaikan dari lapisan permukaan (atau 1000 hPa) hingga lapisan atas troposfer (biasanya 100 hPa).

```

begin

undef("moisture_transport")
function moisture_budget(time[*]:numeric,p,u,v,q,omega,npr[1]:integer,lat,lon,opt[1]:logical)
begin
    ;;------------------------------------------------------------------------------------------:
    ; Nomenclature
    ; time    - "seconds since ..."
    ; p       - Pressure [Pa]
    ; u,v     - zonal, meridional wind components[m/s]
    ; q       - specific humidity [kg/kg]
    ; npr     - dimension number corresponding to pressure dimension
    ; lat     - dimension corresponding to latitude dimension, used for advection and divergence
    ; lon     - dimension corresponding to latitude dimension
    ; opt     - set to False
    ; uq, vq, iuq, ivq, mfd, vimfd
    ; uq      - zonal moisture flux
    ; vq      - meridional moisture flux
    ; iuq     - vertically integrated zonal moisture flux
    ; ivq     - vertically integrated meridional moisture flux
    ; mfd     - moisture flux divergence
    ; vimfd   - vertically integrated moisture flux divergence
    ;;------------------------------------------------------------------------------------------:
    ;																						
    ;  Moisture transport and its divergence
    ;  {del}.<[u*q, v*q]>
    ;  <.>   = 1/g * Int_ps->ptop(.)
    ;
    ;;------------------------------------------------------------------------------------------:

    print("Starting function moisture_transport for ")

    ;*******************************************
    ;---Compute moisture flux  {(kg/kg)/s}
    ;*******************************************

    uq                      = u*q                                         ; (:,:,:,:)
    uq@long_name            = "Zonal Moisture Flux [uq]"
    uq@units                = "["+u@units+"]["+q@units+"]"                ; [m/s][kg/kg]     
    copy_VarCoords(u,uq)                                                  ; (time,level,lat,lon)

    vq                      = v*q                                         ; (:,:,:,:)
    vq@long_name            = "Meridional Moisture Flux [vq]"
    vq@units                = "["+v@units+"]["+q@units+"]" 
    copy_VarCoords(v,vq)                                                  ; (time,level,lat,lon)

    ;*******************************************
    ;---Horizontal Divergence of moisture flux: uv2dv_cfd => regional 'fixed' rectilinear grid
    ;*******************************************
    
    mfd                    = uv2dv_cfd(uq, vq, lat, lon, 2)              ; (time,level,lat,lon)
    copy_VarCoords(q, mfd)
    mfd@long_name          = "Horizontal Divergence of Moisture Flux"
    mfd@units              = "(kg/kg*s)"                                 ; (1/m)*[(m/s)(g/kg)] => [g/(kg-s)]

    ;********************************************
    ;---Vertical integration
    ; [Joule]      kg-m2/s2 = N-m = Pa/m3 = W-s           ; energy           
    ;********************************************

    ptop            = 10000.0                           ; Pa
    pbot            = 100000.0
    vopt            = 1                                 ; weighted vertical sum

    g               = 9.80665                           ; [m/s2] gravity at 45 deg lat used by the WMO
    dp              = dpres_plevel_Wrap(p,pbot,ptop,0)
    dpg             = dp/g                              ; Pa/(m/s2)=> (Pa-s2)/m   
    dpg@long_name   = "Layer Mass Weighting"
    dpg@units       = "kg/m**2"                         ; dp/g     => Pa/(m/s2) => [kg/(m-s2)][m/s2] reduce to (kg/m2)
                                                        ;             Pa (s2/m) => [kg/(m-s2)][s2/m]=>[kg/m2]

    ;-Vertically Integrated Horizontal Moisture flux

    uq_dpg          = uq*dpgq                         ; mass weighted 'uq'; [m/s][g/kg][kg/m2]=>[m/s][g/kg]
    iuq             = dim_sum_n(uq_dpg, 1)
    iuq@long_name   = "Integrated Zonal UQ [uq*dpg]" 
    iuq@LONG_NAME   = "Sum: Mass Weighted Integrated Zonal Moisture Flux [uq*dpg]" 
    iuq@units       = "[m/s][g/kg]"
    copy_VarCoords(u(:,0,:,:), iuq)                ; (time,lat,lon)
    delete(uq_dpg)

    vq_dpg          = vq*dpgq                         ; mass weighted 'vq'; [m/s][g/kg][kg/m2]=>[m/s][g/kg] 
    ivq             = dim_sum_n(vq_dpg, 1)
    ivq@long_name   = "Integrated Meridional VQ [vq*dpg]" 
    ivq@LONG_NAME   = "Sum: Mass Weighted Integrated Meridional Moisture Flux [vq*dpg]" 
    ivq@units       = "[m/s][g/kg]"
    copy_VarCoords(v(:,0,:,:), ivq)                ; (time,lat,lon)
    delete(vq_dpg)
    
    ;-Vertically Integrated Horizontal Moisture flux Divergence

    mfd_dpg        = mfd*dpgq                         ;  [g/(kg-s)][kg/m2] => [g/(m2-s)]
    imfd           = dim_sum_n(mfd_dpg, 1)
    imfd@long_name = "Integrated Mass Wgt MFD" 
    imfd@LONG_NAME = "Integrated Mass Weighted Moisture Flux Divergence" 
    imfd@units     = "(kg/m**2)/s"
    copy_VarCoords(u(:,0,:,:), imfd)               ; (time,lat,lon)
    delete(mfd_dpg)

    vimfd           =  imfd                           ; keep meta data                         
    ; VIMFD           = -VIMFD                          ; Note the preceding -1 [negative precedes integration] 
    vimfd@long_name = "Vertically Integrated Moisture Flux Divergence"
    vimfd@units     = "(kg/m**2)/s"
    vimfd@info      = "Term 2 in moisture budget eq."
    
    print("")
    print("Function moisture_transport is done")
    print("========================")

    return( [/ uq, vq, iuq, ivq, mfd, vimfd /] )
end
```


## Output

Gambar berikut merupakan transpor uap air berikut dengan divergensinya pada kejadian *cold surge* selama periode tahun 2010-2019.

![Transpor uap air](/img/posts/vimfd.png)
<p style="text-align: center; font-size: 14px">Transpor uap air berikut dengan divergensinya pada kasus <em>cold surge</em> (CS) dan <em>cross equatorial northerly surge</em> (CENS). Nilai positif (negatif) menandakan divergensi (konvergensi) dari transpor uap air.</p>

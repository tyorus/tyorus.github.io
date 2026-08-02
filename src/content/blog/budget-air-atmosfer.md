---
title: "Budget Air Atmosfer"
description: ""
pubDate: "2022-10-24 10:00:00"
tags: ["met","physical meteorology"]
categories: ["Meteorology & Climatology"]
math: true
---

## Formula

Persamaan *budget* air atmosfer (*atmospheric water budget*) didasarkan pada konsep konservasi atau kekekalan uap air pada koordinat tekanan atmosfer.[^1]

$$
\frac{dq}{dt} = S \tag{1}
$$
dimana

$$
\frac{d}{dt} = \frac{\partial}{\partial t} + u\frac{\partial}{\partial x} + v\frac{\partial}{\partial y} + \omega \frac{\partial}{\partial p}
$$
$u$ dan $v$ merupakan komponen angin horizontal ($m/s$), $\omega$ merupakan kecepatan vertikal pada koordinat tekanan atmosfer ($Pa/s$), $q$ merupakan kelembapan spesifik ($g/kg$), dan $S$ merupakan simpanan (*storage*) uap air di atmosfer. $S = e-c$ (evaporasi minus kondensasi pada parsel udara).

Berdasarkan persamaan kontinuitas massa,

$$
\frac{\partial u}{\partial x} + \frac{\partial v}{\partial y} + \frac{\partial \omega}{\partial p} = 0
$$
Pers. 1 dapat diubah ke bentuk *flux*

$$
\frac{\partial q}{\partial t} + \underbrace{u \frac{\partial q}{\partial x} + v \frac{\partial q}{\partial y} + \omega \frac{\partial q}{\partial p}}_\text{advection term} + \underbrace{q \left( \frac{\partial u}{\partial x} + \frac{\partial v}{\partial y} + \frac{\partial \omega}{\partial p} \right)}_\text{divergence term} = e-c \tag{2}
$$
$$
\frac{\partial q}{\partial t} + \underbrace{\frac{\partial \left( qu \right)}{\partial x} + \frac{\partial \left( qv \right)}{\partial y} + \frac{\partial \left( q\omega \right)}{\partial p}}_\text{flux form} = e-c
$$
$$
\underbrace{\frac{\partial q}{\partial t}}_\text{local rate of change} + \underbrace{\nabla \cdot \left( q\vec{V} \right)}_\text{horizontal MFD} + \underbrace{\frac{\partial \left( q\omega \right)}{\partial p}}_\text{vertical MFD} = e-c \tag{3}
$$
MFD merupakan [*moisture flux divergence*](/blog/moisture-flux-divergence/).

Pers. 3 berlaku untuk lapisan atmosfer tertentu. Apabila kita integrasikan dari lapisan atmosfer permukaan ($ps$) hingga lapisan troposfer atas ($pt$), maka didapatkan persamaan berikut.

$$
E-P = \frac{\partial <q>}{\partial t} + \nabla \cdot <q\vec{V}> + \frac{\partial <q\omega>}{\partial p} \tag{4}
$$
dimana

$$
<\cdot> = \frac{1}{g} \int_{ps}^{pt} (\cdot) dp
$$
$E-P =$ evaporasi minus presipitasi.<br>
$\frac{\partial <q>}{\partial t} =$ kecenderungan atau *tendency* dari *precipitable water*.<br>
$\nabla \cdot <q\vec{V}> =$ divergensi horizontal dari [transpor uap air](/blog/transpor-uap-air/).<br>
$\frac{\partial <q\omega>}{\partial p} =$ divergensi vertikal dari transpor uap air.<br>

## Implementasi di NCL

*Budget* air atmosfer dapat dikalkulasi berdasarkan data reanalisis menggunakan parameter angin horizontal ($u$ dan $v$), kelembapan spesifik (q), dan kecepatan vertikal ($Pa/s$). Lapisan atmosfer dapat disesuaikan dari lapisan permukaan (atau 1000 hPa) hingga lapisan atas troposfer (biasanya 100 hPa). Persamaan *budget* air atmosfer biasanya dikalkulasi untuk rata-rata wilayah tertentu.

```

undef("moisture_budget")
function moisture_budget(time[*]:numeric,p,u,v,q,omega,npr[1]:integer,lat,lon,opt[1]:logical)
begin
    ;;------------------------------------------------------------------------------------------:
    ; Nomenclature
    ; time    - "seconds since ..."
    ; p       - Pressure [Pa]
    ; u,v     - zonal, meridional wind components[m/s]
    ; q       - specific humidity [kg/kg]
    ; omega   - vertical velocity [Pa/s]
    ; npr     - dimension number corresponding to pressure dimension
    ; lat     - dimension corresponding to latitude dimension, used for advection and divergence
    ; lon     - dimension corresponding to latitude dimension
    ; opt     - set to False
    ;;------------------------------------------------------------------------------------------:
    ;																						
    ;  Moisture budget
    ;  e - c = dq/dt + {del}.[u*q, v*q] + d(omega*q)/dt
    ;  E - P = d<q>/dt + {del}.<[u*q, v*q]> + d<(omega*q)>/dt
    ;  <.>   = 1/g * Int_ps->ptop(.)
    ;
    ;;------------------------------------------------------------------------------------------:

    print("========================")
    print("Starting function moisture_budget")
    print("")

    ;*******************************************
    ;---Compute local dq/dt  {(kg/kg)/s}
    ;*******************************************

    dqdt                    = center_finite_diff_n (q,time,False,0,0)     ; 'time' is 'seconds since'
    copy_VarCoords(q, dqdt)
    dqdt@longname           = "Spesific humidity: Local Time derivative"
    dqdt@units              = "(kg/kg)/s"
    ;printVarSummary(dqdt)
    ;printMinMax(dqdt,0)
    ;print("-----")  

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

    ;*******************************************
    ;---Vertical Divergence of moisture flux: uv2dvF => global 'fixed' rectilinear grid
    ;*******************************************

    dqdp                    = center_finite_diff_n (q,p,False,1,npr)
    copy_VarCoords(q, dqdp)
    dwq                     = omega*dqdp   
    copy_VarCoords(q, dwq)  
    dwq@long_name           = "Vertical Divergence of Moisture Flux"
    dwq@units               = "(kg/kg)/s"
    ;printVarSummary(dwq)
    ;printMinMax(dwq,0)
    ;print("-----")  

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
                    
    ;-Precipitable water tendency

    dpgq            = conform(q,dpg,1)
    pw              = wgt_vertical_n(q,dpgq,vopt,1)
    copy_VarCoords(q(:,0,:,:),pw)
    pw@long_name    = "Precipitable water"
    pw@units        = "kg/m**2"
    
    pwdt            = center_finite_diff_n (pw,time,False,0,0)
    copy_VarCoords(q(:,0,:,:),pwdt)
    pwdt@long_name  = "Precipitable water tendency"
    pwdt@units      = "(kg/m**2)/s"
    pwdt@info       = "Term 1 in moisture budget eq."    
    
    delete(pw)
    
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
    
    ;-Vertically Integrated Vertical Moisture flux Divergence

    dpgdwq          = conform(dwq,dpg,1)
    idwq            = wgt_vertical_n(dwq,dpgdwq,vopt,1)
    copy_VarCoords(q(:,0,:,:),idwq)
    idwq@long_name  = "Integrated vertical moisture flux divergence"
    idwq@units      = "(kg/m**2)/s"
    idwq@info       = "Term 3 in moisture budget eq."

    print("")
    print("Function moisture_budget is done")
    print("========================")

    return( [/dqdt, pwdt, uq, vq, iuq, ivq, mfd, vimfd, dwq, idwq/] )
end

```

## Contoh Output

Gambar berikut menampilkan komponen dari persamaan *budget* air atmosfer tanpa mengikutsertakan suku ketiga (*vertical MFD*). Gambar divisualisasikan menggunakan GrADS[^2].

![Transpor uap air](/img/posts/moisturebudget.png)
<p style="text-align: center; font-size: 14px">Komponen dari persamaan <em>budget</em> air atmosfer untuk kasus <em>cold surge</em> (CS) dan <em>cross equatorial northerly surge</em> (CENS) selama periode tahun 2010-2019</p>

## Notes

[^1]: Banacos, P. C., & Schultz, D. M. (2005). The Use of Moisture Flux Convergence in Forecasting Convective Initiation: Historical and Operational Perspectives, Weather and Forecasting, 20(3), 351-366. [https://doi.org/10.1175/WAF858.1](https://doi.org/10.1175/WAF858.1)
[^2]: Ploting multiple panel semacam output diatas seringkali cukup membosankan apabila kita mengaturnya satu per satu. Menggunakan metode iterasi tentu lebih efisien untuk menyelesaikan pekerjaan berulang. Cek postingan berikut [Looping untuk Plotting Multi Panel di GrADS](/blog/multi-panel-plot-di-grads/)

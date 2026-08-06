---
title: "Looping untuk Plotting Multi Panel di GrADS"
description: "Tutorial multi-panel plot di GrADS: set parea vs set vpage, looping layout, dan tips colorbar untuk visualisasi meteorologi."
pubDate: "2022-11-14 07:00:00"
tags: ["met","data visualization"]
categories: ["Meteorology & Climatology"]
math: true
---

Untuk memplot banyak panel di GrADS, kita bisa menggunakan perintah `set parea`[^1] atau `set vpage`[^2]. Fungsi keduanya serupa, namun implementasinya tidak sama dan kadang mungkin cukup membingungkan bagi yang baru belajar GrADS.

Sederhananya, `set parea` memungkinkan kita untuk lebih leluasa untuk memplot beberapa panel sesuai dengan ukuran dan posisi display. Namun, kita harus mengerti di posisi mana dan koordinat display berapa panel tersebut ingin di plot.

Di lain sisi, perintah `set vpage` lebih memudahkan kita dalam melakukan plotting sebanyak panel yang ingin kita plot. Perintah ini akan menentukan sendiri posisi panel sesuai dengan urutan yang kita inginkan. Perintah ini terdengar lebih menjanjikan karena kita tinggal menginput berapa banyak panel yang ingin diplot, dan `vpage` dengan sendirinya akan menentukan posisi dan koordinat display panel tersebut. Namun, perintah ini justru sering menghasilkan ruang kosong antar panel dan kita tidak bisa leluasa untuk mengatur `colorbar`[^3] karena pasti akan terplot di panel terakhir.

## GrADS display

Terdapat dua posisi display di GrADS, yaitu posisi landscape dan posisi portrait.
![GrADS display](/img/posts/GrADS/gradsdisplay.png)
<p style="text-align: center; font-size: 14px">GrADS display. 11 x 8.5 merupakan koordinat display tanpa satuan.</p>

Dalam postingan ini, kita akan fokus pada posisi landscape.

## Looping menggunakan `set parea`

Jika kita ingin melakukan banyak plot di satu display, jelas sangat melelahkan untuk mengaturnya satu persatu. Maka, kita bisa memanfaatkan metode iterasi menggunakan perintah `while` di GrADS. Perlu dicatat bahwa metode iterasi di GrADS hanya `while` loop, tidak ada perintah `for` loop.

Pada contoh di bawah, kita akan mencoba memplot 8 panel (2 baris x 4 kolom) hasil dari olah data [*budget* air atmosfer](/blog/budget-air-atmosfer/). Tampilan outputnya akan seperti ini.

![*budget* air atmosfer](/img/posts/moisturebudget.png)

Output diatas bisa kita peroleh jika didalam folder instalasi GrADS sudah terdapat script tambahan sebagai berikut.

1. `plot.gs`
2. `legend.gs`
3. `parsestr.gsf` (agar script `plot.gs` dan `legend.gs` bisa dijalankan)

File script diatas bisa diperoleh melalui link berikut [Bin Guan's GrADS Script Library](http://bguan.bol.ucla.edu/bGASL.html). Karena merupakan script tambahan, kita harus menambahkan sendiri di folder instalasi GrADS (`~\OpenGrADS-2.2\Contents\Resources\Scripts`).

```
'reinit'

*-------------
*Setting parea
*-------------
*Setting according to the landscape coordinate display
*Important steps!

*Setting x coordinate
sxx=1                   ;*left boundary 
exx=10.8                ;*right boundary
ddxx=0.2                ;*distance/space between horizontal panel
dxx=((exx-sxx)/4)-ddxx  ;*length for one panel
x1.1=sxx;      x2.1=x1.1+dxx; xr1=x1.1' 'x2.1
x1.2=x2.1+ddxx; x2.2=x1.2+dxx; xr2=x1.2' 'x2.2
x1.3=x2.2+ddxx; x2.3=x1.3+dxx; xr3=x1.3' 'x2.3
x1.4=x2.3+ddxx; x2.4=x1.4+dxx; xr4=x1.4' 'x2.4

*Setting y coordinate
syy=7.8                 ;*upper boundary
eyy=1                   ;*lower boundary
ddyy=1.2                ;*distance/space between vertical panel
dyy=((syy-eyy)/2)-ddyy  ;*height for one panel
y2.1=syy;       y1.1=y2.1-dyy; yr1=y1.1' 'y2.1
y2.2=y1.1-ddyy; y1.2=y2.2-dyy; yr2=y1.2' 'y2.2
y2.3=y1.2-ddyy; y1.3=y2.3-dyy; yr3=y1.3' 'y2.3
y2.4=y1.3-ddyy; y1.4=y2.4-dyy; yr4=y1.4' 'y2.4

*Setting x & y coordinate
p.1.1=xr1' 'yr1; p.2.1=xr2' 'yr1; p.3.1=xr3' 'yr1; p.4.1=xr4' 'yr1;
p.1.2=xr1' 'yr2; p.2.2=xr2' 'yr2; p.3.2=xr3' 'yr2; p.4.2=xr4' 'yr2;
p.1.3=xr1' 'yr3; p.2.3=xr2' 'yr3; p.3.3=xr3' 'yr3; p.4.3=xr4' 'yr3;
p.1.4=xr1' 'yr4; p.2.4=xr2' 'yr4; p.3.4=xr3' 'yr4; p.4.4=xr4' 'yr4;

*----------
*Input file
*----------
'sdfopen D:\#graphic_mb.nc'

timelag = '1 21'
timelaglab = '-10 10'

*----------
*Setting some components for additional scripts
*----------

ptextmarksize = '-t E-P `36`1<q>/`36`1t `371`1<qV> `36`1<q>/`36`1t_sig@95% `371`1<qV>_sig@95% -m 0 0 0 1 1 -z 0.05 0.05 0.05 0.06 0.06 -c 1 2 3 2 3'
prange = '-r -12 12'
xlint = '4'; ylint = '4'
xycfg = '1 3 0.15'

*----------
*Setting the label
*----------

label.1.1 = '(a)RA (CS)'; label.2.1 = '(b)RB (CS)'
label.3.1 = '(c)RC (CS)'; label.4.1 = '(d)RD (CS)'
label.1.2 = '(e)RA (CENS)'; label.2.2 = '(f)RB (CENS)'
label.3.2 = '(g)RC (CENS)'; label.4.2 = '(h)RD (CENS)'

*----------
*Adjust the variables (in accordance to your data)
*----------

var.1.1 = '-v (-1*ecsmeanra-tpcsmeanra)*24*1000 pwdtcsmeanra*24*3600 vimfdcsmeanra*24*3600 maskout(pwdtcsmeanra*24*3600,0.05-pwdtcspvalra) maskout(vimfdcsmeanra*24*3600,0.05-vimfdcspvalra)'; 
var.2.1 = '-v (-1*ecsmeanrb-tpcsmeanrb)*24*1000 pwdtcsmeanrb*24*3600 vimfdcsmeanrb*24*3600 maskout(pwdtcsmeanrb*24*3600,0.05-pwdtcspvalrb) maskout(vimfdcsmeanrb*24*3600,0.05-vimfdcspvalrb)'; 
var.3.1 = '-v (-1*ecsmeanrc-tpcsmeanrc)*24*1000 pwdtcsmeanrc*24*3600 vimfdcsmeanrc*24*3600 maskout(pwdtcsmeanrc*24*3600,0.05-pwdtcspvalrc) maskout(vimfdcsmeanrc*24*3600,0.05-vimfdcspvalrc)'; 
var.4.1 = '-v (-1*ecsmeanrd-tpcsmeanrd)*24*1000 pwdtcsmeanrd*24*3600 vimfdcsmeanrd*24*3600 maskout(pwdtcsmeanrd*24*3600,0.05-pwdtcspvalrd) maskout(vimfdcsmeanrd*24*3600,0.05-vimfdcspvalrd)'; 
var.1.2 = '-v (-1*ecensmeanra-tpcensmeanra)*24*1000 pwdtcensmeanra*24*3600 vimfdcensmeanra*24*3600 maskout(pwdtcensmeanra*24*3600,0.05-pwdtcenspvalra) maskout(vimfdcensmeanra*24*3600,0.05-vimfdcenspvalra)'; 
var.2.2 = '-v (-1*ecensmeanrb-tpcensmeanrb)*24*1000 pwdtcensmeanrb*24*3600 vimfdcensmeanrb*24*3600 maskout(pwdtcensmeanrb*24*3600,0.05-pwdtcenspvalrb) maskout(vimfdcensmeanrb*24*3600,0.05-vimfdcenspvalrb)'; 
var.3.2 = '-v (-1*ecensmeanrc-tpcensmeanrc)*24*1000 pwdtcensmeanrc*24*3600 vimfdcensmeanrc*24*3600 maskout(pwdtcensmeanrc*24*3600,0.05-pwdtcenspvalrc) maskout(vimfdcensmeanrc*24*3600,0.05-vimfdcenspvalrc)'; 
var.4.2 = '-v (-1*ecensmeanrd-tpcensmeanrd)*24*1000 pwdtcensmeanrd*24*3600 vimfdcensmeanrd*24*3600 maskout(pwdtcensmeanrd*24*3600,0.05-pwdtcenspvalrd) maskout(vimfdcensmeanrd*24*3600,0.05-vimfdcenspvalrd)'; 

*--------------
*Start plotting
*--------------
*Core steps!

ir = 1
while (ir<=2)               ;*looping for row
  say 'ROW KE 'ir           ;*for monitor
  ic = 1
  while (ic<=4)
    'set parea 'p.ic.ir
    say 'parea 'p.ic.ir     ;*for monitor
    'set t 'timelag
    'set grads off'
    'set grid off'
    'set timelab off'
    'set datawarn off'      ;*ignore the missing values from data
    'set xaxis 'timelaglab
    'set xlint 'xlint       ;*for x label interval
    'set strsiz 0.18 0.2'
    'set string 1 l 5 0'
    'draw string 'x1.ic' 'y2.ir+0.2' 'label.ic.ir   ;*draw the title
    'set xlopts 'xycfg; 'set ylopts 'xycfg          ;*adjust the x&ylabel

    if ic = 1               ;*looping for column
      'set ylint 'ylint     ;*for y label interval
      'plot 'var.ic.ir' 'prange' 'ptextmarksize
      'draw xlab jeda waktu'
      'draw ylab (mm/day)'
      'define mask = const(maskout(vimfdcspvalra,0.05-vimfdcspvalra),1)'  ;*plotting the statistical significance output (ignore this command)
    else
      'set ylab off'
      'plot 'var.ic.ir' 'prange' 'ptextmarksize ;*plotting the main variable 
      'draw xlab jeda waktu'
    endif
    'set ylab on'
    
    ic = ic+1
  endwhile

  ir = ir+1
endwhile

'legend -orient h -xo -8 -yo -3.2 -scale 0.4'   ;*show the legend

'printim D:\mb_mean.svg white'    ;*print the output

```

## Notes
[^1]: [http://cola.gmu.edu/grads/gadoc/gradcomdsetparea.html](http://cola.gmu.edu/grads/gadoc/gradcomdsetparea.html)
[^2]: [http://cola.gmu.edu/grads/gadoc/gradcomdsetvpage.html](http://cola.gmu.edu/grads/gadoc/gradcomdsetvpage.html)
[^3]: [http://cola.gmu.edu/grads/gadoc/colorcontrol.html](http://cola.gmu.edu/grads/gadoc/colorcontrol.html)

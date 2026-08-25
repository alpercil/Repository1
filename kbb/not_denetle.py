"""
Bir gun/soru notunu teslim etmeden once denetler.

Neden var: 25 Agustos'ta Gun 17 ve 18'de ayni hata yakalandi - SVG <text>
icinde <b> kullanmak. SVG bu etiketi tanimiyor; WeasyPrint etiketten sonraki
metni sema kutusunun disina atiyor ve icerik sessizce kayboluyor. Gozle
fark etmesi zor, cunku PDF yine de uretiliyor.

Kullanim:
    python kbb/not_denetle.py kbb/notlar/gun-NN-....html [...]
    python kbb/not_denetle.py --hepsi

Kontroller:
  1. SVG <text> icinde HTML etiketi (<b>, <i>, <br>...) - icerik kaybettirir
  2. HTML'de uzak <img src="http..."> - SKILL.md 4. bolum yasakliyor
  3. Eksik gorsel dosyasi - PDF'te bos kare birakir
  4. Simge karakterleri (uyari ucgeni vb.) - Colab fontlarinda yok
  5. Gorsel butcesi - gun notu >=8, soru notu >=2
"""

import glob
import os
import re
import sys

SIMGELER = "⚠❗✅❌⭐\U0001f534\U0001f7e2"


def denetle(yol):
    s = open(yol, encoding="utf-8").read()
    kok = os.path.dirname(yol)
    ad = os.path.basename(yol)
    sorun = []

    for m in re.finditer(r"<svg.*?</svg>", s, re.S):
        for t in re.finditer(r"<text[^>]*>(.*?)</text>", m.group(0), re.S):
            if re.search(r"<(b|i|strong|em|br)\b", t.group(1)):
                sorun.append(f"SVG <text> icinde HTML etiketi: {t.group(1).strip()[:60]}")

    for m in re.finditer(r'<img[^>]+src="(http[^"]+)"', s):
        sorun.append(f"HTML'de uzak URL (gorsel inmez): {m.group(1)[:70]}")

    for m in re.finditer(r'<img[^>]+src="(?!http|data:)([^"]+)"', s):
        if not os.path.exists(os.path.join(kok, m.group(1))):
            sorun.append(f"Gorsel dosyasi yok: {m.group(1)}")

    # WeasyPrint, SVG OZNITELIKLERINDE var() cozmuyor: fill="var(--x)" siyaha duser.
    # (25 Agustos: Gun 19 ve 26'nin eski semalari bu yuzden siyah kutu basmisti.)
    for m in re.finditer(r"<svg.*?</svg>", s, re.S):
        for d in set(re.findall(r"var\((--[a-z0-9-]+)\)", m.group(0))):
            sorun.append(f"SVG icinde CSS degiskeni (siyah basar, duz renk yaz): var({d})")

    for c in SIMGELER:
        if c in s:
            sorun.append(f"Simge karakteri var (PDF'te bos kutu cikar): {c!r}")

    img = len(re.findall(r"<img", s))
    svg = len(re.findall(r"<svg", s))
    toplam = img + svg
    soru_notu = 'class="soru"' in s
    alt_sinir = 2 if soru_notu else 8
    if toplam < alt_sinir:
        tur = "soru notu" if soru_notu else "gun notu"
        sorun.append(f"Gorsel butcesi: {toplam} ({tur} icin en az {alt_sinir})")

    print(f"{ad}: {toplam} gorsel ({img} img + {svg} sema)"
          + (f"  -> {len(sorun)} SORUN" if sorun else "  -> temiz"))
    for x in sorun:
        print(f"    ! {x}")
    return len(sorun)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    hedef = (sorted(glob.glob("kbb/notlar/*.html"))
             if sys.argv[1] == "--hepsi" else sys.argv[1:])
    toplam = sum(denetle(y) for y in hedef)
    print(f"\nToplam {toplam} sorun.")
    sys.exit(1 if toplam else 0)

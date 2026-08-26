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


# 26-27 Agustos: bes ayri notta ayni hata cikti - sema kutusundaki bir <text>
# satiri o kadar uzun ki sag kenardan tasip kirpiliyor. Gozle ancak PDF'i
# sayfa sayfa buyutup bakinca fark ediliyordu; 38 notluk turda bu is cekilmez
# hale geldi. Burada genisligi olcup tasanlari onceden yakaliyoruz.
#
# Ilk surumde karakter sayisini sabit bir katsayiyla carpiyorduk; katsayi
# Turkce metin icin fazla yuksek cikti ve gozle dogrulanmis notlari da
# isaretledi. Simdi Helvetica'nin gercek metrikleri okunuyor (WeasyPrint de
# ayni fonta dusuyor), boylece olcum tahmin degil.
SAG_KENAR = 626  # sema kutulari x=14..626 arasinda; disi kirpilir

try:
    from PIL import ImageFont
    _DUZ = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 200)
    _KALIN = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 200, index=1)
except Exception:  # font yoksa kontrol sessizce devre disi kalir
    _DUZ = _KALIN = None


def _genislik(dugum, punto):
    g = 0.0
    for parca, kalin in _parcala(dugum):
        g += (_KALIN if kalin else _DUZ).getlength(parca) / 200 * punto
    return g


def _parcala(dugum):
    """<text> icerigini (metin, kalin_mi) parcalarina ayirir."""
    son, i = [], 0
    for m in re.finditer(r"<tspan([^>]*)>(.*?)</tspan>", dugum, re.S):
        if m.start() > i:
            son.append((_sadelestir(dugum[i:m.start()]), False))
        son.append((_sadelestir(m.group(2)), 'font-weight="bold"' in m.group(1)))
        i = m.end()
    son.append((_sadelestir(dugum[i:]), False))
    return [(p, k) for p, k in son if p]


def _sadelestir(x):
    x = re.sub(r"<[^>]+>", "", x)
    # HTML varliklari tek karaktere denk gelir; ham hallerini saymak sisirir
    x = re.sub(r"&(nbsp|middot|mdash|ndash|ldquo|rdquo|minus|sect);", "-", x)
    x = re.sub(r"&[a-zA-Z]+;|&#\d+;", "x", x)
    return x.strip()


def tasan_metinler(s):
    if _DUZ is None:
        return []
    bulgu = []
    for m in re.finditer(r"<svg.*?</svg>", s, re.S):
        svg = m.group(0)
        vb = re.search(r'viewBox="0 0 (\d+)', svg)
        if not vb or int(vb.group(1)) != 640:
            continue
        for t in re.finditer(r"<text([^>]*)>(.*?)</text>", svg, re.S):
            oz, icerik = t.group(1), t.group(2)
            if "text-anchor" in oz:  # ortalanmis/saga dayali metin ayri hesap ister
                continue
            x = re.search(r'\bx="([\d.]+)"', oz)
            fs = re.search(r'font-size="([\d.]+)"', oz)
            if not x:
                continue
            punto = float(fs.group(1)) if fs else _varsayilan_punto(svg)
            son = float(x.group(1)) + _genislik(icerik, punto)
            if son > SAG_KENAR:
                bulgu.append(f"SVG metni sag kenardan tasiyor (~{son:.0f}px > {SAG_KENAR}): "
                             f"{_sadelestir(icerik)[:55]}...")
    return bulgu


def _varsayilan_punto(svg):
    g = re.search(r'<g[^>]*font-size="([\d.]+)"', svg)
    return float(g.group(1)) if g else 9.0


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

    sorun += tasan_metinler(s)

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

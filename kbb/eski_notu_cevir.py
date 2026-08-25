"""
Eski artifact bicimli gun notunu yeni not.css bicimine cevirir.

Ilk 60 gun notu, koyu tema destekli, kendi stilini icinde tasiyan bir
artifact sablonuyla uretilmisti (.shell / .side / .hero / .callout ...).
Depodaki yeni standart ise ortak `not.css`. Gorsel butcesi icin bir notu
yenilerken 8000+ kelimelik metni elle yeniden yazmak hem yavas hem riskli -
bu arac govdeyi oldugu gibi tasir, yalnizca sinif adlarini esler.

Kullanim:
    python kbb/eski_notu_cevir.py <eski.html> <yeni.html> "<gorsel-klasoru>"

Ciktiyi ELDEN GECIR: arac yalnizca iskeleti tasir. Semalari, yeni gorselleri,
guncellenen literaturu ve surum notunu sen eklersin.
"""

import base64
import os
import re
import sys

# DIKKAT: eski nottaki "num" satir ici sayi vurgusudur, tablo sinifi degil.
# not.css'te karsiligi yok; <b> ile degistirilir (asagida ayrica ele alinir).
SINIF = {
    "callout info": "kutu",
    "callout warn": "kutu uyari",
    "callout danger": "kutu tehlike",
    "radyo": "kutu",
    "callout": "kutu",
    "lede": "lead",
    "ref": "altyazi",
    "pillrow": "cipler",
    "pill": "cip",
    "kaynak-list": "kaynakca",
    "lit": "kaynakca",
    "footer-next": "yarin",
}


def cevir(eski, yeni, gorsel_klasoru):
    s = open(eski, encoding="utf-8").read()

    # 1) gomulu base64 gorselleri diske yaz, src'leri yerel yola cevir
    sayac = [0]

    def gorsel(m):
        sayac[0] += 1
        uzanti = "jpg" if m.group(1) == "jpeg" else m.group(1)
        ad = f"k{sayac[0]:02d}.{uzanti}"
        os.makedirs(gorsel_klasoru, exist_ok=True)
        hedef = os.path.join(gorsel_klasoru, ad)
        if not os.path.exists(hedef):
            open(hedef, "wb").write(base64.b64decode(m.group(2)))
        return f'src="gorsel/{os.path.basename(gorsel_klasoru)}/{ad}"'

    s = re.sub(r'src="data:image/(jpeg|png|jpg);base64,([^"]+)"', gorsel, s)

    # 2) yalnizca <main> govdesini al; kenar cubugu ve hero atilir
    m = re.search(r"<main\b[^>]*>(.*)</main>", s, re.S)
    govde = m.group(1) if m else s
    govde = re.sub(r"<header\b[^>]*class=\"hero\".*?</header>", "", govde, flags=re.S)
    govde = re.sub(r"<style\b.*?</style>", "", govde, flags=re.S)
    govde = re.sub(r"<script\b.*?</script>", "", govde, flags=re.S)

    # 3) sinif adlarini esle (uzun anahtar once, yoksa 'callout' kisayi kapar)
    def sinif_degistir(m):
        eski_sinif = m.group(1).strip()
        return 'class="%s"' % SINIF.get(eski_sinif, eski_sinif)

    for anahtar in sorted(SINIF, key=len, reverse=True):
        govde = govde.replace(f'class="{anahtar}"', f'class="{SINIF[anahtar]}"')
    govde = re.sub(r'class="([^"]*)"', sinif_degistir, govde)

    # 4) satir ici sayi vurgusu: <span class="num">%2-3</span> -> <b>%2-3</b>
    govde = re.sub(r'<span class="num">(.*?)</span>', r"<b>\1</b>", govde, flags=re.S)

    # 5) kutu basliklari: not.css'te <h4> degil .baslik kullanilir
    def kutu_basligi(m):
        ic = re.sub(r"<h4[^>]*>(.*?)</h4>",
                    r'<div class="baslik">\1</div>', m.group(2), flags=re.S)
        return m.group(1) + ic + "</div>"

    govde = re.sub(r'(<div class="kutu[^"]*">)(.*?)</div>', kutu_basligi, govde, flags=re.S)

    # 6) tasiyici sarmallari ve gezinme baglantilarini sadelestir
    govde = re.sub(r"</?div class=\"tablewrap\">", "", govde)
    govde = re.sub(r"<div[^>]*class=\"galeri\"[^>]*>", "", govde)
    govde = re.sub(r"<table>", '<table class="veri">', govde)
    govde = re.sub(r'<a href="#[^"]*">(.*?)</a>', r"\1", govde, flags=re.S)
    govde = re.sub(r"\n{3,}", "\n\n", govde)

    open(yeni, "w", encoding="utf-8").write(govde.strip() + "\n")
    print(f"{os.path.basename(yeni)} yazildi  ({sayac[0]} gorsel cikarildi)")
    print("Simdi elden gecir: basliklar, semalar, guncel literatur, surum notu.")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    cevir(sys.argv[1], sys.argv[2], sys.argv[3])

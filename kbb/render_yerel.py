"""
KBB notlarini kendi bilgisayarinda PDF'e cevirir.

Colab gerekmez. Once gorselleri indirir, sonra butun notlari render eder.
Gorseller bir kez indikten sonra tekrar indirilmez.

Kurulum (bir kez):
    pip install weasyprint requests

Kullanim (deponun kok klasorunde):
    python kbb/render_yerel.py

Cikti: kbb/cikti/ altinda PDF'ler. Drive'a oradan surukleyip birak.

Notlar:
- Windows'ta WeasyPrint GTK gerektirir; kurulum adimlari:
  https://doc.courtbouillon.org/weasyprint/stable/first_steps.html
- Bir gorsel inmezse adiyla listelenir; o gorsel PDF'te bos kalir.
"""

import json
import os
import sys

try:
    import requests
    from weasyprint import HTML
except ImportError:
    sys.exit("Once kur:  pip install weasyprint requests")

KOK = os.path.dirname(os.path.abspath(__file__))
NOTLAR = os.path.join(KOK, "notlar")
GORSEL = os.path.join(NOTLAR, "gorsel")
CIKTI = os.path.join(KOK, "cikti")
MANIFEST = os.path.join(NOTLAR, "gorseller.json")
BASLIK = {"User-Agent": "KBB-calisma-notu/1.0 (kisisel egitim amacli)"}


def gorselleri_indir():
    if not os.path.exists(MANIFEST):
        print("gorseller.json yok, indirme atlandi")
        return []
    kayit = json.load(open(MANIFEST, encoding="utf-8"))
    sorunlu = []
    for ad, gorseller in kayit.items():
        klasor = os.path.join(GORSEL, ad)
        os.makedirs(klasor, exist_ok=True)
        for g in gorseller:
            hedef = os.path.join(klasor, g["ad"])
            if os.path.exists(hedef) and os.path.getsize(hedef) > 1024:
                continue
            try:
                y = requests.get(g["url"], headers=BASLIK, timeout=60,
                                 allow_redirects=True)
                y.raise_for_status()
                tur = y.headers.get("content-type", "")
                if not tur.startswith("image/"):
                    raise ValueError("gorsel degil: " + (tur or "?"))
                with open(hedef, "wb") as f:
                    f.write(y.content)
                print(f"  indi: {ad}/{g['ad']}  {len(y.content)/1024:.0f} KB")
            except Exception as e:
                sorunlu.append((ad, g["ad"], g.get("commons", g["url"]), str(e)))
                print(f"  HATA: {ad}/{g['ad']}  ({e})")
    return sorunlu


def render():
    import glob
    os.makedirs(CIKTI, exist_ok=True)
    for html in sorted(glob.glob(os.path.join(NOTLAR, "*.html"))):
        ad = os.path.splitext(os.path.basename(html))[0]
        hedef = os.path.join(CIKTI, ad + ".pdf")
        HTML(html, base_url=NOTLAR).write_pdf(hedef)
        print(f"  uretildi: {ad}.pdf  {os.path.getsize(hedef)/1e6:.2f} MB")


if __name__ == "__main__":
    print("1) Gorseller indiriliyor")
    sorunlu = gorselleri_indir()
    print("\n2) Notlar PDF'e ceviriliyor")
    render()
    print(f"\nBitti. Cikti: {CIKTI}")
    if sorunlu:
        print("\nInmeyen gorseller (Claude'a bildir, degistirsin):")
        for n, a, c, e in sorunlu:
            print(f"  {n} / {a} / {c}")

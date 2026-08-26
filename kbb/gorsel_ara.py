"""
Commons'ta gorsel arar, lisansini dogrular, indirir.

Not yenileme isinde her not icin ayni uc adim tekrarlaniyordu: ara, lisansi
kontrol et, indir. Bu arac ucunu birlestirir ve yalnizca lisansi acikca
serbest olan dosyalari kabul eder.

Kullanim:
    python kbb/gorsel_ara.py ara "vocal cord leukoplakia" ...
    python kbb/gorsel_ara.py indir <hedef-klasor> <ad.jpg> "<Commons dosya adi>"

Kabul edilen lisanslar: CC0, kamu mali, CC BY, CC BY-SA (surum farketmez).
Reddedilenler ekrana gerekcesiyle yazilir - sessizce atlanmaz.
"""

import json
import os
import sys
import time
import urllib.parse

import requests

API = "https://commons.wikimedia.org/w/api.php"
UA = "KBB-calisma-notu/1.0 (kisisel egitim amacli)"
SERBEST = ("cc0", "public domain", "cc by", "cc-by", "pd-")
# A4 sayfada 1280 px fazlasiyla yeterli; daha buyugunu indirmek PDF'i sisiriyor.
KUCUK_RESIM_GENISLIGI = 1280


def _iste(parametreler):
    # Commons API'si de 429 dondurebiliyor; indirme tarafiyla ayni sekilde bekle-yeniden dene.
    # 26 Agustos: pes pese cok istek atilan uzun oturumlarda 4 deneme yetmedi ve is
    # yarida kaldi; deneme sayisi ve bekleme suresi artirildi (toplam ~2,5 dk sabir).
    y = None
    for deneme in range(6):
        y = requests.get(API, params=parametreler, headers={"User-Agent": UA}, timeout=40)
        if y.status_code != 429:
            break
        bekle = 8 * (deneme + 1)
        print(f"  API 429 - {bekle} sn bekleniyor")
        time.sleep(bekle)
    y.raise_for_status()
    return y.json()


def lisans_serbest(kisa):
    d = (kisa or "").lower()
    return any(s in d for s in SERBEST)


def ara(sorgu, adet=8):
    d = _iste({"action": "query", "list": "search", "srnamespace": 6,
               "srlimit": adet, "format": "json", "srsearch": sorgu})
    return [x["title"] for x in d.get("query", {}).get("search", [])]


def lisans(basliklar, kucuk_genislik=KUCUK_RESIM_GENISLIGI):
    if not basliklar:
        return {}
    d = _iste({"action": "query", "prop": "imageinfo", "iiprop": "extmetadata|size|url",
               "iiurlwidth": kucuk_genislik,
               "format": "json", "titles": "|".join(basliklar)})
    out = {}
    for p in d.get("query", {}).get("pages", {}).values():
        ii = p.get("imageinfo")
        if not ii:
            continue
        m = ii[0].get("extmetadata", {})
        g = lambda k: m.get(k, {}).get("value", "")
        out[p["title"]] = {
            "lisans": g("LicenseShortName"),
            "serbest": lisans_serbest(g("LicenseShortName")),
            "aciklama": g("ImageDescription")[:220],
            "sahip": g("Artist")[:120],
            "boyut": f'{ii[0].get("width")}x{ii[0].get("height")}',
            "kucuk_url": ii[0].get("thumburl") or ii[0].get("url"),
        }
    return out


def _kucuk_resim_url(baslik, bilgi):
    """Gercek bir kucuk resim (/thumb/) adresi dondurur; bulamazsa orijinali.

    Commons, istenen genislik dosyanin kendi genisligine yakinsa kucuk resim
    URETMIYOR - sessizce orijinalin adresini donduruyor ("thumbnail_unscaled").
    Esigin nerede oldugu belgelenmemis; olcerek gorulen su: %90 kucultmede
    orijinal geliyor, %75'te gercek kucuk resim uretiliyor. Bu yuzden tek bir
    genislik denemek yerine giderek kuculen adaylar deneniyor ve donen adreste
    "/thumb/" var mi diye BAKILIYOR - varsayim degil, dogrulama.
    """
    try:
        asil = int(bilgi.get("boyut", "").split("x")[0])
    except (ValueError, AttributeError, IndexError):
        asil = KUCUK_RESIM_GENISLIGI
    adaylar = [g for g in (KUCUK_RESIM_GENISLIGI, int(asil * 0.75), int(asil * 0.5))
               if 200 < g < asil]
    for g in adaylar:
        u = lisans([baslik], g).get(baslik, {}).get("kucuk_url", "")
        if "/thumb/" in u:
            return u
    # Cok kucuk dosyalarda kucuk resim uretilemez; orijinal zaten hafiftir.
    return bilgi["kucuk_url"]


def indir(hedef_klasor, ad, commons_adi):
    """Lisansi serbest degilse indirmez; None doner."""
    b = "File:" + commons_adi if not commons_adi.startswith("File:") else commons_adi
    bilgi = lisans([b]).get(b)
    if not bilgi:
        print(f"  BULUNAMADI: {commons_adi}")
        return None
    if not bilgi["serbest"]:
        print(f"  REDDEDILDI: {commons_adi} - lisans '{bilgi['lisans']}' serbest degil")
        return None
    # 27 Agustos: orijinal dosyayi cekmek iki ayri soruna yol aciyordu. (1) Commons
    # orijinaller icin hiz sinirini sert uyguluyor - 429 donuyor ve "bunun yerine
    # kucuk resim kullanin" diyor. (2) Ham dosyalar (20 MB'lik PNG'ler) PDF'i
    # sisiriyordu; her indirmenin ardindan elle kucultmek gerekiyordu.
    #
    # Iki yanlis deneme oldu, ikisi de ayni sebepten: Commons, istenen genislik
    # dosyanin kendi genisligine ESIT YA DA BUYUKSE kucuk resim URETMIYOR, sessizce
    # orijinalin adresini donduruyor ("thumbnail_unscaled") ve hiz sinirine
    # takiliyoruz. Ne Special:FilePath?width= ne de sabit iiurlwidth=1280 bunu
    # cozuyor. Cozum _kucuk_resim_url()'de: adres gercekten kucuk resim mi diye
    # dogrulanip, degilse daha dar bir genislikle yeniden deneniyor.
    url = _kucuk_resim_url(b, bilgi)
    os.makedirs(hedef_klasor, exist_ok=True)
    yol = os.path.join(hedef_klasor, ad)
    # Commons 429 (hiz siniri), 5xx (gecici sunucu) donebiliyor; buyuk dosyalarda
    # (histoloji taramalari 15+ MB) okuma zaman asimi da oluyor. Ucu de yeniden denenir.
    y = None
    for deneme in range(4):
        bekle = 4 * (deneme + 1)
        try:
            y = requests.get(url, headers={"User-Agent": UA}, timeout=180,
                             allow_redirects=True)
        except requests.exceptions.RequestException as e:
            print(f"  baglanti hatasi ({type(e).__name__}) - {bekle} sn sonra yeniden")
            time.sleep(bekle)
            continue
        if y.status_code != 429 and y.status_code < 500:
            break
        print(f"  {y.status_code} - {bekle} sn bekleyip yeniden deneniyor ({commons_adi})")
        time.sleep(bekle)
    if y is None:
        print(f"  INDIRILEMEDI: {commons_adi}")
        return None
    y.raise_for_status()
    if not y.headers.get("Content-Type", "").startswith("image/"):
        print(f"  GORSEL DEGIL: {commons_adi}")
        return None
    veri = y.content
    open(yol, "wb").write(veri)
    print(f"  indi: {ad}  {len(veri)/1024:.0f} KB  [{bilgi['lisans']}]  {bilgi['boyut']}")
    return {"ad": ad, "commons": commons_adi, "lisans": bilgi["lisans"],
            "sahip": bilgi["sahip"], "url": url}


def kontak(klasor, cikti="/tmp/kontak.png", sutun=3, hucre=430):
    """Klasordeki gorselleri tek bir izgaraya dizer - hepsini tek bakista gormek icin."""
    from PIL import Image, ImageDraw
    adlar = sorted(f for f in os.listdir(klasor)
                   if f.lower().endswith((".jpg", ".jpeg", ".png")))
    if not adlar:
        print("klasor bos")
        return
    satir = (len(adlar) + sutun - 1) // sutun
    tuval = Image.new("RGB", (sutun * hucre, satir * (hucre + 20)), "white")
    ciz = ImageDraw.Draw(tuval)
    for i, ad in enumerate(adlar):
        im = Image.open(os.path.join(klasor, ad)).convert("RGB")
        im.thumbnail((hucre - 10, hucre - 10))
        x = (i % sutun) * hucre + (hucre - im.width) // 2
        y = (i // sutun) * (hucre + 20) + 20
        tuval.paste(im, (x, y))
        ciz.text(((i % sutun) * hucre + 6, (i // sutun) * (hucre + 20) + 5), ad, fill="black")
    tuval.save(cikti)
    print(f"{len(adlar)} gorsel -> {cikti}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    komut = sys.argv[1]
    if komut == "ara":
        for sorgu in sys.argv[2:]:
            bulunan = ara(sorgu)
            bilgi = lisans(bulunan)
            print(f"\n### {sorgu}")
            for b in bulunan:
                i = bilgi.get(b, {})
                isaret = "+" if i.get("serbest") else "-"
                print(f" {isaret} {b}")
                print(f"     {i.get('lisans','?'):<22} {i.get('boyut','?')}")
                if i.get("aciklama"):
                    print(f"     {i['aciklama'][:150]}")
    elif komut == "indir":
        hedef, ad, commons_adi = sys.argv[2], sys.argv[3], sys.argv[4]
        sonuc = indir(hedef, ad, commons_adi)
        if sonuc:
            print(json.dumps(sonuc, ensure_ascii=False))
    elif komut == "kontak":
        kontak(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "/tmp/kontak.png")
    else:
        sys.exit(__doc__)

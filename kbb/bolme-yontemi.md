# Kitapları parçalara bölme yöntemi

Yeni bir kaynak kitap eklendiğinde uygulanacak yol. Kitap Drive'dan çıkmaz,
bilgisayara indirme ve geri yükleme yoktur — iş Google Colab'da, Drive
bağlıyken yapılır.

## Neden bu yol

- Drive bağlayıcısı PDF'i yalnızca **metin** olarak veriyor, ham dosya olarak
  değil; ayrıca ~50 MB üstü PDF'lerden hiç içerik döndürmüyor.
- Drive'a dosya yüklemek, içeriği base64 metin olarak üretmeyi gerektiriyor;
  30 MB'lık bir parça için bu tek mesajda üretilebilecek boyutun çok üstünde.

Dolayısıyla bölme işi bir Claude oturumundan yapılamaz. Colab, Drive'ı
doğrudan bağladığı için hem indirmeyi hem yüklemeyi ortadan kaldırıyor.

## Adımlar

1. [colab.research.google.com](https://colab.research.google.com) → yeni defter
2. Drive'ı bağla:

```python
from google.colab import drive
drive.mount('/content/drive')
```

3. `!pip install -q pypdf`
4. Aşağıdaki hücreyi `ISLER` listesini düzenleyerek çalıştır.

```python
import os, glob
from pypdf import PdfReader, PdfWriter

HEDEF = "/content/drive/MyDrive/KBB_kaynak"
SINIR = 45 * 1024 * 1024      # parca ust siniri
BASLANGIC = 30 * 1024 * 1024  # ilk tahmin icin hedef boyut

ISLER = [
    "/content/drive/Othercomputers/iMac'im/Desktop/KBB/Baş ve Boyun Cerrahisi Atlası.pdf",
]

def yaz(okuyucu, ad, bas, son):
    cikti = os.path.join(HEDEF, f"{ad}-{bas+1:04d}-{son:04d}.pdf")
    y = PdfWriter()
    for s in okuyucu.pages[bas:son]:
        y.add_page(s)
    with open(cikti, "wb") as f:
        y.write(f)
    return cikti, os.path.getsize(cikti)

def bol(okuyucu, ad, bas, son):
    """Araligi yazar; parca sinirdan buyukse ikiye bolup tekrar dener."""
    cikti, boyut = yaz(okuyucu, ad, bas, son)
    if boyut <= SINIR or son - bas <= 1:
        print(f"    {os.path.basename(cikti)}  {boyut/1e6:.1f} MB")
        return
    os.remove(cikti)
    orta = (bas + son) // 2
    bol(okuyucu, ad, bas, orta)
    bol(okuyucu, ad, orta, son)

for yol in ISLER:
    if not os.path.exists(yol):
        print(f"BULUNAMADI: {yol}")
        continue

    ad = os.path.splitext(os.path.basename(yol))[0]

    eski = glob.glob(os.path.join(HEDEF, f"{ad}-*.pdf"))
    for e in eski:
        os.remove(e)
    if eski:
        print(f"{ad}: {len(eski)} eski parca silindi")

    boyut = os.path.getsize(yol)
    okuyucu = PdfReader(yol)
    n = len(okuyucu.pages)
    adim = min(n, max(1, int(BASLANGIC * n / boyut)))
    print(f"\n{ad}\n  {boyut/1e6:.0f} MB, {n} sayfa -> baslangic adimi {adim} sayfa")

    for bas in range(0, n, adim):
        bol(okuyucu, ad, bas, min(bas + adim, n))

print("\nBitti.")
```

## Notlar

- Sabit sayfa sayısı yetmez: kitapların görsel yoğunluğu bölümden bölüme
  değişiyor. `bol()` fonksiyonu sınırı aşan aralığı ikiye bölerek bunu
  kendiliğinden çözüyor.
- Zaten var olan parçalar silinip yeniden üretilir; Colab bağlantısı koparsa
  hücreyi tekrar çalıştırmak yeterli.
- Bitince `kbb/kaynak-index.md` dosyasına yeni kitabın parça aralıklarını ekle.

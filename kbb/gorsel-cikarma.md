# Kitaplardan görsel çıkarma

## Sorun

Drive bağlayıcısı PDF'i yalnızca **metin** olarak veriyor. Bir Claude oturumu
kitaptaki otoskopi fotoğrafını veya atlas çizimini göremez, dolayısıyla nota
koyamaz.

## Görsellerin çoğu zaten çizilebilir

Mevcut notlar incelendiğinde şekillerin büyük kısmının kitaptan alınmadığı,
"bu not için çizildi" notuyla üretildiği görülüyor — akış şemaları, karar
algoritmaları, evre diyagramları, karşılaştırma tabloları. Gün 25'in hava
yolu basamak şeması ve düğme pil algoritması, Gün 68'in trakeostomi teknik
akışı bunlara örnek.

**Bu tür görselleri oturum kendisi üretir.** Not HTML olarak yazıldığı için
şema doğrudan HTML tablosu veya satır içi SVG olarak gömülür; Drive bunları
Google Doc'a çevirirken korur.

Yalnızca şunlar kitaptan çıkarılmak zorunda:

- Gerçek klinik fotoğraflar (otoskopi, endoskopi, ameliyat sahası)
- Atlas cerrahi çizimleri
- Radyoloji görüntüleri
- Histopatoloji kesitleri

## Çıkarma yöntemi — Colab

Not üretilirken oturum sana "şu kitabın şu PDF sayfalarındaki şekil gerekli"
der. O sayfaları PNG olarak Drive'a çıkarmak için Colab'da:

```python
!pip install -q pymupdf
```

```python
import fitz, os

# Bölünmemiş orijinal kitabı kullan - Colab'da boyut sınırı yok
KAYNAK  = "/content/drive/Othercomputers/iMac'im/Desktop/KBB/1KBB Otoloji.pdf"
HEDEF   = "/content/drive/MyDrive/KBB_gorsel"
SAYFALAR = [219, 220, 221]     # orijinal PDF sayfa numaralari (1'den baslar)

os.makedirs(HEDEF, exist_ok=True)
kitap = fitz.open(KAYNAK)
ad = os.path.splitext(os.path.basename(KAYNAK))[0]

for s in SAYFALAR:
    sayfa = kitap[s - 1]

    # 1) Sayfanin tamamini goruntu olarak al - her zaman calisir
    cikti = os.path.join(HEDEF, f"{ad}-s{s:04d}.png")
    sayfa.get_pixmap(dpi=200).save(cikti)
    print(f"{os.path.basename(cikti)}  {os.path.getsize(cikti)/1e6:.2f} MB")

    # 2) Sayfaya gomulu goruntuleri ayri ayri cikar - daha temiz, ama
    #    tarama PDF'lerinde tum sayfa tek goruntu olarak gelebilir
    for i, img in enumerate(sayfa.get_images(full=True), 1):
        temel = fitz.Pixmap(kitap, img[0])
        if temel.n - temel.alpha > 3:          # CMYK ise RGB'ye cevir
            temel = fitz.Pixmap(fitz.csRGB, temel)
        cikti = os.path.join(HEDEF, f"{ad}-s{s:04d}-g{i}.png")
        temel.save(cikti)
        print(f"  gomulu: {os.path.basename(cikti)}")
```

## Sonra

Görseller `KBB_gorsel` klasörüne düşer. Notun Google Doc halinde şeklin
geleceği yere `[ŞEKİL: <dosya adı>]` yer tutucusu bırakılır; sen görseli
oraya sürükleyip bırakırsın.

Sayfa numarası bulma: kaynak parçasının metnini okurken şekil altyazıları
("Şekil 1-3, s.216-217") görünür. Basılı sayfa ile PDF sayfası arasındaki
ofset için `kbb/kaynak-index.md`.

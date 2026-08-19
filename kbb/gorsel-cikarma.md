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

## İnternetten görsel — Drive'ın kendisi indiriyor

Ölçüldü: nota `<img src="https://...">` koyup HTML olarak yüklediğinde
**Drive görseli kendisi indirip belgeye kalıcı olarak gömüyor** (data URI
olarak saklıyor, bağlantı sonradan ölse bile görsel kalıyor).

Konteynerin dışa ağ erişimi kısıtlı olduğu için URL'yi önceden
doğrulayamazsın — ama yükledikten sonra doğrulayabilirsin, ve doğrulamalısın.
**Bozuk URL sessizce boş `<img>` olarak kalıyor**, hata dönmüyor.

### Doğrulama döngüsü — atlanmaz

Notu yükledikten sonra:

1. `download_file_content` ile `exportMimeType: text/html` iste.
2. Dönen base64'ü çöz.
3. Her `<img` etiketinin `src="data:image/...` taşıdığını doğrula.
4. `src`'siz bir `<img>` varsa o görsel inmemiştir — başka bir aday URL ile
   HTML'i düzeltip yeniden yükle.

### Kaynak seçimi

Öncelik sırası:

1. **Wikimedia Commons** — `https://commons.wikimedia.org/wiki/Special:FilePath/<Dosya adı.jpg>`
   Bu kalıcı bir yönlendirme; dosya adını bilmek yeterli, hash gerekmez.
   Dosya adını `WebSearch` sonuçlarından çıkar.
2. **Açık erişimli makale şekilleri** — PMC, açık erişim dergiler. Lisansı
   CC BY / CC BY-NC olanları seç.

Telifi belirsiz kaynaklardan görsel alma. Altyazıya kaynağı ve lisansı yaz:
`(Kaynak: Wikimedia Commons, <dosya adı>, CC BY-SA 4.0)`

Bunlar kişisel çalışma notu; yine de kaynak göstermek hem doğru hem de
görselin nereden geldiğini sonradan bulmayı sağlıyor.

### Sıralama

Bir şekle ihtiyaç duyduğunda sırayla dene:

1. Şemayı **kendin çiz** (akış, algoritma, karşılaştırma) — en iyisi bu.
2. Gerçek görüntü gerekiyorsa **internetten açık lisanslı** bul ve göm.
3. İkisi de olmuyorsa **kitaptan çıkar** — aşağıdaki Colab yöntemi, tek
   kullanıcı müdahalesi gereken yol.

## Kitaptan çıkarma — Colab

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

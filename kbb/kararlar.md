# KBB projesi — kurulum kararları ve ölçümler

19.08.2026 tarihli oturumda çıkarılan sonuçlar. Bir sonraki oturumun aynı
şeyleri yeniden keşfetmesine gerek kalmasın diye yazıldı.

## Bulut oturumu ile Remote Control farkı

Programın ilk 68 günü, claude.ai/code arayüzünden Mac'teki Claude Code'a
bağlanan bir **Remote Control** oturumunda üretildi. O bir bulut oturumu
değil: Mac uykuya geçtiğinde veya terminal kapandığında köprü kopuyor
("Remote Control disconnected") ve iş duruyor.

Bulut oturumu ise Anthropic'in konteynerinde çalışır, Mac'e bağlı değildir.
Karşılığında konteynerin diski kalıcı değildir ve yerel dosyalara erişemez —
depo git'ten klonlanır, kaynaklar Drive'dan okunur.

## Ölçüm: Drive'ın PDF metin çıkarma sınırı

Denendi, tahmin değil:

| Dosya | Boyut | Sonuç |
| --- | --- | --- |
| KBB öğrenci notları.pdf | 3,9 MB | okundu |
| KBB ders kitabı 2.pdf | 5,7 MB | okundu |
| KBB ders kitabı 1.pdf | 7,4 MB | okundu |
| KBB Acillerine Güncel Yaklaşımlar.pdf | 10,4 MB | okundu |
| Yumuşak doku arttırımı.pdf | 21 MB | okundu |
| İp ile yüz germe.pdf | 55 MB | **boş döndü** |
| Kozmetik Dermatoloji.pdf | 83 MB | **boş döndü** |
| 2KBB Nörootoloji.pdf | 274 MB | **boş döndü** |
| CAN.KOÇ.2019.KİTAP.pdf | 758 MB | **boş döndü** |
| CUMMINGS 7th Ed.pdf | 988 MB | **boş döndü** |

Sınır 21 MB ile 55 MB arasında; Google Drive'ın ~50 MB'lık PDF dönüştürme
limitiyle örtüşüyor. Hata dönmüyor — sessizce boş metin dönüyor, bu yüzden
fark edilmesi zor.

Çözüm: kitaplar ~30 MB hedefiyle parçalandı. Ayrıntı `kbb/kaynak-index.md`.

## Neyi yapamıyorum

**Drive'a hazır dosya yükleyemem.** Yükleme aracı içeriği base64 metin olarak
istiyor; 30 MB'lık bir parça ~40 MB metin eder, bu tek mesajda
üretebileceğimin çok üstünde. Küçük dosyalarda sorun boyut değil **sadakat**:
64 KB'lık bir PDF ~87.000 karakterlik base64 eder ve bu yüksek entropili
diziyi karakteri karakterine yeniden üretmem gerekir — tek yanlış karakter
bozuk dosya demektir, doğruluğunu garanti edemem. Metin içerik (HTML, düz
metin) sorunsuz yüklenir; Drive onu Google Doc'a çevirir. Bu yüzden PDF
üretimi ve kitap bölme işi Colab'da yapılıyor (Drive'ı doğrudan bağladığı
için indirme ve yükleme adımı hiç yok).

Bu tarayıcıyla ilgili değil — Chrome, masaüstü ya da mobil, hepsinde aynı.

**Kitaptan görsel çıkarabiliyorum — ölçüldü.** Önce çıkaramadığımı
sanıyordum; doğru değilmiş. `download_file_content` dosyayı base64 olarak
veriyor ve sonuç bağlam sınırını aştığında **bağlayıcı onu diske yazıp yolu
bildiriyor**. O dosya bağlamıma hiç girmeden Bash ile işlenebilir:

```
jq -r .content <tool-results/....txt> | base64 -d > kitap.pdf
python -c "import pymupdf; ..."   # sayfa render, gorsel cikarma
```

Böyle 3,4 MB'lık bir kitap parçası ve 543 KB'lık eski bir gün notu PDF'i
indirilip içlerindeki fotoğraflar çıkarıldı. Sınır bağlam değil, tek mesajda
**üretebileceğim** karakter sayısı — okuma tarafında böyle bir sınır yok.
Çözüm ve bunun neden büyük bir kayıp olmadığı: `kbb/gorsel-cikarma.md`.

**Konteynerdeki dosyalar kalıcı değil.** Oturum bitince gider. Kalıcı olan
tek şey depoya push edilmiş olan ve Drive'daki dosyalardır.

## Ölçüm: çıktı biçimi

Denendi: HTML içerik `create_file` ile `contentMimeType: text/html` olarak
yüklendiğinde Drive bunu **formatlı Google Doc'a** çeviriyor. Korunanlar:
başlık düzeyleri, tablolar, numaralı/madde listeleri, kalın/italik, alıntı
bloğu. Kullanıcı Dosya → İndir → PDF ile tek tıkta PDF alıyor.

Düz metin (`textContent`) yüklemek de çalışır ama biçim kaybolur — HTML
tercih edilir.

## Klasör haritası (Drive)

| Ne | Konum |
| --- | --- |
| Kaynak kitap parçaları (139 dosya, 7 kitap) | My Drive → `KBB_kaynak` |
| Gün notları 1-9 | `KBB_not_claude/01/` |
| Gün notları 10-68 | `KBB_not_claude/` |
| Soru bankası | `KBB_not_claude/Soru/` |
| Bölünmemiş kitaplar | `iMac'im → Desktop → KBB` |
| Cummings, Scott-Brown asılları | My Drive → `PAÜ` → `Kitap Pdf` |
| Çıkarılan görseller | My Drive → `KBB_gorsel` |

## Not biçimi nereden çıkarıldı

Gün 4, Gün 25 ve Gün 68 notları okunup ortak yapı çıkarıldı. Orijinal
talimatlar görülmedi — biçim kuralları bu üç örnekten tersine mühendislikle
yazıldı, `.claude/skills/kbb-gunluk-not/SKILL.md` içinde. Eksik veya yanlış
bir kural varsa oradan düzeltilmeli.

Biçimin zaman içinde geliştiği görülüyor: Gün 4'te olmayan "tek cümlelik
özet", "▶ Videolar", DOI bağlantılı güncel literatür ve "klinik çıkarım"
bölümleri Gün 25 ve sonrasında standart hale gelmiş. Yeni notlar Gün 68
düzeyini esas alır.

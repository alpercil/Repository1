# Metinsiz sayfaları OCR ile okunabilir yapma

## Sorun

Bazı kaynak kitapların bir kısmı taranmış görüntü ve **metin katmanı yok**.
Bu sayfalardan Drive hiçbir içerik çıkaramıyor — hata da vermiyor, sessizce
boş dönüyor.

Ölçülen örnek, `1KBB Otoloji.pdf` (Önerci Cilt 1):

| PDF sayfa | Durum |
| --- | --- |
| 201-280 | Metin geliyor (Böl. 32-35) |
| **281-400** | **Boş — kolesteatom bölümleri burada** |
| 401-462 | Metin geliyor (Böl. 50-54, kulak cerrahisi) |

Bitişik parçaların boyutları benzer (29-34 MB) ama biri okunuyor diğeri
okunmuyor. Yani sorun boyut değil: kitap **farklı işlenmiş kaynaklardan
birleştirilmiş**, bir kısmında metin katmanı var, bir kısmında yok.

Çözüm de bundan çıkıyor: eksik olan yere metin katmanını biz üretiriz.

## Yöntem

`kbb_ocr_colab.ipynb` defteri üç iş yapar:

1. **Tanı** — kitabın tamamını tarar, her sayfanın çıkarılabilir metin
   uzunluğuna bakar, metinsiz aralıkları topluca yazdırır. Hangi sayfaların
   OCR'lanacağını tahminle değil ölçerek belirlersin.
2. **OCR** — seçilen aralığı ayrı bir PDF'e çıkarır, `ocrmypdf -l tur
   --force-ocr` ile Türkçe metin katmanı ekler, 45 MB'ı aşarsa parçalar ve
   `KBB_kaynak` klasörüne yazar.
3. **Doğrulama** — üretilen her parçanın ortasındaki sayfadan metin okumayı
   dener. Boş çıkarsa OCR başarısız olmuştur.

Çıktı adı normal parçalarla aynı desende, arasına `-OCR-` eklenmiş olur:
`1KBB Otoloji-OCR-0281-0400.pdf`. Böylece dizinde ve aramada ayırt edilir.

`--force-ocr` bilinçli bir tercih: mevcut bozuk/kısmi metin katmanını yok
sayıp baştan üretir. `--optimize 3` ve `--jpeg-quality 70` dosyayı küçültür,
OCR metnini etkilemez.

## Süre

Sayfa başına ~2-4 saniye. 120 sayfalık bir aralık ~5-8 dakika. Colab
bağlantısı koparsa hücreyi yeniden çalıştırmak yeterli.

## OCR metninin kalitesi

OCR çıktısı karakter hatası içerir. Zaten OCR'lı olan Loré & Medina
atlasında görülen örnekler: `Karsinamunun`, `KAViTE`, `yayılıını`.

Anlam genellikle bozulmaz ama **birebir alıntı yaparken düzeltmek gerekir**.
Bir notta OCR'lı kaynaktan alıntı yapılıyorsa, terim ve doz gibi kritik
bilgiler ikinci bir kaynakla teyit edilmelidir.

## Önce arama, sonra OCR

OCR'a girişmeden önce aradığın içeriğin gerçekten okunamayan bölgede olup
olmadığını kontrol et. Drive'ın tam metin indeksi bunu tek sorguda söyler:

```
parentId = '<KBB_kaynak klasör id>' and fullText contains 'mastoidektomi'
```

Metni okunabilen parçalar sonuçta çıkar, metinsizler çıkmaz. Aradığın konu
zaten okunabilir bir parçadaysa OCR'a hiç gerek yoktur — Gün 69 notunda
kulak cerrahisi bölümleri bu şekilde bulundu.

## Sırada ne var

Bu yöntem herhangi bir kitaba uygulanabilir. Öncelik sırası, tanı hücresi
her kitap için çalıştırılarak belirlenmeli. Bilinen tek doğrulanmış boşluk
şimdilik `1KBB Otoloji.pdf` s.281-400 (kolesteatom).

---
name: kbb-gunluk-not
description: KBB (kulak burun boğaz) konusu için kaynak kitaplardan, PubMed'den ve güncel kılavuzlardan yapılandırılmış bir çalışma notu üretip Google Drive'a yükler; KBB sorularını da aynı kaynaklardan yanıtlar. Kullanıcı "Gün N", "günlük not", "şu konuyu çalışmak istiyorum", "bu konuda not hazırla" dediğinde ya da kulak burun boğaz / otolaryngoloji hakkında kaynağa dayalı bir soru sorduğunda kullan.
---

# KBB çalışma notu

Alper'in KBB çalışma programı. Gün 1-68 tamamlandı. Her not bir konuyu
kaynak kitaplardan okuyup, güncel literatürle tamamlayıp, poliklinikte
kullanılabilir bir belgeye dönüştürür.

İki iş için:

1. **Not üretmek** — "Gün 69 yap", "vestibüler schwannom çalışacağım, not hazırla"
2. **Soru yanıtlamak** — "konka bülloza neden opere edilir?"

İkisinde de cevap kaynaktan gelir, hafızadan değil. Kitapta bulamazsan bunu
açıkça yaz; uydurma.

## 1. Kaynağı aç

Kaynak kitaplar Drive'da `KBB_kaynak` klasöründe, sayfa aralığına göre
adlandırılmış parçalar halinde. Hangi konu hangi kitapta ve parçada →
`kbb/kaynak-index.md`.

Sıra:

1. Konuya uyan kitabı ve parçayı seç.
2. `search_files` ile bul, `read_file_content` ile oku. Dosya adı deseni:
   `<kitap>-<ilk sayfa>-<son sayfa>.pdf`, 4 haneli.
3. Metin büyükse konteynerde bir dosyaya yazılır; `grep` ile aradığın bölümü
   bul, tamamını bağlama alma.
4. Parça sınırları bölüm sınırlarıyla hizalı değil — aradığın bölüm iki
   parçaya bölünmüşse ikisini de oku.

Türkçe kaynaklar (Önerci ciltleri, Koç C) omurgayı kurar; Cummings ve
Scott-Brown İngilizce derinlik ve tartışmalı noktalar için.

## 2. Güncel literatürle tamamla

Kitap bilgisi tek başına yeterli değil — bu notların ayırt edici yanı
güncelliği.

- **PubMed** araçlarıyla son 2-3 yılı tara (`search_articles`,
  `get_article_metadata`). Her kaynağın DOI bağlantısını ver.
- Uluslararası kılavuzları kontrol et (AAO-HNS, EPOS, ESPGHAN, AAP, NICE) —
  `WebSearch` / `WebFetch`.
- Kitaptaki bilginin **güncelliğini yitirdiği yerleri açıkça belirt**.
  Örnek: Gün 4 notu kitaptaki PCV7 bilgisinin yerini PCV15/PCV20'ye
  bıraktığını yazıyor.
- Bölümü "Klinik çıkarım" ile kapat: bu literatür pratiği değiştiriyor mu?

## 3. Not biçimi

Gün 68 düzeyi esas alınır (Gün 4, 25 ve 68 örneklerinden çıkarıldı):

- **Başlık:** `Gün NN — Konu` (gün numarasız çalışmalarda sadece konu)
- **Üst satır:** `KBB · GÜNLÜK ÇALIŞMA NOTU · GÜN NN`, ardından yaklaşık
  okuma süresi (~60-70 dk) ve kaynak künyesi
- **Kaynak notu:** hangi kitabın hangi bölümü, hangi *basılı* sayfa aralığı
- **İçindekiler:** numaralı
- **Tek cümlelik özet:** konunun çekirdeği; varsa "altın kurallar"
- **Numaralı bölümler:** tanım/önem → fizyopatoloji → epidemiyoloji →
  klinik → tanı → ayırıcı tanı → tedavi → komplikasyon → korunma
- **Tablolar:** altına kaynak künyesi (kitap, bölüm, basılı sayfa, şekil no)
- **⚠ Kırmızı bayraklar:** ne zaman ileri tetkik/sevk
- **Poliklinik/nöbet pratik özeti:** numaralı, doğrudan uygulanabilir
- **▶ Videolar:** YouTube arama bağlantıları (tek tık açsın)
- **Güncel literatür:** DOI'li, ardından "Klinik çıkarım"
- **Kaynaklar**
- **Alt bilgi:** `Kişisel çalışma notu · eğitim amaçlı. Klinik kararlar için
  güncel kılavuz ve kurum protokolü esastır.`
- **Son satır:** `Yarın · Gün NN+1 — <konu>`

Dil Türkçe, terimler Türkçe tıp yazımına uygun. Aynı konuya daha önce
girilmiş olabilir — `kbb/ilerleme.md`'deki tekrar listesine bak, girilmişse
o notu tekrarlama, üstüne koy.

## 4. Şekiller

Mevcut notlardaki şemaların çoğu kitaptan alınmamış, not için çizilmiş.
**Bunları sen üret** — akış şemaları, karar algoritmaları, evre
diyagramları, karşılaştırma tabloları HTML tablosu veya satır içi SVG
olarak. Altyazıya `(Görsel bu not için çizildi.)` yaz.

Gerçek klinik fotoğraf, atlas çizimi, radyoloji görüntüsü gerekiyorsa
çıkaramazsın: yerine `[ŞEKİL: <kitap> s.<PDF sayfası> — <ne olduğu>]`
yer tutucusu bırak ve nota son verirken kullanıcıya hangi sayfaları
çıkarması gerektiğini söyle. Yöntem: `kbb/gorsel-cikarma.md`.

## 5. Drive'a yaz

Notu **HTML olarak** yaz, `create_file` ile yükle:

- `contentMimeType`: `text/html`
- `base64Content`: HTML'in base64'ü (Türkçe karakterler için UTF-8)
- `parentId`: `1xj_fifWwpPrZN_Oryb4a7u1Le1e9UdeD` (`KBB_not_claude`)
- `title`: `gun-NN-konu-slug`

Drive bunu formatlı Google Doc'a çevirir — başlıklar, tablolar, listeler,
vurgular korunur. Kullanıcı Dosya → İndir → PDF ile PDF alır. Bu doğrulandı.

Drive'a hazır PDF **yükleyemezsin**; sebebi `kbb/kararlar.md` içinde.

## 6. Bitirince

`kbb/ilerleme.md` dosyasına yeni günü ekle, commit'le ve push'la. Bu dosya
güncellenmezse bir sonraki oturum kaldığın yeri bilemez.

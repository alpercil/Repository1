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

### Görsel bütçesi — pazarlık konusu değil

KBB görsel bir daldır; anatomiyi ve cerrahi adımı tarifle anlatmak
yetmiyor. Her gün notunda **en az 8 görsel** olacak; cerrahi ya da anatomi
ağırlıklı konularda **12-14**. Soru notlarında en az 2.

Yerleşim kuralı: **bir anatomik yapıyı, bir sınıflamayı ya da bir cerrahi
adımı tarif ediyorsan görseli aynı bölümde, tarifin hemen altında olacak.**
Bütün görselleri notun sonuna yığma.

Notu bitirmeden önce şu denetimi yap — her biri için görsel var mı:

| Metinde geçen | Görsel gerekir mi |
| --- | --- |
| Üç boyutlu anatomik ilişki (valv açısı, üçgen, komşuluk) | **Evet, şart** |
| Sınıflama (Cottle, Wullstein, evreleme) | **Evet** — tiplerin şeması yan yana |
| Cerrahi teknik, insizyon, greft yerleşimi | **Evet** |
| Tanıması görsel olan acil (hematom, apse, nekroz) | **Evet, fotoğraf** |
| Karar akışı, tedavi basamağı, zaman penceresi | **Evet** — akış şeması |
| Test eğrisi (odyogram, timpanogram, rinometri) | **Evet** |
| Sadece sayı/oran karşılaştırması | Tablo yeterli |

Sayı tutmuyorsa notu teslim etme; eksik kalan yerlere şema çiz.

### Şema tek başına yetmez

Çizdiğin şema kavramı anlatır, **gerçek görüntüyü öğretmez.** Radyolojiyi,
endoskopik görünümü, klinik tabloyu ve gerçek anatomiyi tanımak fotoğraf
ister. Bu yüzden görsellerin **hepsi kendi şeman olamaz** — her notta hem
çizilmiş şema hem gerçek görüntü bulunacak. Kaba oran: yaklaşık yarı yarıya.

Kimin ne işe yaradığı:

| Şema (kendi çizimin) | Gerçek görüntü (internet / kitap) |
| --- | --- |
| Karar akışı, algoritma, zaman penceresi | Radyoloji (BT, MR, USG) |
| Sınıflama tiplerini yan yana koymak | Endoskopik ve otoskopik görünüm |
| Cerrahi adım sırası, insizyon hattı | Klinik tablo (deformite, şişlik, döküntü) |
| Patofizyoloji zinciri | Gerçek anatomik preparat / atlas çizimi |
| Test eğrisinin nasıl okunduğu | Ameliyat sahası fotoğrafı |

### Kaynak üç basamak, sırayla dene:

**1. Kendin çiz.** Mevcut notlardaki şemaların çoğu kitaptan alınmamış, not
için çizilmiş — akış şemaları, karar algoritmaları, evre diyagramları,
karşılaştırma tabloları. Bunları HTML tablosu veya satır içi SVG olarak üret.
Altyazı: `(Görsel bu not için çizildi.)`

**2. İnternetten bul ve dosyaya indir.** Gerçek klinik görüntü gerekiyorsa
(otoskopi, radyoloji, histopatoloji) `WebSearch` ile açık lisanslı bir görsel
bul. **HTML'e uzak URL koyma** — görsel Drive'da dosya olarak durmalı ki not
kendi kendine yetsin ve bağlantı kopsa bile bozulmasın.

İki adım:

1. HTML'de yerel yol kullan:
   `<img src="gorsel/<not-adı>/w01.jpg">` (`w` = web, sırayla numaralandır)
2. Nereden ineceğini `kbb/notlar/gorseller.json` dosyasına yaz:

```json
{
  "gun-15-septum-deviasyonu-septoplasti": [
    { "ad": "w01.jpg",
      "url": "https://commons.wikimedia.org/wiki/Special:FilePath/714_Bone_of_Nasal_Cavity.jpg",
      "commons": "714_Bone_of_Nasal_Cavity.jpg" }
  ]
}
```

Colab defteri bu listeyi okuyup görselleri indirir ve
`KBB_not_claude/gorsel/<not-adı>/` altına yazar; render sırasında dosyadan
okunur. İnmiş görselleri tekrar indirmez.

En güvenilir kalıp:
`https://commons.wikimedia.org/wiki/Special:FilePath/<Dosya_adı.jpg>`
(boşluk yerine alt çizgi kullan)

Dosya adını bulmanın yolu: `WebSearch` ile `allowed_domains:
["commons.wikimedia.org"]` vererek ara. Sonuçtaki `File:` başlıkları birebir
dosya adıdır — **sadece bunları kullan.** Kategori sayfaları da iyi giriş
noktasıdır (`Category:Nasal septum` gibi).

Altyazıya dosya adını, dosya sayfası bağlantısını ve lisansı yaz. Lisansı
aramada net görmediysen "lisans bilgisi dosya sayfasında" yaz — uydurma.

**Konteynerden görsel indiremezsin** — ağ çıkışı kapalı, Wikimedia ve PMC
dahil (`curl` `000` döner). Yani koyduğun URL'nin doğru olup olmadığını
kendin göremezsin. **Bu yüzden uydurma dosya adı yazma**; yalnızca
`WebSearch` sonucunda birebir gördüğün dosya adını kullan.

**Bozuk URL sessizce boş `<img>` bırakır.** Görseller yerel render'da inmez
ama Colab'da iner — bu yüzden Colab çıktısı doğrulamanın asıl yeri. Defter
inemediği her görseli adıyla listeler; kullanıcı bunu iletirse görseli
değiştir.

**3. Kitaptan çıkar.** Atlas çizimi gibi yalnızca kitapta olan görseller için
`[ŞEKİL: <kitap> s.<PDF sayfası> — <ne olduğu>]` yer tutucusu bırak ve nota
son verirken kullanıcıya hangi sayfaları çıkarması gerektiğini söyle.
Yöntem: `kbb/gorsel-cikarma.md`. Bu, kullanıcı müdahalesi gerektiren tek yol —
o yüzden en son çare.

**4. Eski notun görsellerini geri kazan.** Var olan bir gün notunu yeniden
üretiyorsan eski PDF'in içindeki fotoğraflar kaybolmasın: `kbb_pdf_colab`
defterindeki görsel çıkarma hücresi eski PDF'ten resimleri
`KBB_not_claude/gorsel/<not-adı>/` altına yazar; HTML'de bunlara
`<img src="gorsel/<not-adı>/rNN.png">` ile başvur. Yerel render'da boş
çıkarlar, Colab render'ında yerine otururlar.

## 5. Notu yaz ve PDF üret

Notlar **PDF** olarak teslim edilir — Google Doc veya Word değil. Önceki 68
notun hepsi PDF ve düzenleri ortak; o düzen `kbb/notlar/not.css` dosyasında
kodlanmıştır (Gün 4'ün PDF'i çözümlenerek çıkarıldı: A4, Georgia başlık,
Helvetica Neue gövde, beş renkli aksan paleti, 34/41/38 pt kenar boşlukları).

**Sayfa düzeni — sırayla:**

1. `.serit` — bordo program şeridi, altında ince çizgi
2. `.gun` — "Gün NN", 19,2 pt kalın
3. `<h1>` — konu başlığı, Georgia 20,4 pt
4. `table.meta` — Konu / Sistem / Süre / Kaynak künyesi
5. `.icindekiler` — bordo sol kenarlı kutu, iki sütunlu numaralı liste
6. `.lead` — 12,2 pt gri giriş paragrafı
7. `.cipler` — konunun çekirdek kavramları, turkuaz çipler
8. Numaralı `<h2>` bölümler; tablolar `table.veri`, altlarına `.altyazi`
   ile kaynak künyesi; kutular `.kutu` / `.kutu.uyari` / `.kutu.tehlike`
9. `.altbilgi` ve `.yarin` ile kapanış

Dosyayı `kbb/notlar/gun-NN-konu-slug.html` olarak yaz, `not.css`'e bağla.

**PDF üretimi.** Konteynerde `weasyprint` ile üret ve kullanıcıya gönder:

```
pip install weasyprint
python -c "from weasyprint import HTML; HTML('kbb/notlar/gun-NN-....html').write_pdf('/tmp/gun-NN-....pdf')"
```

Sonra `SendUserFile` ile ilet. Drive'a doğrudan yükleyemezsin (sebep:
`kbb/kararlar.md`); kullanıcı dosyayı `KBB_not_claude` klasörüne sürükler,
ya da `kbb/kbb_pdf_colab.ipynb` defterini çalıştırır — o defter depoyu
klonlayıp bütün yeni notları PDF olarak Drive'a yazar.

**Görseller.** Konteynerin ağ çıkışı vekil sunucu tarafından kısıtlı;
görsel sunucuları (Wikimedia, PMC) **403 ile reddediliyor** — ölçüldü. Yani
görselleri buradan indirmek mümkün değil, yerel PDF sadece düzen ve şema
denetimi içindir.

Kullanıcıya PDF verirken bu yüzden `<img>` yuvalarını boş bırakma: her birini
görselin adını ve kaynak bağlantısını taşıyan kesikli çerçeveli bir kutuya
çevirip öyle teslim et — boş kare kötü durur, adı yazan kutu okunur.
Görsellerin gerçekten indiği sürüm `kbb/render_yerel.py` (kullanıcının kendi
bilgisayarı) veya Colab defteri ile üretilir. Görsellerin
gerçekten indiği ve doğru şeyi gösterdiği **Colab çıktısında** doğrulanır —
defter hem eski PDF'lerden kurtarılan fotoğrafları hem `gorseller.json`
listesindeki web görsellerini Drive'a dosya olarak yazar, sonra render eder.

**Üretilen PDF'i doğrula.** `pymupdf` ile sayfa boyutunun A4 (595×842 pt),
punto merdiveninin (20,4 / 19,2 / 15,8 / 12,6 / 12,2 / 10,5) ve beş rengin
(#1c2430 #4b5563 #8a2846 #1f6f6e #a33327) yerinde olduğunu kontrol et.
Bir sayfayı PNG'ye çevirip gözle de bak.


## Soru notu — `Soru/` klasörü

Kullanıcı bir KBB sorusu sorup **"bunu soru klasörüne ekle"** dediğinde, gün
notu değil **soru notu** üretilir. Bunlar 10-15 dakikalık okumalık, tek bir
klinik sorunun cevabı. Drive'da `KBB_not_claude/Soru/` klasöründe,
`soru-<konu-slug>.pdf` adıyla dururlar.

Biçim (`soru-bebekte-timpanometri.pdf` çözümlenerek çıkarıldı):

1. **Şerit:** `KBB · <SİSTEM> · SORU-CEVAP` — sistem adı konuya göre değişir
   (ODYOLOJİ, RİNOLOJİ, OTOLOJİ, BAŞ-BOYUN…)
2. **Başlık:** soruyu soru cümlesi olarak yaz — "Bebekte Timpanometri
   Güvenilir mi?"
3. **Sorunun kendisi:** kullanıcının kendi cümlesiyle, italik gri
   (`.soru-metni`)
4. **Kısa cevap:** turkuaz kutu, hemen başta. Cevabı önce ver, gerekçeyi
   sonra. İki-dört cümle.
5. **Gerekçe bölümleri:** numarasız Georgia başlıklar — "Neden ...?",
   "Çözüm: ...", eşik/karşılaştırma tablosu
6. **Pratik özet:** kehribar kutu, tek paragraf, doğrudan uygulanabilir
7. **Kaynaklar**
8. **Alt bilgi:** `Kişisel çalışma notu · eğitim amaçlı.` + konunun hangi
   müfredat günleriyle ilişkili olduğu — `kbb/ilerleme.md`'ye bakıp doğru gün
   numaralarını ver

HTML'de `<body class="soru">` kullan; `not.css` ölçeği ve tablo rengini buna
göre ayarlar. Dosya `kbb/notlar/soru-<slug>.html` olarak yazılır.

Uzunluk: 2-4 sayfa. Gün notundaki gibi içindekiler, videolar veya "yarın"
satırı yoktur.

## 6. Bitirince

Gün notuysa `kbb/ilerleme.md` dosyasına yeni günü ekle, commit'le ve
push'la. Bu dosya güncellenmezse bir sonraki oturum kaldığın yeri bilemez.
Soru notu için ilerleme dosyasına dokunma; sadece HTML'i commit'le.

**Simge kullanma.** `⚠` gibi karakterler Colab'ın fontlarında yok ve PDF'te
boş kutu olarak çıkıyor. Uyarı işareti gerekiyorsa satır içi SVG ile çiz —
`kbb/notlar/gun-69-...html` içinde örneği var.

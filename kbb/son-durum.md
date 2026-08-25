# Nerede kaldık

Bu dosya oturumlar arası devir kaydıdır. **Yeni bir oturum işe buradan
başlar:** önce burayı oku, sonra `CLAUDE.md` ve
`.claude/skills/kbb-gunluk-not/SKILL.md`.

Son güncelleme: **2026-08-25**

---

## Program durumu

- **Gün 1-69** tamamlandı. Notlar Drive'da `PAÜ/KBB_not_claude/` altında.
- **Sıradaki:** Gün 70 — Hipofarenks Kanseri ve Zenker Divertikülü. Öneri
  yapıldı, yazarın onayı bekleniyor.
- Soru notları `KBB_not_claude/Soru/` altında.

## Bu oturumda (25 Ağustos, yerel) neler oldu

Bu ilk **yerel** oturum. Bulutta ölçülmüş iki kısıt burada geçerli değil:

- **Ağ açık.** Commons ve PMC'den görsel iniyor (ölçüldü: HTTP 200, gerçek JPEG).
  `SKILL.md` §4'teki "konteynerden görsel indiremezsin, 403 döner" uyarısı ve
  yer tutucu kutuya çevirme kuralı yerelde gereksiz. URL'lerin doğruluğu da
  artık kendim doğrulayabiliyorum.
- **Kaynak kitapların tamamı diskte** (`~/Desktop/KBB/`, 18 PDF + Cummings'in
  35 bölümü). Drive'ın ~50 MB metin çıkarma sınırı, `download_file_content`'in
  10 MB sınırı ve kitap parçalama düzeni burada devrede değil.
  **Ama:** Önerci Cilt 5 (larenks bölümleri) ve Koç C taranmış, metin katmanı yok —
  yerelde de okunamıyor, OCR gerekiyor.

**Yerel render kurulumu çalışır durumda**
`~/Desktop/claude_code/.venv-kbb` (weasyprint 69.0, requests, pymupdf) +
`brew install pango`. Bu Mac'te Homebrew kütüphaneleri sistem yolunda olmadığı
için **`DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib` şart** — `render_yerel.py`'nin
docstring'indeki kullanım satırı bu makinede olduğu gibi çalışmaz:

    cd <depo> && DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib \
      ~/Desktop/claude_code/.venv-kbb/bin/python kbb/render_yerel.py

**Gün 69 görsel hatası düzeltildi**
HTML üç Commons görselini doğrudan uzak URL ile çağırıyordu (§4 bunu yasaklıyor)
ve görseller hiç inmiyordu — PDF 0,16 MB, içinde tek görsel yok. URL'ler
`gorseller.json`'a taşındı, `src`'ler yerel yola çevrildi; PDF 1,79 MB.
Üç Commons dosya adının gerçekten var olduğu doğrulandı.

**Yeni soru notu**
`soru-larengeal-lokoplazi-takip` — DL sonrası lökoplazide takip, aralık, ek
girişim ve tetkik kararı. 7 sayfa, 4 görsel (2 çizim + PMC'den 2 gerçek görsel,
CC BY 4.0). **Drive'a yerelden doğrudan kopyalandı** (`Soru/` altına) — mount
yazılabilir olduğu için `CLAUDE.md`'deki "PDF'i sohbette gönder, yazar kendisi
koyar" adımına gerek kalmadı.

**17-30 arası notlar yeniden üretildi (14 not)**
Görsel bütçesi kuralı konmadan önce üretilmiş on dört not, `SKILL.md` §4'e göre
yeniden yazıldı; PDF'leri Drive'da **aynı adla** değiştirildi (dosya kimliği
korunduğu için Drive'da yeni sürüm oldu, kopya oluşmadı). Ayrıntılı tablo
`kbb/ilerleme.md`'de. Bu iş sırasında ortaya çıkan üç teknik bulgu:

- **SVG `<text>` içinde `<b>` kullanılamaz.** WeasyPrint kalan metni şema
  kutusunun dışına atıyor ve içerik sessizce kayboluyor. Gün 17'nin **yayımlanmış**
  sürümünde bu yüzden bir etiket (&ldquo;+ PET-BT&rdquo;) kayıptı; düzeltilip
  yeniden yüklendi. Doğrusu `<tspan font-weight="bold">`.
- **SVG özniteliklerinde `var(--x)` siyaha düşer.** WeasyPrint CSS değişkenini
  SVG *özniteliğinde* çözmüyor; `:root`'a değişken köprüsü eklemek işe yaramıyor
  (denendi, geri alındı). Şemalarda düz hex renk yazılmalı.
- **Eski notlardaki `class="num"` tablo sınıfı değil**, satır içi sayı vurgusu.
  Dönüştürücü bunu tablo sınıfıyla karıştırıyordu; düzeltildi.

Üçü de `kbb/not_denetle.py`'ye kural olarak eklendi — **not teslim edilmeden
önce bu denetleyici çalıştırılmalı.**

**İki yeni araç**
- `kbb/gorsel_ara.py` — Commons'ta ara, lisansı doğrula, indir. Yalnızca CC0 /
  kamu malı / CC BY / CC BY-SA kabul ediyor, reddedilenleri gerekçesiyle yazıyor.
  `kontak` komutu adayları tek ızgaraya diziyor. **Her aday görsel gözle
  doğrulanmalı:** bu oturumda arama sonucuna uyup içeriği tutmayan görseller
  çıktı (bir THY uçağı fotoğrafı, kitlesi görünmeyen tanınabilir bir yüz portresi,
  apsesi okunmayan bir BT).
- `kbb/not_denetle.py` — teslim öncesi denetleyici: SVG içinde HTML etiketi,
  uzak `<img src>`, eksik görsel dosyası, sembol karakteri, görsel bütçesi,
  SVG içinde `var()`.

**Serbest lisanslı görüntü bulunamayan konular**
22, 24, 25, 28, 29. Bu notların içinde **"Gerçek görüntü sınırı"** paragrafı var:
ne arandı, ne bulunamadı, ne neden reddedildi açıkça yazılı. Uydurulmadı,
sessizce atlanmadı.

## Bu oturumda (22-24 Ağustos) neler oldu

**Yeni soru notları**
- `soru-asnik-tedavi-protokolu` — ASNİK'te steroid dozu, intratimpanik
  enjeksiyon, HBO. 7 sayfa. Drive'da.
- `soru-osas-tanidan-cerrahiye` — arousal, Friedman/Mallampati, tetkikler,
  SFORL 2022 DISE, AHİ eşikleri, cerrahi başarı, HGNS, tirzepatid. 12 sayfa,
  10 şema + 9 video bağlantısı. **Yazar Drive'a kendisi yükleyecek.**

**Gün 15 yeniden üretildi**
4 görselden 21 görsele çıktı: 10 çizilmiş şema + 7 kitap/atlas görseli +
4 Commons bağlantısı. HTML'i `kbb/notlar/` altında, görselleri
`kbb/notlar/gorsel/gun-15-.../` altında.

**Kural değişikliği (25 Ağustos, yazarın kararı)**
Teslim yolu artık oturumun türüne bağlı: **yerel oturumda Drive'a doğrudan
yaz** (`cp` ile, aynı adda dosya varsa üzerine yazma — sor), bulut oturumunda
eskisi gibi PDF'i sohbette gönder. `CLAUDE.md` "Notların teslimi" §2 ve
`SKILL.md` §5 birlikte güncellendi; §4'teki "görsel indiremezsin" uyarısı da
yerel/bulut ayrımına çevrildi.

**Kural değişiklikleri (22-24 Ağustos)**
- Görsel bütçesi: gün notunda en az 8, cerrahi/anatomi konularında 12-14
  görsel — `SKILL.md` §4.
- Şema tek başına yetmez; her notta hem çizim hem gerçek görüntü olacak.
- Sadece PDF üret, sohbette gönder, adlandırma standart — `CLAUDE.md`.
- Colab yolu **iptal**; yazar PDF'i kendisi Drive'a koyuyor.

**Teknik keşif — bu en önemlisi**
Kitaplardan ve eski PDF'lerden **görsel çıkarabiliyorum**. Yöntem
`kbb/kararlar.md`'de yazılı: `download_file_content` sonucu bağlam sınırını
aşınca bağlayıcı base64'ü diske yazıyor, o dosya Bash + `pymupdf` ile
işlenebiliyor. Sınır **10 MB** — kitapların görsel yoğun parçaları 24-37 MB
olduğu için doğrudan açılamıyor, ama **üretilmiş gün notu PDF'leri (0,3-2 MB)
açılabiliyor ve zaten kitaptan seçilmiş şekilleri taşıyor.** Pratikte en
verimli kaynak bu.

**Ölçülen sınır:** konteynerin ağ çıkışı görsel sunucularını (Wikimedia, PMC)
**403 ile reddediyor**. İnternetten görsel indirilemiyor. Gerçek fotoğraf
gerekiyorsa kaynak eski notlar ve kitaplardır.

## Açık işler

| İş | Durum |
| --- | --- |
| **Gün 70** (Hipofarenks kanseri, Zenker) | Yazarın "başla" demesi bekleniyor |
| **68 notun görsel taraması** | 15 ve 17-30 bitti (15 not). Kalan: 1-14, 16 ve 31-68 |
| **Gün 69 görsel bütçesi** | 11 görsel (3 foto + 8 şema). §4 cerrahi konularda 12-14 istiyor — hâlâ altında |
| **`soru-asnik-tedavi-protokolu` görsel bütçesi** | Tek görseli var (şema). §4 soru notlarında en az 2 istiyor |
| **Drive'da ad tutarsızlığı** | Depoda `soru-osas-tanidan-cerrahiye.html`, Drive'da `soru-osasdan-cerrahiye.pdf` |
| Önerci Cilt 1 s.281-400 (kolesteatom) OCR | `kbb/kbb_ocr_colab.ipynb` hazır, çalıştırılmadı |
| ASNİK notunun Google Doc kopyası | Drive'da `Soru/` altında duruyor, silinmedi. Yazar karar verecek |
| `soru-om-ostaki-perforasyon.pdf` iki kopya | Drive'da mükerrer, dokunulmadı |

## Yazarın kalıcı tercihleri

- Cevaplar **Türkçe**, kaynağa dayalı, hafızadan değil.
- Kitapta bulunamayan şeyi açıkça söyle, uydurma.
- Depo mekaniğini (branch, PR, merge) rapor etme — sessizce yap.
- PR'ları kendin birleştir, sorma.
- Klinik sorularda kaynak künyesi ve DOI ver.
- Görsel URL'si uydurma; yalnızca aramada birebir gördüğün dosya adını kullan.

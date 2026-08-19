# KBB kaynak kitapları — parça dizini

Kaynak kitaplar Google Drive'ın `KBB_kaynak` klasöründe
(https://drive.google.com/drive/folders/1M2ofrodfTkZS0bxywyOo_g0Hq1xv3WFi)
parçalar halinde duruyor.

## Neden parçalı

Drive'ın PDF metin çıkarma servisi büyük dosyalardan hiç içerik döndürmüyor.
Ölçtüğüm sınır: **21 MB okunuyor, 55 MB okunmuyor** — Drive'ın ~50 MB'lık PDF
dönüştürme limitiyle örtüşüyor. Kitapların hepsi 274-988 MB aralığındaydı ve
hiçbiri okunamıyordu. Parçalar ~30 MB hedefiyle üretildi, en büyüğü 46 MB.

## Dosya adı deseni

```
<kitap adı>-<ilk sayfa>-<son sayfa>.pdf
```

Sayfa numaraları 4 haneli ve **orijinal PDF'in** sayfa numaraları. Örnek:
`1KBB Otoloji-0201-0240.pdf`, Önerci Cilt 1'in PDF sayfa 201-240 arası.

## Basılı sayfa ↔ PDF sayfa farkı

Önerci Cilt 1'de basılı sayfa ile PDF sayfası arasında ofset var: **b.500-530
bölgesinde PDF = basılı + 4**. Ofset kitabın her yerinde aynı olmayabilir —
bir bölümü açtığında ilk sayfadaki basılı numarayı kontrol et.

Doğrulanmış örnek: Bölüm 30 (Akut Süpüratif Otitis Media), basılı s.215-222,
PDF s.219-226 → `1KBB Otoloji-0201-0240.pdf` içinde.

## Kitaplar

### 1KBB Otoloji.pdf — Önerci Cilt 1, Otoloji
462 sayfa · 12 parça · 40 sayfalık aralıklar

**Bu kitabın metin katmanı kısmi — ölçüldü.** Parça `0281-0320`, `0321-0360`
ve `0361-0400` hiç metin döndürmüyor (sadece sayfa işaretleri geliyor);
kolesteatom bölümleri bu aralıkta ve okunamıyor. Okunabilen bölgeler: en
azından `0201-0240`, `0241-0280` (Böl. 32-35'e kadar) ve `0401-0440`,
`0441-0462` (Böl. 50-54, timpanoplasti ve mastoidektomi cerrahisi).

Bu boşluk OCR ile kapatılabilir — yöntem: `kbb/ocr-yontemi.md`.

Hangi parçada ne olduğunu aramanın hızlı yolu: Drive'ın tam metin indeksi.
`parentId = '<KBB_kaynak>' and fullText contains 'mastoidektomi'` gibi bir
sorgu, metni okunabilen parçaları doğrudan listeler — metinsiz parçalar zaten
sonuçta çıkmaz.

**Ofset bu kitapta bölgeye göre değişiyor:** Böl. 30 civarında PDF = basılı
+ 4; Böl. 50 civarında PDF = basılı + 14 (PDF s.401 = basılı s.387).
`0001-0040` `0041-0080` `0081-0120` `0121-0160` `0161-0200` `0201-0240`
`0241-0280` `0281-0320` `0321-0360` `0361-0400` `0401-0440` `0441-0462`

### 2KBB Nörootoloji.pdf — Önerci Cilt 2
368 sayfa · 9 parça · 42 sayfalık aralıklar
`0001-0042` `0043-0084` `0085-0126` `0127-0168` `0169-0210` `0211-0252`
`0253-0294` `0295-0336` `0337-0368`

### 3-4KBB Burun ve Yüz Hastalıkları.pdf — Önerci Cilt 3-4
838 sayfa · 15 parça · 57 sayfalık aralıklar
`0001-0057` `0058-0114` `0115-0171` `0172-0228` `0229-0285` `0286-0342`
`0343-0399` `0400-0456` `0457-0513` `0514-0570` `0571-0627` `0628-0684`
`0685-0741` `0742-0798` `0799-0838`

### 5KBB Baş-Boyun.pdf — Önerci Cilt 5, Baş Boyun Cerrahisi
688 sayfa · 19 parça · aralıklar eşit değil (kitabın ikinci yarısı görsel
ağırlıklı, orada 28 sayfaya inildi)
`0001-0056` `0057-0112` `0113-0168` `0169-0224` `0225-0280` `0281-0336`
`0337-0364` `0365-0392` `0393-0420` `0421-0448` `0449-0476` `0477-0504`
`0505-0532` `0533-0560` `0561-0588` `0589-0616` `0617-0644` `0645-0672`
`0673-0688`

### CAN.KOÇ.2019.KİTAP.pdf — Koç C (ed), KBB Hastalıkları ve Baş Boyun Cerrahisi, 3. baskı
1465 sayfa · 25 parça · 60 sayfalık aralıklar
`0001-0060` `0061-0120` `0121-0180` `0181-0240` `0241-0300` `0301-0360`
`0361-0420` `0421-0480` `0481-0540` `0541-0600` `0601-0660` `0661-0720`
`0721-0780` `0781-0840` `0841-0900` `0901-0960` `0961-1020` `1021-1080`
`1081-1140` `1141-1200` `1201-1260` `1261-1320` `1321-1380` `1381-1440`
`1441-1465`

### CUMMINGS OTOLARYNGOLOGY–HEAD AND NECK 7th Ed 2021.pdf
3954 sayfa · 37 parça · çoğu 125 sayfalık, görsel yoğun bölümlerde 62'ye iner
`0001-0125` `0126-0250` `0251-0375` `0376-0437` `0438-0500` `0501-0562`
`0563-0625` `0626-0750` `0751-0875` `0876-1000` `1001-1125` `1126-1250`
`1251-1375` `1376-1437` `1438-1500` `1501-1562` `1563-1625` `1626-1687`
`1688-1750` `1751-1875` `1876-2000` `2001-2125` `2126-2250` `2251-2375`
`2376-2500` `2501-2625` `2626-2750` `2751-2875` `2876-3000` `3001-3125`
`3126-3250` `3251-3375` `3376-3500` `3501-3625` `3626-3750` `3751-3875`
`3876-3954`

Dosya adındaki tire **en dash** (`–`), normal tire değil. Arama yaparken
`title contains 'CUMMINGS'` gibi kısa bir parça kullan.

### Baş ve Boyun Cerrahisi Atlası.pdf — Loré & Medina, 4. baskı (çev. Önerci, Korkmaz)
1546 sayfa · 6 parça · 272 sayfalık aralıklar
`0001-0272` `0273-0544` `0545-0816` `0817-1088` `1089-1360` `1361-1546`

Gün 61-68 notlarının kaynağı. İki uyarı:

- **Sayfa ofseti büyük.** Ölçüldü: PDF s.817 = basılı s.764, yani
  **PDF = basılı + 53**. Gün 68'in kaynak gösterdiği basılı s.1015-1068
  (Bölüm 19, Trakea ve Mediastinum) PDF'te ~1068-1121'e denk gelir; basılı
  s.65-86 (Bölüm 2, Acil İşlemler) ise PDF'te ~118-139. Ofset tek noktada
  ölçüldü, kitabın her yerinde aynı olmayabilir — bölümü açtığında ilk
  sayfadaki basılı numarayı doğrula.
- **Metin OCR'lı.** Kitap taranmış ve karakter hataları var
  ("Karsinamunun", "KAViTE", "yayılıını"). Anlam bozulmuyor ama birebir
  alıntı yaparken düzeltmek gerekir.

### Scott_Browns_Otorhinolaryngology.pdf
1701 sayfa · 16 parça
`0001-0135` `0136-0270` `0271-0303` `0304-0337` `0338-0405` `0406-0540`
`0541-0675` `0676-0810` `0811-0945` `0946-1080` `1081-1147` `1148-1215`
`1216-1350` `1351-1485` `1486-1620` `1621-1701`

## Parçalanmamış kitaplar

Şu kaynaklar Drive'da tek parça ve **50 MB altında olduğu için doğrudan
okunuyor**, bölmeye gerek yok:

| Dosya | Boyut |
| --- | --- |
| Kulak_Burun_Bogaz_Acillerine_Guncel_Yaklasimlar.pdf | 10,4 MB |
| KBB ders kitabı 1.pdf (İrfan Papila, İÜC) | 7,4 MB |
| KBB ders kitabı 2.pdf (İrfan Papila, İÜC) | 5,7 MB |
| KBB öğrenci notları.pdf (SBÜ Hamidiye 2021) | 3,9 MB |

## Henüz bölünmemiş

Şu an yok — programın kullandığı yedi kaynağın hepsi parçalanmış durumda.
Yeni bir kitap eklenirse yöntem: `kbb/bolme-yontemi.md`.

## Klasörler

| Ne | Drive konumu |
| --- | --- |
| Kaynak kitap parçaları (139 dosya, 7 kitap) | My Drive → `KBB_kaynak` |
| Gün notları 1-9 | `KBB_not_claude/01/` |
| Gün notları 10-68 | `KBB_not_claude/` |
| Soru bankası | `KBB_not_claude/Soru/` |
| Bölünmemiş kitaplar | `iMac'im → Desktop → KBB` ve My Drive → `PAÜ` → `Kitap Pdf` |

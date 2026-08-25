# Nerede kaldık

Bu dosya oturumlar arası devir kaydıdır. **Yeni bir oturum işe buradan
başlar:** önce burayı oku, sonra `CLAUDE.md` ve
`.claude/skills/kbb-gunluk-not/SKILL.md`.

Son güncelleme: **2026-08-24**

---

## Program durumu

- **Gün 1-69** tamamlandı. Notlar Drive'da `PAÜ/KBB_not_claude/` altında.
- **Sıradaki:** Gün 70 — Hipofarenks Kanseri ve Zenker Divertikülü. Öneri
  yapıldı, yazarın onayı bekleniyor.
- Soru notları `KBB_not_claude/Soru/` altında.

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

**Kural değişiklikleri (hepsi yazılı)**
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
| **68 notun görsel taraması** | Yazar "15'i yaptıktan sonra konuşalım" dedi. Gün 15 bitti — sıra bunda |
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

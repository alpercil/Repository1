---
name: kbb-gunluk-not
description: KBB günlük okuma programının gün notunu üretir ve KBB sorularını kaynak kitaplardan yanıtlar. Kullanıcı "Gün N", "günlük not", "yeni not", "KBB notu" dediğinde; ya da kulak burun boğaz / otolaryngoloji hakkında kaynağa dayalı bir soru sorduğunda kullan.
---

# KBB günlük okuma notu

Alper'in KBB günlük okuma programı. Gün 1'den Gün 68'e kadar tamamlandı;
her gün bir konu, kaynak kitaplardan okunup yapılandırılmış bir nota
dönüştürülüyor.

Bu beceri iki iş için:

1. **Yeni gün notu üretmek** ("Gün 69 yap", "yarınki notu hazırla")
2. **KBB sorusunu kaynaktan yanıtlamak** ("konka bülloza neden opere edilir?")

İkisinde de cevap kaynak kitaptan gelir, hafızadan değil.

## Önce kaynağı aç

Kaynak kitaplar Google Drive'da, `KBB_kaynak` klasöründe, sayfa aralığına
göre adlandırılmış parçalar halinde duruyor. Hangi konunun hangi parçada
olduğu için `kbb/kaynak-index.md` dosyasına bak.

Sıra:

1. `kbb/kaynak-index.md`'den konuya uyan kitabı ve parçayı seç.
2. Drive'da `search_files` ile parçayı bul, `read_file_content` ile oku.
   Dosya adı deseni: `<kitap>-<ilk sayfa>-<son sayfa>.pdf`, 4 haneli.
3. Metin büyük gelirse konteynerde bir dosyaya yazılır; `grep` ile aradığın
   bölümü bul, tamamını bağlama almadan çalış.
4. Bölüm sınırını doğrula — parça sınırları bölüm sınırlarıyla hizalı
   değil. Aradığın bölüm iki parçaya bölünmüşse ikisini de oku.

Kitapta bulamazsan bunu nota yaz; uydurma.

## Güncel literatür

Kitap bilgisini son 2-3 yılın literatürüyle tamamla. PubMed araması yap,
DOI bağlantısını ekle, kitaptaki bilginin güncelliğini yitirdiği yerleri
açıkça belirt (örn. Gün 4 notunda PCV7 → PCV15/PCV20 geçişi).

## Not biçimi

Gün 68 notunun yapısı referans alınır:

- **Başlık:** `Gün NN — Konu`
- **Üst satır:** `KBB · GÜNLÜK ÇALIŞMA NOTU · GÜN NN`, ardından yaklaşık
  okuma süresi (~60-70 dk) ve kaynak künyesi
- **Kaynak notu:** hangi kitabın hangi bölümü, hangi *basılı* sayfa aralığı
- **İçindekiler:** numaralı
- **Tek cümlelik özet:** konunun çekirdeği
- **Numaralı bölümler:** tanım/önem → fizyopatoloji → klinik → tanı →
  ayırıcı tanı → tedavi → komplikasyon → korunma
- **Tablolar:** altına kaynak künyesi (kitap, bölüm, basılı sayfa, şekil no)
- **⚠ Kırmızı bayraklar:** ne zaman ileri tetkik/sevk
- **Poliklinik pratik özeti:** numaralı, uygulanabilir maddeler
- **▶ Videolar:** YouTube arama bağlantıları
- **Güncel literatür:** PubMed, DOI'li, ardından "Klinik çıkarım"
- **Kaynaklar**
- **Alt bilgi:** `Kişisel çalışma notu · eğitim amaçlı. Klinik kararlar için
  güncel kılavuz ve kurum protokolü esastır.`
- **Son satır:** `Yarın · Gün NN+1 — <konu>`

Dil Türkçe. Anatomik ve farmakolojik terimler Türkçe tıp yazımına uygun.

## Notu nereye yazarsın

Notu **Google Doc olarak** `KBB_not_claude` klasörüne oluştur:
`create_file` aracına `textContent` ver, `parentId` olarak o klasörü seç.
Kullanıcı Doc'u tek tıkla PDF'e aktarabilir.

Dosya adı deseni mevcut notlarla aynı olsun: `gun-NN-konu-slug`.

**Sınır:** Drive'a hazır PDF yükleyemezsin — yükleme içeriği base64 metin
olarak üretmeyi gerektirir, bu tek mesajda üretilebilecek boyutu aşar.
Aynı sebeple kitaplardan **görsel çıkaramazsın**; Drive bağlayıcısı PDF'i
yalnızca metin olarak veriyor. Şekil gereken yere ne konması gerektiğini
yaz, kullanıcı kendisi ekler.

## Bitirince

`kbb/ilerleme.md` dosyasına yeni günü ekle ve commit'le. Bu dosya
güncellenmezse bir sonraki oturum kaldığın yeri bilemez.

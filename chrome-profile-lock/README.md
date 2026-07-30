# Profile Lock

Chrome profilini şifreyle kilitleyen bir uzantı: boşta kalmada, tarayıcı
açılışında ve OS ekran kilidinde otomatik kilitlenir.

## Bilinen sınırlamalar (tehdit modeli)

Bu uzantı bir **caydırıcıdır**, gerçek bir güvenlik sınırı değildir. Chrome
extension API'lerinin platform kısıtları nedeniyle aşağıdakiler
düzeltilemez/atlatılabilir:

- **`chrome://extensions`** sayfasına content script enjekte edilemez.
  Uzantının varlığını bilen biri oraya gidip uzantıyı tek tıkla devre dışı
  bırakabilir veya kaldırabilir.
- **Gizli (Incognito) pencereler**: Chrome, kullanıcı `chrome://extensions`
  üzerinden "Gizli modda izin ver" seçeneğini elle açmadığı sürece uzantıyı
  bu pencerelerde hiç çalıştırmaz. Bu uzantı da varsayılan olarak gizli
  modda çalışmaz; tam koruma için kullanıcının bu izni manuel olarak
  vermesi gerekir (ve bu izin başka biri tarafından da manuel olarak
  kapatılabilir).
- `chrome://history`, `chrome://downloads`, `chrome://settings` gibi diğer
  dahili sayfalar da kilit dışıdır.
- **"Paketlenmemiş öğe yükle" (Load unpacked) klasörü**: Chrome bu klasörü
  kendi içine kopyalamaz, dosyaları doğrudan oradan okur. Bu klasöre dosya
  sistemi erişimi olan biri:
  - `background.js`'i düzenleyip şifre kontrolünü tamamen devre dışı
    bırakabilir,
  - `manifest.json`'ı silip/bozup uzantıyı çalışmaz hale getirebilir,
  - veya `chrome://extensions`'tan tek tıkla uzantıyı kapatabilir/kaldırabilir.

  Klasörü gizlemek (Windows'ta "Gizli" özniteliği, Mac/Linux'ta `.` ile
  başlayan isim) *rastgele/meraklı* birine karşı makul bir engel oluşturur,
  ama "gizli öğeleri göster" ayarını bilen ya da arayan biri saniyeler
  içinde bulabilir — ve klasörü bulduktan sonra, sizinle **aynı işletim
  sistemi kullanıcı hesabını** paylaşıyorsa yine de silebilir/değiştirebilir.
  Bu durumda gerçek koruma dosya izinlerinden değil, ayrı bir kullanıcı
  hesabından ve o hesabın **Yönetici olmamasından** gelir.

Kısacası bu araç, "masadan kısa süreliğine kalkarken ekran açık kalmasın"
senaryosu için uygundur; gerçek bir erişim kontrolü/güvenlik duvarı yerine
geçmez. Aynı işletim sistemi hesabını paylaşan biri karşısında, işletim
sisteminin kendi ekran kilidi (Win+L / Cmd+Ctrl+Q) her zaman daha güçlü ve
bu uzantıdan bağımsız çalışan bir alternatiftir.

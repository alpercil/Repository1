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

Kısacası bu araç, "masadan kısa süreliğine kalkarken ekran açık kalmasın"
senaryosu için uygundur; gerçek bir erişim kontrolü/güvenlik duvarı yerine
geçmez.

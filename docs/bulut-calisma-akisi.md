# Bulut Üzerinde Çalışma ve Senkronizasyon

Bu belge, Repository1 üzerindeki tüm Claude Code çalışmasının bulut üzerinden
yürütülmesi ve her cihazda aynı durumun görülmesi için izlenen akışı anlatır.

## Neden bulut?

Claude Code oturumları claude.ai/code adresinden, masaüstü uygulamasından veya
mobil uygulamadan başlatıldığında uzak bir bulut konteynerinde çalışır. Depo,
oturum açıldığında sıfırdan klonlanır; oturum bittikten bir süre sonra konteyner
geri alınır.

Bunun tek bir pratik sonucu var: **kalıcı olan tek şey uzak depoya (origin)
gönderilmiş olan daldır.** Konteynerin diski kalıcı değildir. Dolayısıyla
senkronizasyon bir "bulut diski" ile değil, git ile sağlanır.

## Oturum başlatma

- Tarayıcı: https://claude.ai/code
- Masaüstü / mobil uygulama: aynı hesapla açılan oturumlar da bulutta çalışır.
- Ortam ayarları (ağ politikası, ortam değişkenleri, kurulum betikleri) ve
  oturum/tetikleyici kavramlarının tamamı burada belgelenmiştir:
  https://code.claude.com/docs/en/claude-code-on-the-web

## Her oturumda izlenecek adımlar

1. **Başlangıç kontrolü.** `SessionStart` kancası otomatik olarak çalışır ve
   dalın uzak depoya göre ileride mi geride mi olduğunu, çalışma alanında
   commit edilmemiş değişiklik olup olmadığını yazar. Kanca hiçbir şeyi
   değiştirmez, yalnızca rapor verir.
2. **Geride ise önce çek.** `git pull origin <dal>`
3. **Dal üzerinde çalış.** `master` üzerine doğrudan commit atma.
4. **Küçük ve açıklayıcı commit'ler at.**
5. **Oturum bitmeden gönder.** `git push -u origin <dal>` — gönderilmemiş iş,
   kaybolmuş iştir.
6. **Pull request aç.** Değişikliğin incelenebilir bir yeri olsun.

## Yerel (local) çalışma

Yerelde Claude Code kullanmak sorun değil; yeter ki aynı disiplin uygulansın:
başlarken çek, biterken gönder. Bulut ile yerel arasında yaşanan tek gerçek
senkronizasyon sorunu, uzak depodan geride kalmış bir yerel kopyadır.

## Ayarların senkronizasyonu

`.claude/settings.json` dosyası git ile takip edildiği için proje ayarları ve
kanca tanımı her oturumda — bulutta da yerelde de — aynıdır. Yalnızca o makineye
özel ayarlar için `.claude/settings.local.json` kullanılır; bu dosya git dışında
tutulur.

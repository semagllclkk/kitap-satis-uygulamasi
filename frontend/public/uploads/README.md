# Kitap Fotoğrafları Klasörü

Bu klasör, projenizdeki kitapların fotoğraflarını yerel olarak (sunucudan) servis etmek için oluşturulmuştur.

## Nasıl Kullanılır?

1. Kitap fotoğraflarınızı bu klasöre kopyalayın (örneğin: `kar.jpg`, `dehset.png` vb.).
2. Uygulamanızın **Admin Paneli > Kitap Yönetimi** sayfasına gidin.
3. Yeni bir kitap eklerken veya mevcut bir kitabı düzenlerken **Kapak URL** alanına dosya yolunu şu şekilde yazın:
   `/uploads/kar.jpg` (Eğer fotoğrafınızın adı `kar.jpg` ise).

Bu sayede fotoğraflar doğrudan kendi projeniz içerisinden, `http://localhost:3001/uploads/kar.jpg` adresinden (Next.js public klasörü üzerinden) sorunsuzca yüklenecektir.

# Automation Server

Bu sunucu VS Code ve Spotify'ı otomatik olarak açmak için kullanılır.

## Otomatik Başlatma Ayarları

Sunucuyu bilgisayar başlangıcında otomatik olarak başlatmak için:

### Yöntem 1: Windows Başlangıç Klasörüne Kısayol Eklemek

1. `Win + R` tuşlarına basın ve `shell:startup` yazıp Enter'a basın
2. Windows Başlangıç klasörü açılacaktır
3. Projenizdeki `start-server.bat` dosyasına sağ tıklayın ve "Kısayol oluştur" seçeneğini seçin
4. Oluşturulan kısayolu kopyalayın ve az önce açılan Başlangıç klasörüne yapıştırın
5. Bilgisayarı yeniden başlattığınızda sunucu otomatik olarak çalışacaktır

### Yöntem 2: Görev Zamanlayıcısı Kullanımı

1. `Win + R` tuşlarına basın ve `taskschd.msc` yazıp Enter'a basın
2. "Basit Görev Oluştur" seçeneğine tıklayın
3. Görev için bir isim verin (örn. "Automation Server")
4. "Bilgisayar başladığında" seçeneğini seçin
5. "Program başlat" eylemini seçin
6. "Gözat" butonuna tıklayın ve `start-server.bat` dosyasının yolunu seçin
7. "Bitti" butonuna tıklayın

## Kullanım

1. VS Code ve Spotify otomatik başlatmak için:

   ```
   http://localhost:5000/automation
   ```

2. Sadece VS Code başlatmak için:
   ```
   http://localhost:5000/open-code
   ```

## Yapılandırma

Spotify playlist ID'sini değiştirmek için `config.json` dosyasını düzenleyin:

```json
{
  "playlistId": "SPOTIFY_PLAYLIST_ID"
}
```

# TCMB EVDS API Key Alma Rehberi

## 1. TCMB EVDS Sistemi Kaydı
- Gidin: https://evds2.tcmb.gov.tr/
- "Kayıt Ol" butonuna tıklayın
- E-posta ve şifre ile üye olun
- E-posta doğrulaması yapın

## 2. API Key Talebi
- Giriş yaptıktan sonra "Hesabım" menüsüne gidin
- "API Anahtarı" veya "API Key" bölümünü bulun
- Yeni API key talebi oluşturun
- Genellikle 1-2 iş günü içinde onaylanır

## 3. API Key Bilgileri
- API Key genellikle şu formatlarda olur:
  - "ABC123DEF456GHI789" (24 karakter)
  - Harf ve rakam karışımı
  - Özel karakterler içermez

## 4. Günlük Limitler
- Genellikle günlük 1000 çağrı limiti
- Aşırı kullanımda bloke olabilir
- Rate limiting uygulanır

## 5. Doğru Endpoint Format
- Base URL: https://evds2.tcmb.gov.tr/service/evds/
- Series kodları: TP.DK.USD.A.YTL (alış), TP.DK.USD.S.YTL (satış)
- Tarih formatı: DD-MM-YYYY (09-12-2025)

## 6. Test Etmek İçin
curl "https://evds2.tcmb.gov.tr/service/evds/series=TP.DK.USD.A.YTL-TP.DK.USD.S.YTL&startDate=08-12-2025&endDate=09-12-2025&type=json&key=YOUR_API_KEY"
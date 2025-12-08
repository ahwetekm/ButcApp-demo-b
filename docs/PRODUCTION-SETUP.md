# Production için PostgreSQL Aktif Etme

## 📋 Production Ortamı İçin

Production ortamında gerçek PostgreSQL veritabanını kullanmak için:

### 1. API Route'larını Geri Yükle
```bash
# src/app/api/investments/route.ts dosyasını production moduna geçir
# PostgreSQL import'larının yorum satırlarını kaldır
```

### 2. Environment Variables
```bash
# .env.local dosyasına ekle
DATABASE_URL=postgresql://username:password@localhost:5432/butcapp_db
```

### 3. Migration Script'ini Çalıştır
```bash
psql -h localhost -U username -d butcapp_db -f migration.sql
```

## 🔧 Development için Geçici Çözüm

Şu anda development ortamında mock data kullanılıyor:
- ✅ Sayfa yenileme sorunu çözüldü
- ✅ pg modül hatası engellendi  
- ✅ Yatırım ekleme butonu çalışıyor
- ✅ Auth sistemi stabil

## 🚀 Production'a Geçiş

1. PostgreSQL sunucusunu kur
2. Migration script'ini çalıştır
3. API route'ları uncomment et
4. Environment variables'ı ayarla

**Not:** Development'de mock mode, production'da gerçek veritabanı kullanılacak.
# 🚨 Production Debugging Guide

## 📋 SORUN ANALİZİ

Browser console log'larına göre hatalar devam ediyor:
- `POST https://butcapp.com/api/auth/check-email 500 (Internal Server Error)`
- `POST https://butcapp.com/api/auth/signup 400 (Bad Request)`

Bu, VPS'e yeni kodların ulaşmadığını veya environment sorunlarını gösteriyor.

---

## 🔧 DEBUG İÇİN ADIMLAR

### **ADIM 1: Debug API'lerini Test Etme**
Aşağıdaki endpoint'leri test edin:

```bash
# Email check debug
curl -X POST https://butcapp.com/api/auth/check-email-debug \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Signup debug  
curl -X POST https://butcapp.com/api/auth/signup-debug \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","fullName":"Test User","captchaAnswer":"123"}'
```

### **ADIM 2: VPS Console Log'larını Kontrol Etme**
```bash
# Application log'larını görüntüle
sudo journalctl -u butcapp -f

# veya PM2 log'ları (kullanılıyorsa)
pm2 logs butcapp

# veya doğrudan log dosyası
tail -f /var/www/butcapp/logs/app.log
```

### **ADIM 3: Environment Kontrolü**
```bash
# VPS'te SSH ile bağlanıp çalıştırın
cd /var/www/butcapp
node -e "
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('Working Directory:', process.cwd());
"
```

---

## 🚀 ACİL ÇÖZÜM ÖNERİLERİ

### **1. Force Deployment**
```bash
cd /var/www/butcapp
git pull origin master
npm install
npm run build
pm2 restart butcapp
# veya
npm start
```

### **2. Environment Reset**
```bash
# .env dosyasını yeniden oluştur
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=file:/var/www/butcapp/db/custom.db
JWT_SECRET=butcapp-secret-key-change-in-production-2024
NEXT_PUBLIC_API_URL=https://butcapp.com
FREECRYPTOAPI_API_KEY=6lfnrxu8889pmxri1y7v
PORT=3000
LOG_LEVEL=debug
EOF

# İzinleri ayarla
chmod 600 .env
```

### **3. Database Fix**
```bash
# Database dizinini kontrol et
sudo mkdir -p /var/www/butcapp/db
sudo chown -R www-data:www-data /var/www/butcapp/db
sudo chmod -R 755 /var/www/butcapp/db

# Database dosyasını kontrol et
ls -la /var/www/butcapp/db/
```

---

## 📊 DEBUG API'LERİN ÖZELLİKLERİ

### **check-email-debug/route.ts**
- ✅ Environment bilgisi gösterir
- ✅ Database path kontrolü
- ✅ Working directory kontrolü
- ✅ Detaylı error logging
- ✅ Query sonuçlarını gösterir

### **signup-debug/route.ts**
- ✅ Request body analizi
- ✅ CAPTCHA validation kontrolü
- ✅ AuthService sonuçlarını gösterir
- ✅ Detaylı error stack trace

---

## 🎯 BEKLENEN SONUÇLAR

Debug API'leri çalıştırdığınızda almanız gereken yanıtlar:

### **Başarılı Email Check:**
```json
{
  "success": true,
  "exists": false,
  "debug": {
    "environment": "production",
    "databaseUrl": "file:/var/www/butcapp/db/custom.db",
    "workingDirectory": "/var/www/butcapp",
    "queryResult": []
  }
}
```

### **Başarılı Signup:**
```json
{
  "success": true,
  "user": {...},
  "token": "...",
  "debug": {
    "environment": "production",
    "databaseUrl": "file:/var/www/butcapp/db/custom.db",
    "workingDirectory": "/var/www/butcapp",
    "userId": "user_..."
  }
}
```

### **Hata Durumunda:**
Debug alanındaki bilgileri kontrol ederek sorunun kaynağını tespit edin.

---

## ⚡ EN HIZLI ÇÖZÜM

Eğer hala sorun yaşıyorsanız, production'da debug mode'u aktif edin:

```bash
export LOG_LEVEL=debug
export NODE_ENV=development
npm start
```

Bu sayede tüm error detaylarını görebilirsiniz.
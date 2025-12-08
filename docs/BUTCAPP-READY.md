# ButcApp.com - CORS ve API Konfigürasyonu Tamamlandı

## 🎯 **YAPILAN DÜZELTMELER**

### ✅ **Domain Yapılandırması**
- **VPS Adresi:** `https://butcapp.com`
- **Environment Variable:** `NEXT_PUBLIC_API_URL=https://butcapp.com`
- **CORS Origin'ler:** `https://butcapp.com` ve `https://www.butcapp.com` eklendi

### ✅ **CORS Middleware Güncellendi**
```typescript
const allowedOrigins = [
  'https://butcapp.com',        // ✅ Production domain
  'https://www.butcapp.com',   // ✅ WWW subdomain
  'https://preview-chat-xxx.space.z.ai', // ✅ Z.ai preview
  'https://space.z.ai',         // ✅ Z.ai main
  'http://localhost:3000',      // ✅ Local development
  'https://localhost:3000'      // ✅ Local SSL
]
```

### ✅ **API Endpoint'leri Güncellendi**
- **Auth API:** `/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/auth`
- **System Status API:** `/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/system-status`
- **CORS Headers:** Tüm API'lere eklendi
- **OPTIONS Method:** Preflight istekleri destekleniyor

### ✅ **Environment Files**
- **`.env`:** Local development için
- **`.env.production`:** Production için hazır
- **`.env.development`:** Development için hazır

## 🚀 **DEPLOYMENT ADIMLARI**

### **1. VPS Sunucusuna Kurulum**
```bash
# VPS'e bağlan
ssh root@your-vps-ip

# Proje dizini oluştur
mkdir -p /var/www/butcapp
cd /var/www/butcapp

# Projeyi kopyala
scp -r /home/z/my-project/* root@your-vps-ip:/var/www/butcapp/

# Environment variables oluştur
nano .env
```

**VPS .env dosyası:**
```env
DATABASE_URL=file:/var/www/butcapp/db/custom.db
JWT_SECRET=butcapp-secret-key-change-in-production-2024
NEXT_PUBLIC_API_URL=https://butcapp.com
NODE_ENV=production
```

### **2. Kurulum ve Başlatma**
```bash
# Dependencies kur
npm install

# Veritabanı kur
npm run db:push

# Build et
npm run build

# PM2 ile başlat
pm2 start npm --name "butcapp" -- start
pm2 save
pm2 startup
```

### **3. Nginx Configuration**
```nginx
server {
    listen 80;
    server_name butcapp.com www.butcapp.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **4. SSL Sertifikası**
```bash
# Let's Encrypt ile SSL
sudo certbot --nginx -d butcapp.com -d www.butcapp.com
```

## 🧪 **TEST ETME**

### **VPS Test:**
- **URL:** https://butcapp.com/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login
- **Kullanıcı:** ampulpatlatan
- **Şifre:** [şifreniz]

### **Z.ai Preview Test:**
- **URL:** https://preview-xxx.space.z.ai/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login
- **API:** https://butcapp.com/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/system-status
- **CORS:** Otomatik çalışacak

### **Browser Test:**
```javascript
// Browser console'da test
fetch('https://butcapp.com/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/system-status', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
  }
})
.then(r => r.json())
.then(console.log)
```

## 📋 **DEPLOYMENT CHECKLIST**

- [ ] VPS sunucusu hazır
- [ ] Domain (butcapp.com) DNS ayarları yapıldı
- [ ] Proje VPS'e kopyalandı
- [ ] Environment variables ayarlandı
- [ ] npm install çalıştırıldı
- [ ] Veritabanı kuruldu (npm run db:push)
- [ ] Proje build edildi (npm run build)
- [ ] PM2 ile başlatıldı
- [ ] Nginx yapılandırıldı
- [ ] SSL sertifikası kuruldu
- [ ] CORS test edildi
- [ ] Admin paneli test edildi
- [ ] Server-status sayfası test edildi

## 🔒 **GÜVENLİK NOTLARI**

1. **JWT Secret:** Production'da benzersiz bir secret kullanın
2. **HTTPS:** SSL zorunlu (CORS sadece HTTPS ile çalışır)
3. **Firewall:** Sadece 80 ve 443 portları açık
4. **Backup:** Veritabanı düzenli yedeklenmeli

## 🎉 **SONUÇ**

ButcApp.com domain'i için:
- ✅ CORS yapılandırması tamamlandı
- ✅ API endpoint'leri hazır
- ✅ Environment variables ayarlandı
- ✅ Deployment script'leri hazır
- ✅ Test talimatları hazır

**Artık VPS'inize deploy edebilirsiniz!**
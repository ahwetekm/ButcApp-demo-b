# VPS Deployment Talimatları

## 🚀 VPS Sunucusuna Kurulum

### 1. VPS Sunucusunda Hazırlık
```bash
# Node.js kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kurulumu (process manager)
sudo npm install -g pm2

# Proje dizini oluştur
sudo mkdir -p /var/www/butcapp
sudo chown -R $USER:$USER /var/www/butcapp
cd /var/www/butcapp
```

### 2. Projeyi VPS'e Kopyalama
```bash
# Local'den VPS'e dosyaları kopyala
scp -r /home/z/my-project/* user@your-vps-ip:/var/www/butcapp/

# VPS'e bağlan
ssh user@your-vps-ip
cd /var/www/butcapp
```

### 3. Environment Variables Ayarlama
```bash
# .env dosyasını oluştur
nano .env
```

**İçerik:**
```env
DATABASE_URL=file:/var/www/butcapp/db/custom.db
JWT_SECRET=butcapp-secret-key-change-in-production-2024
NEXT_PUBLIC_API_URL=https://your-vps-domain.com
```

### 4. Kurulum ve Başlatma
```bash
# Dependencies kur
npm install

# Veritabanını kur
npm run db:push

# Build et
npm run build

# PM2 ile başlat
pm2 start npm --name "butcapp" -- start
pm2 save
pm2 startup
```

### 5. Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/butcapp
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name your-vps-domain.com;

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

```bash
# Site'ı aktif et
sudo ln -s /etc/nginx/sites-available/butcapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔧 Frontend (Z.ai Preview) Configuration

### 1. Environment Variables
```env
NEXT_PUBLIC_API_URL=https://your-vps-domain.com
```

### 2. Test Et
```bash
# Z.ai preview'da test et
# Admin panel: https://preview-xxx.space.z.ai/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login
# Kullanıcı: ampulpatlatan
# Şifre: [şifreniz]
```

## 🛠️ CORS İzinleri

VPS sunucusundaki API'ler Z.ai preview'dan gelen istekleri kabul etmek için:
- ✅ CORS middleware eklendi
- ✅ Next.js headers yapılandırıldı
- ✅ OPTIONS metodu destekleniyor

## 📋 Kontrol Listesi

- [ ] VPS sunucusu hazır
- [ ] Node.js ve PM2 kurulu
- [ ] Proje VPS'e kopyalandı
- [ ] Environment variables ayarlandı
- [ ] Veritabanı kuruldu
- [ ] Nginx yapılandırıldı
- [ ] SSL sertifikası (Let's Encrypt)
- [ ] Frontend API URL güncellendi
- [ ] Test edildi

## 🔒 Güvenlik

1. **JWT Secret:** Production'da benzersiz bir secret kullanın
2. **HTTPS:** SSL sertifikası kurun
3. **Firewall:** Gerekli portları açın (80, 443)
4. **Backup:** Veritabanı yedeklemesi yapın
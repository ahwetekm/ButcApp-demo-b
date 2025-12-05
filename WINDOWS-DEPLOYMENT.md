# ButcApp.com Windows Deployment Talimatları

## 🚀 Windows'tan VPS'e Deployment

### YÖNTEM 1: Git ile Kopyalama (Önerilen)

**Adım 1: Git Bash'i açın**
- Git Bash terminalini açın (Windows CMD değil)
- Proje dizinine gidin

**Adım 2: Deployment script'ini çalıştırın**
```bash
# Proje dizinine gidin
cd /c/path/to/your/project

# Script'i çalıştır
bash deploy-from-local.sh
```

### YÖNTEM 2: Manuel SCP ile Kopyalama

**Adım 1: Windows path'ini kullanın**
```bash
# Windows'ta doğru path formatı
scp -r C:\Users\YourUser\Documents\my-project\* root@5.133.102.196:/var/www/butcapp/
```

**Adım 2: Alternatif - WinSCP kullanın**
1. WinSCP indirin: https://winscp.net/
2. VPS'e bağlanın:
   - Host: 5.133.102.196
   - User: root
   - Password: [şifreniz]
   - Port: 22
3. Dosyaları kopyalayın

### YÖNTEM 3: GitHub ile Kopyalama (En Kolay)

**Adım 1: VPS'e bağlanın**
```bash
ssh root@5.133.102.196
```

**Adım 2: VPS'te projeyi klonlayın**
```bash
cd /var/www/butcapp
git clone https://github.com/ButcApp/ButcApp-demo-a.git .
```

**Adım 3: Environment variables oluşturun**
```bash
cat > .env << 'EOF'
DATABASE_URL=file:/var/www/butcapp/db/custom.db
JWT_SECRET=butcapp-secret-key-change-in-production-2024
NEXT_PUBLIC_API_URL=https://butcapp.com
NODE_ENV=production
EOF
```

**Adım 4: Kurulum yapın**
```bash
npm install
npm run db:push
npm run build
pm2 start npm --name "butcapp" -- start
pm2 save
```

## 🔧 VPS Kurulum Kontrolü

### Node.js Kurulumu
```bash
# Node.js kurulu mu?
node --version
npm --version

# Eğer kurulu değilse:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### PM2 Kurulumu
```bash
# PM2 kurulu mu?
pm2 --version

# Eğer kurulu değilse:
sudo npm install -g pm2
```

### Nginx Kurulumu
```bash
# Nginx yapılandırması
sudo nano /etc/nginx/sites-available/butcapp
```

**Nginx Config:**
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

```bash
# Site'ı aktif et
sudo ln -s /etc/nginx/sites-available/butcapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🧪 Test Etme

### 1. Uygulama Test
```bash
# VPS'te kontrol et
curl -I http://localhost:3000

# PM2 durumu
pm2 status

# Logları görüntüle
pm2 logs butcapp
```

### 2. Browser Test
- **URL:** https://butcapp.com
- **Admin Panel:** https://butcapp.com/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login
- **Kullanıcı:** ampulpatlatan
- **Şifre:** [şifreniz]

### 3. CORS Test
- Z.ai preview'da admin paneline giriş yapın
- Server-status sayfasına gidin
- API isteklerinin çalıştığını kontrol edin

## 🛠️ Troubleshooting

### Port 3000 kullanılıyorsa
```bash
# Port'u kontrol et
sudo lsof -i :3000

# Process'i öldür
sudo kill -9 [PID]

# Farklı portta başlat
PORT=3001 npm start
```

### Permission hataları
```bash
# Dosya izinlerini düzelt
sudo chown -R $USER:$USER /var/www/butcapp
chmod -R 755 /var/www/butcapp
```

### Database hataları
```bash
# Veritabanı dosyasını kontrol et
ls -la /var/www/butcapp/db/

# Veritabanını yeniden oluştur
npm run db:push
```

## 📋 Hızlı Deployment Checklist

- [ ] VPS'e bağlanabiliyorsunuz
- [ ] Node.js ve PM2 kurulu
- [ ] Proje dosyaları kopyalandı
- [ ] .env dosyası oluşturuldu
- [ ] npm install çalıştı
- [ ] npm run db:push çalıştı
- [ ] npm run build çalıştı
- [ ] PM2 ile başlatıldı
- [ ] Nginx yapılandırıldı
- [ ] Browser'da test edildi
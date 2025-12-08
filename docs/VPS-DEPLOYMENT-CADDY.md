# ButcApp VPS Deployment Documentation
# Ubuntu VPS'te Caddy ile 7/24 Deployment

## 📋 İçerik

1. [Genel Bakış](#genel-bakış)
2. [Sistem Gereksinimleri](#sistem-gereksinimleri)
3. [Deployment Adımları](#deployment-adımları)
4. [Script'ler ve Kullanımı](#scriptler-ve-kullanımı)
5. [Yapılandırma Dosyaları](#yapılandırma-dosyaları)
6. [Servis Yönetimi](#servis-yönetimi)
7. [Monitoring ve Log'lar](#monitoring-ve-loglar)
8. [Backup ve Kurtarma](#backup-ve-kurtarma)
9. [Sorun Giderme](#sorun-giderme)
10. [Güvenlik Önerileri](#güvenlik-önerileri)

---

## 🎯 Genel Bakış

Bu doküman, ButcApp projesinin Ubuntu VPS sunucusunda Caddy web server kullanarak 7/24 çalışacak şekilde nasıl deploy edileceğini açıklar.

### 🏗️ Mimari

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Domain:       │    │   Caddy      │    │   Next.js App   │
│ butcapp.com     │───▶│ (Port 80/443)│───▶│ (Port 3001)     │
│ www.butcapp.com │    │              │    │                 │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                                       │
                                              ┌─────────────────┐
                                              │   SQLite DB     │
                                              │ /var/lib/butcapp│
                                              └─────────────────┘
```

### 🛠️ Teknoloji Stack

- **Web Server**: Caddy 2
- **Application**: Next.js 15
- **Database**: SQLite
- **Process Manager**: PM2
- **Package Manager**: pnpm
- **SSL**: Let's Encrypt (Otomatik)
- **OS**: Ubuntu 20.04+ LTS

---

## 💻 Sistem Gereksinimleri

### Minimum Gereksinimler
- **CPU**: 1 vCPU
- **RAM**: 2 GB
- **Depolama**: 20 GB SSD
- **Ağ**: 80, 443 portları açık
- **OS**: Ubuntu 20.04 LTS veya üzeri

### Önerilen Gereksinimler
- **CPU**: 2+ vCPU
- **RAM**: 4+ GB
- **Depolama**: 50+ GB SSD
- **Ağ**: Tüm portlar açık, firewall yapılandırılmış

### Domain Gereksinimleri
- **Domain**: butcapp.com
- **DNS A Record**: VPS IP adresine yönlendirilmiş
- **DNS CNAME**: www → butcapp.com

---

## 🚀 Deployment Adımları

### 1. Hazırlık

```bash
# Sunucuya SSH ile bağlanın
ssh root@your-vps-ip

# Sistemi güncelleyin
apt update && apt upgrade -y

# Proje dizinini oluşturun
mkdir -p /var/www/butcapp
cd /var/www/butcapp

# Projeyi GitHub'dan çekin
git clone https://github.com/ButcApp/ButcApp-demo-b.git .
```

### 2. Nginx Kaldırma (Mevcut ise)

```bash
# Nginx kaldırma script'ini çalıştırın
chmod +x scripts/remove-nginx.sh
./scripts/remove-nginx.sh
```

### 3. Ana Deployment Script'i

```bash
# Ana deployment script'ini çalıştırın
chmod +x deploy-caddy.sh
./deploy-caddy.sh
```

### 4. Veritabanı Kurulumu

```bash
# Veritabanı kurulum script'ini çalıştırın
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

### 5. Environment Yapılandırması

```bash
# Environment setup script'ini çalıştırın
chmod +x scripts/setup-environment.sh
./scripts/setup-environment.sh
```

### 6. SSL/HTTPS Kurulumu

```bash
# SSL setup script'ini çalıştırın
chmod +x scripts/setup-ssl-caddy.sh
./scripts/setup-ssl-caddy.sh
```

---

## 📜 Script'ler ve Kullanımı

### 📄 deploy-caddy.sh
**Amaç**: Tüm deployment sürecini otomatikleştirir

```bash
./deploy-caddy.sh
```

**Yaptıkları**:
- Sistem güncellemeleri
- Node.js, pnpm, PM2 kurulumu
- Caddy kurulumu
- Proje kurulumu ve build
- PM2 yapılandırması
- Firewall ayarları

### 📄 remove-nginx.sh
**Amaç**: Nginx'i tamamen kaldırır

```bash
./scripts/remove-nginx.sh
```

**Yaptıkları**:
- Nginx servislerini durdurur
- Nginx paketlerini kaldırır
- Konfigürasyon dosyalarını siler
- Firewall kurallarını temizler

### 📄 setup-database.sh
**Amaç**: SQLite veritabanını kurar ve migrate eder

```bash
./scripts/setup-database.sh
```

**Yaptıkları**:
- SQLite kurulumu
- Veritabanı dizini oluşturma
- Drizzle migrasyonu
- Backup script'i kurulumu

### 📄 setup-environment.sh
**Amaç**: Production environment variables oluşturur

```bash
./scripts/setup-environment.sh
```

**Yaptıkları**:
- Güçlü şifreler oluşturma
- .env.production dosyası oluşturma
- İsteğe bağlı servisleri yapılandırma

### 📄 setup-ssl-caddy.sh
**Amaç**: SSL sertifikası kurar ve yapılandırır

```bash
./scripts/setup-ssl-caddy.sh
```

**Yaptıkları**:
- Caddy konfigürasyonu
- SSL sertifikası kurulumu
- Security headers
- Rate limiting

---

## ⚙️ Yapılandırma Dosyaları

### 📁 Caddy Konfigürasyonu
**Dosya**: `/etc/caddy/Caddyfile`

```caddy
# Main domain configuration
butcapp.com {
    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Frame-Options DENY
        X-Content-Type-Options nosniff
        # ... diğer headers
    }
    
    # Proxy to Next.js
    reverse_proxy localhost:3001
}

# WWW redirect
www.butcapp.com {
    redir https://butcapp.com{uri} 301
}
```

### 📁 PM2 Konfigürasyonu
**Dosya**: `/var/www/butcapp/ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: "butcapp",
      script: "pnpm",
      args: "start",
      cwd: "/var/www/butcapp",
      instances: 1,
      exec_mode: "fork",
      env: {
        "NODE_ENV": "production",
        "PORT": 3001
      },
      autorestart: true,
      max_memory_restart: "1G"
    }
  ]
};
```

### 📁 Environment Variables
**Dosya**: `/var/www/butcapp/.env.production`

```bash
NODE_ENV=production
PORT=3001
DOMAIN=butcapp.com
DATABASE_URL=sqlite:///var/lib/butcapp/butcapp.db
JWT_SECRET=your-jwt-secret
# ... diğer değişkenler
```

---

## 🔧 Servis Yönetimi

### PM2 Komutları

```bash
# Uygulama durumunu kontrol et
pm2 status

# Uygulamayı yeniden başlat
pm2 restart butcapp

# Uygulamayı durdur
pm2 stop butcapp

# Logları görüntüle
pm2 logs butcapp

# PM2 yapılandırmasını yeniden yükle
pm2 reload ecosystem.config.js

# PM2 startup'ı kur
pm2 startup | sudo bash
```

### Caddy Komutları

```bash
# Caddy durumunu kontrol et
sudo systemctl status caddy

# Caddy'yi yeniden başlat
sudo systemctl restart caddy

# Caddy'yi yeniden yükle
sudo systemctl reload caddy

# Konfigürasyonu test et
sudo caddy validate --config /etc/caddy/Caddyfile

# SSL sertifikalarını listele
sudo caddy list-certificates
```

### Firewall Komutları

```bash
# Firewall durumunu kontrol et
sudo ufw status

# Portları aç
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Firewall'ı etkinleştir
sudo ufw enable
```

---

## 📊 Monitoring ve Log'lar

### Log Dosyaları

```
/var/log/caddy/
├── caddy.log                    # Caddy ana log
└── butcapp-access.log          # Access log

/var/log/pm2/
├── butcapp-error.log           # PM2 error log
├── butcapp-out.log             # PM2 output log
└── butcapp-combined.log        # PM2 combined log

/var/log/butcapp/
└── app.log                     # Uygulama log
```

### Log İzleme Komutları

```bash
# Caddy loglarını izle
sudo tail -f /var/log/caddy/caddy.log

# PM2 loglarını izle
pm2 logs butcapp

# Uygulama loglarını izle
tail -f /var/log/butcapp/app.log

# Tüm logları izle
tail -f /var/log/caddy/butcapp-access.log | jq '.'
```

### Monitoring Script'i

```bash
#!/bin/bash
# monitoring.sh

echo "=== ButcApp Monitoring ==="
echo ""

# PM2 Status
echo "📊 PM2 Status:"
pm2 status
echo ""

# Caddy Status
echo "🌐 Caddy Status:"
sudo systemctl status caddy --no-pager -l
echo ""

# Port Status
echo "🔌 Port Status:"
sudo netstat -tlnp | grep -E ':(80|443|3001)'
echo ""

# Disk Usage
echo "💾 Disk Usage:"
df -h /var/www/butcapp
echo ""

# Memory Usage
echo "🧠 Memory Usage:"
free -h
echo ""

# SSL Certificate
echo "🔒 SSL Certificate:"
sudo caddy list-certificates
echo ""
```

---

## 💾 Backup ve Kurtarma

### Otomatik Backup

```bash
# Database backup (her gün 02:00)
0 2 * * * /var/www/butcapp/backup-db.sh

# Proje backup (her hafta Pazar 03:00)
0 3 * * 0 tar -czf /var/backups/butcapp/project_$(date +\%Y\%m\%d).tar.gz -C /var/www/butcapp .
```

### Manuel Backup

```bash
# Veritabanı yedeği
./backup-db.sh

# Proje yedeği
tar -czf butcapp-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .

# Konfigürasyon yedeği
tar -czf config-backup-$(date +%Y%m%d).tar.gz \
  /etc/caddy/Caddyfile \
  /var/www/butcapp/.env.production \
  /var/www/butcapp/ecosystem.config.js
```

### Kurtarma

```bash
# Veritabanı kurtarma
cp /var/backups/butcapp/butcapp_backup_YYYYMMDD_HHMMSS.db /var/lib/butcapp/butcapp.db

# Proje kurtarma
tar -xzf butcapp-backup-YYYYMMDD.tar.gz -C /var/www/butcapp

# Servisleri yeniden başlat
pm2 restart butcapp
sudo systemctl reload caddy
```

---

## 🔧 Sorun Giderme

### Yaygın Sorunlar

#### 1. Site Erişilemiyor
```bash
# Portları kontrol et
sudo netstat -tlnp | grep -E ':(80|443|3001)'

# Caddy durumunu kontrol et
sudo systemctl status caddy

# PM2 durumunu kontrol et
pm2 status

# DNS kontrolü
nslookup butcapp.com
```

#### 2. SSL Sertifikası Çalışmıyor
```bash
# Konfigürasyonu test et
sudo caddy validate --config /etc/caddy/Caddyfile

# Sertifikaları kontrol et
sudo caddy list-certificates

# Caddy'yi yeniden başlat
sudo systemctl restart caddy

# Domain DNS kontrolü
dig butcapp.com A
```

#### 3. Uygulama Çöktü
```bash
# PM2 loglarını kontrol et
pm2 logs butcapp --lines 50

# Uygulamayı yeniden başlat
pm2 restart butcapp

# Memory kullanımını kontrol et
pm2 monit

# Disk alanını kontrol et
df -h
```

#### 4. Veritabanı Hatası
```bash
# Veritabanı dosyasını kontrol et
ls -la /var/lib/butcapp/butcapp.db

# Veritabanı bağlantısını test et
sqlite3 /var/lib/butcapp/butcapp.db "SELECT 1;"

# İzinleri kontrol et
ls -la /var/lib/butcapp/

# Migration'ı tekrar çalıştır
pnpm run db:push
```

### Hata Kodları

| Kod | Açıklama | Çözüm |
|-----|----------|-------|
| 502 | Bad Gateway | PM2 durumunu kontrol et, uygulamayı yeniden başlat |
| 503 | Service Unavailable | Caddy'yi yeniden başlat, portları kontrol et |
| 504 | Gateway Timeout | Timeout ayarlarını kontrol et, sunucu kaynaklarını artır |
| 521 | Web Server Down | Caddy servisini başlat, firewall'ı kontrol et |

---

## 🔒 Güvenlik Önerileri

### 1. Sunucu Güvenliği

```bash
# SSH anahtar tabanlı kimlik doğrulama
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

# Fail2ban kurulumu
apt install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban

# Otomatik güncellemeler
apt install unattended-upgrades -y
dpkg-reconfigure -plow unattended-upgrades
```

### 2. Uygulama Güvenliği

```bash
# Environment variables şifreleme
chmod 600 /var/www/butcapp/.env.production

# Log dosyalarının izinleri
chmod 644 /var/log/butcapp/*.log

# Veritabanı izinleri
chmod 644 /var/lib/butcapp/butcapp.db
chown www-data:www-data /var/lib/butcapp/butcapp.db
```

### 3. Network Güvenliği

```bash
# Sadece gerekli portları açık
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Rate limiting (Caddy'de yapılandırılmış)
# API: 20 req/s
# Genel: 40 req/s
```

### 4. Monitoring

```bash
# Anomali tespit için log monitoring
tail -f /var/log/caddy/butcapp-access.log | grep -E "(4[0-9]{2}|5[0-9]{2})"

# Sistem kaynaklarını izle
watch -n 5 'free -h && df -h && ps aux --sort=-%cpu | head -10'
```

---

## 📞 Destek

### Yardım Alabileceğiniz Kaynaklar

1. **Caddy Dokümantasyon**: https://caddyserver.com/docs/
2. **PM2 Dokümantasyon**: https://pm2.keymetrics.io/docs/
3. **Next.js Dokümantasyon**: https://nextjs.org/docs/
4. **SQLite Dokümantasyon**: https://sqlite.org/docs.html

### Acil Durum Prosedürü

1. **Site Çöktüğünde**:
   - PM2 durumunu kontrol et
   - Caddy durumunu kontrol et
   - Logları incele
   - Gerekirse son backup'tan geri dön

2. **SSL Sorunlarında**:
   - DNS kayıtlarını kontrol et
   - Caddy konfigürasyonunu test et
   - Sertifikayı yenile

3. **Performans Sorunlarında**:
   - Sunucu kaynaklarını kontrol et
   - Logları analiz et
   - Cache'i temizle

---

## 📝 Son Notlar

- Bu deployment yöntemi **production** için tasarlanmıştır
- **Test ortamı** için farklı portlar ve domain kullanın
- **Düzenli backup** yapmayı unutmayın
- **Monitoring** ve **loglama** kritik öneme sahiptir
- **Güvenlik** güncellemelerini düzenli yapın

---

**🎉 ButcApp'iniz artık production'da hazır!**

**🌐 https://butcapp.com**
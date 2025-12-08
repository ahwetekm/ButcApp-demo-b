#!/bin/bash

# ButcApp Production Deployment Script with Caddy
# Ubuntu VPS için deployment script'i - Caddy Web Server

echo "🚀 ButcApp Production Deployment Başlatılıyor (Caddy ile)..."

# 1. DEĞİŞKENLER
PROJECT_DIR="/var/www/butcapp"
DOMAIN="butcapp.com"
DB_USER="butcapp_user"
DB_NAME="butcapp_db"
DB_PASSWORD=$(openssl rand -base64 32)  # Güçlü rastgele şifre oluştur
JWT_SECRET=$(openssl rand -base64 64)   # JWT secret oluştur

# Renkli çıktı için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# 2. SİSTEM GÜNCELLEMELERİ
log "Sistem güncelleniyor..."
sudo apt update && sudo apt upgrade -y

# 3. GEREKLİ PAKETLER
log "Gerekli paketler kuruluyor..."
sudo apt install -y curl wget git unzip software-properties-common \
    build-essential python3 python3-pip sqlite3 certbot

# 4. NODE.JS KURULUMU (18.x LTS)
if ! command -v node &> /dev/null; then
    log "Node.js 18.x LTS kuruluyor..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    info "Node.js zaten kurulu: $(node --version)"
fi

# 5. PNPM KURULUMU
if ! command -v pnpm &> /dev/null; then
    log "pnpm kuruluyor..."
    npm install -g pnpm
else
    info "pnpm zaten kurulu: $(pnpm --version)"
fi

# 6. PM2 KURULUMU
if ! command -v pm2 &> /dev/null; then
    log "PM2 kuruluyor..."
    npm install -g pm2
else
    info "PM2 zaten kurulu: $(pm2 --version)"
fi

# 7. NGINX KALDIRIMI (KULLANICI İSTEĞİ ÜZERİNE)
if command -v nginx &> /dev/null; then
    warn "Nginx kaldırılıyor (Caddy kullanılacak)..."
    sudo systemctl stop nginx
    sudo systemctl disable nginx
    sudo apt remove --purge -y nginx nginx-common nginx-full
    sudo apt autoremove -y
    sudo rm -rf /etc/nginx /var/log/nginx /var/www/html
    log "Nginx başarıyla kaldırıldı"
else
    info "Nginx zaten kurulu değil"
fi

# 8. CADDY KURULUMU
if ! command -v caddy &> /dev/null; then
    log "Caddy kuruluyor..."
    
    # GPG key ekle
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    
    # Repository ekle
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    
    # Caddy kur
    sudo apt update
    sudo apt install -y caddy
    
    # Caddy servisini başlat
    sudo systemctl start caddy
    sudo systemctl enable caddy
    
    log "Caddy başarıyla kuruldu"
else
    info "Caddy zaten kurulu: $(caddy version | head -n1)"
fi

# 9. PROJE KURULUMU
log "Proje dizini kontrol ediliyor..."
if [ ! -d "$PROJECT_DIR" ]; then
    log "Proje dizini oluşturuluyor: $PROJECT_DIR"
    sudo mkdir -p $PROJECT_DIR
    sudo chown -R $USER:$USER $PROJECT_DIR
fi

cd $PROJECT_DIR

# Eğer proje boşsa, GitHub'dan çek
if [ ! -f "package.json" ]; then
    log "Proje GitHub'dan çekiliyor..."
    git clone https://github.com/ButcApp/ButcApp-demo-b.git .
    
    # .git dosyalarını temizle
    rm -rf .git
fi

# 10. LOG KLASÖRLERİNİ OLUŞTUR
log "Log klasörleri oluşturuluyor..."
sudo mkdir -p /var/log/caddy /var/log/pm2 /var/log/butcapp
sudo chown -R $USER:$USER /var/log/butcapp
sudo chown -R caddy:caddy /var/log/caddy

# 11. CADDY YAPILANDIRMASI
log "Caddy yapılandırması yapılıyor..."
sudo cp caddy/Caddyfile /etc/caddy/Caddyfile.butcapp

# Domain'i güncelle
sudo sed -i "s/admin@butcapp.com/admin@$DOMAIN/g" /etc/caddy/Caddyfile.butcapp

# Caddy ana yapılandırmasına ekle
sudo tee /etc/caddy/Caddyfile > /dev/null <<EOF
# ButcApp Production Configuration
import /etc/caddy/Caddyfile.butcapp
EOF

# Caddy yapılandırmasını test et
sudo caddy validate --config /etc/caddy/Caddyfile

if [ $? -eq 0 ]; then
    log "Caddy yapılandırması geçerli"
    sudo systemctl reload caddy
else
    error "Caddy yapılandırması hatalı!"
    exit 1
fi

# 12. DEPENDENCIES KURULUMU
log "Node.js dependencies kuruluyor..."
pnpm install --production=false  # Dev dependencies ile birlikte kur

# 13. VERİTABANI KURULUMU (SQLite)
log "SQLite veritabanı kuruluyor..."

# DB klasörü oluştur
sudo mkdir -p /var/lib/butcapp
sudo chown -R $USER:$USER /var/lib/butcapp

# Environment variables oluştur
cat > .env.production << EOF
# Production Environment Variables
NODE_ENV=production
PORT=3001
DOMAIN=$DOMAIN

# Database (SQLite)
DATABASE_URL=sqlite:///var/lib/butcapp/butcapp.db

# JWT Secret
JWT_SECRET=$JWT_SECRET

# API Keys (bunları production'da güncelleyin)
NEXT_PUBLIC_API_URL=https://$DOMAIN
API_URL=https://$DOMAIN

# Session Secret
SESSION_SECRET=$JWT_SECRET

# Email (isteğe bağlı)
EMAIL_FROM=noreply@$DOMAIN
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Analytics (isteğe bağlı)
GOOGLE_ANALYTICS_ID=
VERCEL_ANALYTICS_ID=

# Redis (isteğe bağlı)
REDIS_URL=redis://localhost:6379

# Log level
LOG_LEVEL=info
EOF

# .env.production dosyasının izinlerini ayarla
chmod 600 .env.production

# 14. VERİTABANI MİGRASYONU
log "Veritabanı migrasyonu yapılıyor..."
pnpm run db:push

# 15. PROJE DERLEME
log "Proje derleniyor..."
pnpm run build

# 16. PM2 YAPILANDIRMASI
log "PM2 yapılandırması güncelleniyor..."

# PM2 config dosyasını güncelle
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: "butcapp",
      script: "pnpm",
      args: "start",
      cwd: "$PROJECT_DIR",
      instances: 1,
      exec_mode: "fork",
      env: {
        "NODE_ENV": "production",
        "PORT": 3001
      },
      env_production: {
        "NODE_ENV": "production",
        "PORT": 3001
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/var/log/pm2/butcapp-error.log",
      out_file: "/var/log/pm2/butcapp-out.log",
      log_file: "/var/log/pm2/butcapp-combined.log",
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      max_memory_restart: "1G",
      watch: false,
      ignore_watch: [
        "node_modules",
        "logs",
        ".git",
        ".next"
      ],
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
};
EOF

# 17. PM2 BAŞLATMA
log "PM2 ile uygulama başlatılıyor..."
pm2 stop butcapp 2>/dev/null || true
pm2 delete butcapp 2>/dev/null || true

pm2 start ecosystem.config.js --env production
pm2 save

# 18. PM2 STARTUP KURULUMU
log "PM2 startup ayarlanıyor..."
pm2 startup | sudo bash

# 19. FIREWALL AYARLARI
log "Firewall ayarları yapılıyor..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 20. CADDY SİSTEM SERVİSİ
log "Caddy servis durumu kontrol ediliyor..."
sudo systemctl enable caddy
sudo systemctl start caddy

# 21. KONTROLLER
log "Kontroller yapılıyor..."

echo ""
log "=== PM2 Status ==="
pm2 status

echo ""
log "=== Caddy Status ==="
sudo systemctl status caddy --no-pager -l

echo ""
log "=== Port Kontrolü ==="
sudo netstat -tlnp | grep -E ':(80|443|3001)'

echo ""
log "=== Uygulama Testi ==="
curl -I http://localhost:3001 || warn "Local test başarısız"

# 22. BİLGİLENDİRME
echo ""
log "✅ Deployment tamamlandı!"
echo ""
echo -e "${GREEN}📋 ÖNEMLİ BİLGİLER:${NC}"
echo -e "Domain: ${BLUE}$DOMAIN${NC}"
echo -e "Proje Dizini: ${BLUE}$PROJECT_DIR${NC}"
echo -e "Veritabanı: ${BLUE}SQLite (/var/lib/butcapp/butcapp.db)${NC}"
echo -e "JWT Secret: ${BLUE}$JWT_SECRET${NC}"
echo -e "DB Password: ${BLUE}$DB_PASSWORD${NC}"
echo ""
echo -e "${GREEN}📋 SON ADIMLAR:${NC}"
echo "1. Domain DNS ayarlarınızı doğrulayın:"
echo "   - A record: $DOMAIN -> VPS IP adresiniz"
echo "   - CNAME record: www -> $DOMAIN"
echo ""
echo "2. SSL sertifikaları otomatik olarak Caddy tarafından yönetilir"
echo ""
echo "3. Environment variables'ı production'da güncelleyin:"
echo "   - API keys"
echo "   - Email settings"
echo "   - Analytics IDs"
echo ""
echo "4. Log dosyaları:"
echo "   - Caddy: /var/log/caddy/"
echo "   - PM2: /var/log/pm2/"
echo "   - Uygulama: /var/log/butcapp/"
echo ""
echo "5. Yararlı komutlar:"
echo "   - PM2 durum: pm2 status"
echo "   - PM2 log: pm2 logs butcapp"
echo "   - Caddy durum: sudo systemctl status caddy"
echo "   - Caddy reload: sudo systemctl reload caddy"
echo ""
echo -e "${GREEN}🎉 Uygulamanız hazır: https://$DOMAIN${NC}"

# 23. BACKUP SCRIPT'I
log "Backup script'i oluşturuluyor..."

cat > backup.sh << 'EOF'
#!/bin/bash

# ButcApp Backup Script
BACKUP_DIR="/var/backups/butcapp"
PROJECT_DIR="/var/www/butcapp"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup dizini oluştur
mkdir -p $BACKUP_DIR

# Veritabanı yedeği
echo "Veritabanı yedekleniyor..."
cp /var/lib/butcapp/butcapp.db $BACKUP_DIR/butcapp_$DATE.db

# Proje dosyaları yedeği
echo "Proje dosyaları yedekleniyor..."
tar -czf $BACKUP_DIR/project_$DATE.tar.gz -C $PROJECT_DIR .

# Eski yedekleri temizle (7 gün)
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup tamamlandı: $BACKUP_DIR"
EOF

chmod +x backup.sh

# Cron job ekle (her gün saat 02:00)
(crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/backup.sh") | crontab -

log "Backup script'i ve cron job eklendi"
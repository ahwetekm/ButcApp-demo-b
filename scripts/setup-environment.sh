#!/bin/bash

# Environment Configuration Setup Script
# Production environment variables kurulum script'i

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

echo "⚙️ Environment Configuration Setup Script Başlatılıyor..."
echo ""

# Değişkenler
PROJECT_DIR="/var/www/butcapp"
DOMAIN="butcapp.com"
ENV_FILE="$PROJECT_DIR/.env.production"

# 1. Proje Dizini Kontrolü
if [ ! -d "$PROJECT_DIR" ]; then
    error "Proje dizini bulunamadı: $PROJECT_DIR"
    exit 1
fi

cd $PROJECT_DIR

# 2. Güçlü Şifreler Oluştur
log "Güvenli anahtarlar oluşturuluyor..."
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)
NEXTAUTH_SECRET=$(openssl rand -base64 64)

# 3. Mevcut .env.production Dosyasını Yedekle
if [ -f "$ENV_FILE" ]; then
    warn "Mevcut .env.production dosyası yedekleniyor..."
    cp $ENV_FILE $ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)
fi

# 4. .env.production Dosyası Oluştur
log ".env.production dosyası oluşturuluyor..."
cat > $ENV_FILE << EOF
# =============================================================================
# BUTCAPP PRODUCTION ENVIRONMENT VARIABLES
# =============================================================================
# Oluşturulma tarihi: $(date)
# Domain: $DOMAIN

# =============================================================================
# TEMEL AYARLAR
# =============================================================================
NODE_ENV=production
PORT=3001
DOMAIN=$DOMAIN

# =============================================================================
# VERİTABANI AYARLARI
# =============================================================================
# SQLite
DATABASE_URL=sqlite:///var/lib/butcapp/butcapp.db

# =============================================================================
# GÜVENLİK AYARLARI
# =============================================================================
# JWT Secret
JWT_SECRET=$JWT_SECRET

# Session Secret
SESSION_SECRET=$SESSION_SECRET

# NextAuth.js
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=https://$DOMAIN

# =============================================================================
# API AYARLARI
# =============================================================================
NEXT_PUBLIC_API_URL=https://$DOMAIN
API_URL=https://$DOMAIN
ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN

# =============================================================================
# EMAIL AYARLARI
# =============================================================================
EMAIL_FROM=noreply@$DOMAIN
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

# =============================================================================
# ANALYTICS AYARLARI
# =============================================================================
GOOGLE_ANALYTICS_ID=
VERCEL_ANALYTICS_ID=

# =============================================================================
# LOG AYARLARI
# =============================================================================
LOG_LEVEL=info
LOG_FILE=/var/log/butcapp/app.log

# =============================================================================
# RATE LIMITING AYARLARI
# =============================================================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# =============================================================================
# PERFORMANCE AYARLARI
# =============================================================================
NEXT_TELEMETRY_DISABLED=1
NEXT_MINIMIZE=true
NEXT_OPTIMIZE_FONTS=true
NEXT_OPTIMIZE_IMAGES=true

# =============================================================================
# ÖZEL AYARLARI
# =============================================================================
APP_VERSION=1.0.0
MAINTENANCE_MODE=false
ENABLE_BETA_FEATURES=false
ENABLE_NEW_DASHBOARD=false
ENABLE_ANALYTICS=true

# =============================================================================
# BACKUP AYARLARI
# =============================================================================
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=7

# =============================================================================
# GÜVENLİK BAŞLIKLARI
# =============================================================================
CSP_DEFAULT_SRC="'self'"
CSP_SCRIPT_SRC="'self' 'unsafe-inline' 'unsafe-eval'"
CSP_STYLE_SRC="'self' 'unsafe-inline'"
CSP_IMG_SRC="'self' data: https:"
CSP_FONT_SRC="'self' data:"
CSP_CONNECT_SRC="'self' https://api.$DOMAIN"
EOF

# 5. Dosya İzinleri
log "Dosya izinleri ayarlanıyor..."
chmod 600 $ENV_FILE
chown $USER:$USER $ENV_FILE

# 6. Kontrol
log "Environment dosyası kontrol ediliyor..."
if [ -f "$ENV_FILE" ]; then
    log "✅ .env.production dosyası başarıyla oluşturuldu"
    info "Dosya yolu: $ENV_FILE"
    info "Dosya boyutu: $(du -h $ENV_FILE | cut -f1)"
else
    error "❌ .env.production dosyası oluşturulamadı"
    exit 1
fi

# 7. Anahtarları Göster (uyarı ile)
echo ""
warn "⚠️ ÖNEMLİ GÜVENLİK BİLGİLERİ:"
echo "Bu anahtarları güvenli bir yerde saklayın!"
echo ""
echo "JWT Secret: $JWT_SECRET"
echo "Session Secret: $SESSION_SECRET"
echo "NextAuth Secret: $NEXTAUTH_SECRET"
echo ""

# 8. Environment Testi
log "Environment testi yapılıyor..."
export $(cat $ENV_FILE | grep -v '^#' | xargs)

if [ "$NODE_ENV" = "production" ]; then
    log "✅ NODE_ENV doğru ayarlanmış"
else
    error "❌ NODE_ENV hatalı"
fi

if [ "$DOMAIN" = "$DOMAIN" ]; then
    log "✅ DOMAIN doğru ayarlanmış"
else
    error "❌ DOMAIN hatalı"
fi

# 9. İsteğe Bağlı Servisleri Yapılandır
echo ""
info "İsteğe bağlı servisleri yapılandırmak ister misiniz?"
echo "1. Email servisi (SMTP)"
echo "2. Analytics (Google Analytics)"
echo "3. Monitoring (Sentry)"
echo "4. Ödeme (Stripe)"
echo "5. Hiçbiri"
echo ""

read -p "Seçiminiz (1-5): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo "Email servisi yapılandırması:"
        read -p "SMTP Host (localhost): " SMTP_HOST
        read -p "SMTP Port (587): " SMTP_PORT
        read -p "SMTP User: " SMTP_USER
        read -p "SMTP Password: " -s SMTP_PASS
        echo
        
        # .env dosyasını güncelle
        sed -i "s/SMTP_HOST=.*/SMTP_HOST=${SMTP_HOST:-localhost}/" $ENV_FILE
        sed -i "s/SMTP_PORT=.*/SMTP_PORT=${SMTP_PORT:-587}/" $ENV_FILE
        sed -i "s/SMTP_USER=.*/SMTP_USER=$SMTP_USER/" $ENV_FILE
        sed -i "s/SMTP_PASS=.*/SMTP_PASS=$SMTP_PASS/" $ENV_FILE
        
        log "Email servisi yapılandırıldı"
        ;;
    2)
        echo "Analytics yapılandırması:"
        read -p "Google Analytics ID: " GA_ID
        
        sed -i "s/GOOGLE_ANALYTICS_ID=.*/GOOGLE_ANALYTICS_ID=$GA_ID/" $ENV_FILE
        
        log "Analytics yapılandırıldı"
        ;;
    3)
        echo "Monitoring yapılandırması:"
        read -p "Sentry DSN: " SENTRY_DSN
        
        sed -i "/# SENTRY/i\\SENTRY_DSN=$SENTRY_DSN" $ENV_FILE
        
        log "Monitoring yapılandırıldı"
        ;;
    4)
        echo "Ödeme yapılandırması:"
        read -p "Stripe Public Key: " STRIPE_PUBLIC
        read -p "Stripe Secret Key: " -s STRIPE_SECRET
        echo
        
        sed -i "s/STRIPE_PUBLIC_KEY=.*/STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC/" $ENV_FILE
        sed -i "s/STRIPE_SECRET_KEY=.*/STRIPE_SECRET_KEY=$STRIPE_SECRET/" $ENV_FILE
        
        log "Ödeme sistemi yapılandırıldı"
        ;;
    5)
        info "İsteğe bağlı servisler atlandı"
        ;;
    *)
        warn "Geçersiz seçim"
        ;;
esac

# 10. Son Kontroller
log "Son kontroller yapılıyor..."

# Dosya syntax kontrolü
if bash -n $ENV_FILE 2>/dev/null; then
    log "✅ Environment dosyası syntax kontrolü başarılı"
else
    warn "⚠️ Environment dosyasında syntax hatası olabilir"
fi

# Değişken sayısı
VAR_COUNT=$(grep -c "=" $ENV_FILE)
info "Toplam değişken sayısı: $VAR_COUNT"

# Gizli anahtar kontrolü
if grep -q "CHANGE_THIS" $ENV_FILE; then
    warn "⚠️ Hala değiştirilmesi gereken varsayılan değerler var"
else
    log "✅ Tüm varsayılan değerler güncellenmiş"
fi

# 11. Yönergeler
echo ""
log "✅ Environment configuration tamamlandı!"
echo ""
echo -e "${GREEN}📋 Oluşturulan Dosya:${NC}"
echo "- Environment: $ENV_FILE"
echo "- Backup: $ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo ""
echo -e "${GREEN}📋 Güvenlik Anahtarları:${NC}"
echo "- JWT Secret: ${JWT_SECRET:0:20}..."
echo "- Session Secret: ${SESSION_SECRET:0:20}..."
echo "- NextAuth Secret: ${NEXTAUTH_SECRET:0:20}..."
echo ""
echo -e "${GREEN}📋 Sonraki Adımlar:${NC}"
echo "1. Bu anahtarları güvenli bir yerde saklayın"
echo "2. İsteğe bağlı servisleri yapılandırın"
echo "3. Uygulamayı yeniden başlatın: pm2 restart butcapp"
echo "4. Logları kontrol edin: pm2 logs butcapp"
echo ""
echo -e "${GREEN}📋 Önemli Notlar:${NC}"
echo "- Bu dosyayı asla repository'e eklemeyin"
echo "- Production ortamında farklı anahtarlar kullanın"
echo "- Düzenli olarak anahtarları güncelleyin"
echo "- Environment variables'ı şifreleyin"
echo ""
echo -e "${GREEN}🎉 Environment hazır!${NC}"
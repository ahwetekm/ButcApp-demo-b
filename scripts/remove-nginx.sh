#!/bin/bash

# Nginx Removal Script for Caddy Migration
# Ubuntu VPS için Nginx'i tamamen kaldırma script'i

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

echo "🔧 Nginx Removal Script Başlatılıyor..."
echo "Bu script Nginx'i tamamen kaldıracak ve Caddy için hazırlık yapacaktır."
echo ""

# Onay al
read -p "Devam etmek istediğinizden emin misiniz? (e/H): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ee]$ ]]; then
    echo "İptal edildi."
    exit 1
fi

# 1. Nginx Servisini Durdur
log "Nginx servisi durduruluyor..."
sudo systemctl stop nginx 2>/dev/null || warn "Nginx servisi zaten çalışmıyor"
sudo systemctl disable nginx 2>/dev/null || warn "Nginx servisi zaten disabled"

# 2. Nginx Paketlerini Kaldır
log "Nginx paketleri kaldırılıyor..."
sudo apt remove --purge -y nginx nginx-common nginx-full nginx-core nginx-light nginx-extras 2>/dev/null || warn "Nginx paketleri zaten kurulu değil"

# 3. Nginx Repository'leri Kaldır
log "Nginx repository'leri temizleniyor..."
sudo rm -f /etc/apt/sources.list.d/nginx.list
sudo rm -f /etc/apt/sources.list.d/nginx-stable.list
sudo rm -f /etc/apt/sources.list.d/nginx-mainline.list

# 4. Nginx Kullanıcısını ve Grubunu Kaldır
log "Nginx kullanıcısı ve grubu kaldırılıyor..."
sudo deluser www-data 2>/dev/null || warn "www-data kullanıcısı bulunamadı"
sudo delgroup www-data 2>/dev/null || warn "www-data grubu bulunamadı"

# 5. Nginx Loglarını Temizle
log "Nginx logları temizleniyor..."
sudo rm -rf /var/log/nginx/*

# 6. Nginx PID ve Socket Dosyalarını Temizle
log "Nginx PID ve socket dosyaları temizleniyor..."
sudo rm -f /run/nginx.pid
sudo rm -f /var/run/nginx.pid
sudo rm -f /var/run/nginx.sock
sudo rm -f /tmp/nginx.sock

# 7. Systemd Servis Dosyalarını Temizle
log "Systemd servis dosyaları temizleniyor..."
sudo rm -f /lib/systemd/system/nginx.service
sudo rm -f /etc/systemd/system/nginx.service
sudo rm -f /etc/systemd/system/multi-user.target.wants/nginx.service
sudo systemctl daemon-reload

# 8. Firewall Kurallarını Temizle
log "Firewall kuralları temizleniyor..."
sudo ufw delete allow 80/tcp 2>/dev/null || warn "Port 80 kuralı bulunamadı"
sudo ufw delete allow 443/tcp 2>/dev/null || warn "Port 443 kuralı bulunamadı"
sudo ufw delete allow nginx 2>/dev/null || warn "Nginx firewall kuralı bulunamadı"

# 9. SSL Sertifikalarını Koru (Caddy kullanabilir)
warn "SSL sertifikaları korunuyor (Caddy kullanabilir)"
info "Let's Encrypt sertifikaları: /etc/letsencrypt/"
info "Eğer bu sertifikaları kullanmayacaksanız, aşağıdaki komutla silebilirsiniz:"
echo "  sudo rm -rf /etc/letsencrypt/"

# 10. Kalan Dosya ve Klasörleri Temizle
log "Kalan dosya ve klasörler temizleniyor..."
sudo rm -rf /etc/nginx
sudo rm -rf /var/www/html
sudo rm -rf /usr/share/nginx
sudo rm -rf /var/lib/nginx
sudo rm -rf /var/cache/nginx

# 11. Autoremove ve Autoclean
log "Sistem temizleniyor..."
sudo apt autoremove -y
sudo apt autoclean

# 12. Kontrol
log "Kontrol ediliyor..."
if command -v nginx &> /dev/null; then
    error "Nginx hala sistemde mevcut!"
    echo "Manuel olarak kontrol edin:"
    echo "  which nginx"
    echo "  dpkg -l | grep nginx"
else
    log "✅ Nginx başarıyla kaldırıldı"
fi

# 13. Port Durumunu Kontrol Et
log "Port durumu kontrol ediliyor..."
echo "80 ve 443 portları:"
sudo netstat -tlnp | grep -E ':(80|443)' || warn "80 ve 443 portları boş (bu iyi)"

# 14. Caddy Hazırlığı
log "Caddy için hazırlık yapılıyor..."
sudo mkdir -p /var/log/caddy
sudo chown -R caddy:caddy /var/log/caddy 2>/dev/null || warn "Caddy kullanıcısı henüz oluşturulmamış"

echo ""
log "✅ Nginx kaldırma işlemi tamamlandı!"
echo ""
echo -e "${GREEN}📋 Son Durum:${NC}"
echo "- Nginx paketleri kaldırıldı"
echo "- Nginx servisleri durduruldu ve devre dışı bırakıldı"
echo "- Nginx konfigürasyon dosyaları silindi"
echo "- Loglar ve geçici dosyalar temizlendi"
echo "- Firewall kuralları güncellendi"
echo ""
echo -e "${GREEN}📋 Sonraki Adımlar:${NC}"
echo "1. Caddy kurulumu yapın:"
echo "   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg"
echo "   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list"
echo "   sudo apt update"
echo "   sudo apt install -y caddy"
echo ""
echo "2. Caddy konfigürasyonunu yapın:"
echo "   sudo cp /var/www/butcapp/caddy/Caddyfile /etc/caddy/Caddyfile"
echo "   sudo caddy validate --config /etc/caddy/Caddyfile"
echo "   sudo systemctl reload caddy"
echo ""
echo "3. Firewall ayarlarını yapın:"
echo "   sudo ufw allow 80/tcp"
echo "   sudo ufw allow 443/tcp"
echo "   sudo ufw enable"
echo ""
echo -e "${GREEN}🎉 Sistem Caddy için hazır!${NC}"
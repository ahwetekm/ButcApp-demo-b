#!/bin/bash

# SSL/HTTPS Setup Script for Caddy
# Caddy ile otomatik SSL kurulumu

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

echo "🔒 SSL/HTTPS Setup for Caddy Başlatılıyor..."
echo ""

# Değişkenler
DOMAIN="butcapp.com"
EMAIL="admin@butcapp.com"

# 1. Caddy Kurulum Kontrolü
if ! command -v caddy &> /dev/null; then
    error "Caddy kurulu değil! Önce Caddy kurulumu yapın."
    exit 1
fi

log "Caddy kurulu: $(caddy version | head -n1)"

# 2. Domain DNS Kontrolü
log "Domain DNS kontrolü yapılıyor..."
if nslookup $DOMAIN > /dev/null 2>&1; then
    log "✅ Domain DNS kayıtları mevcut: $DOMAIN"
else
    warn "⚠️ Domain DNS kayıtları bulunamadı: $DOMAIN"
    warn "Lütfen domain'inizin A record'unu VPS IP adresinize yönlendirin."
fi

# 3. Caddy Konfigürasyonu
log "Caddy konfigürasyonu hazırlanıyor..."

# Caddy ana konfigürasyon dosyası
sudo tee /etc/caddy/Caddyfile > /dev/null <<EOF
# ButcApp Production Configuration
{
    email $EMAIL
    admin localhost:2019
    log {
        output file /var/log/caddy/caddy.log {
            roll_size 100mb
            roll_keep 5
            roll_keep_for 720h
        }
        level INFO
    }
}

# Rate limiting
(rate_limit_api) {
    rate {
        zone api
        key {remote_host}
        events 20
        window 1s
    }
}

(rate_limit_general) {
    rate {
        zone general
        key {remote_host}
        events 40
        window 1s
    }
}

# Main domain configuration
$DOMAIN {
    # Security headers
    header {
        # HSTS
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        
        # Other security headers
        X-Frame-Options DENY
        X-Content-Type-Options nosniff
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        
        # Remove server signature
        -Server
    }
    
    # Handle API routes with rate limiting
    handle /api/* {
        import rate_limit_api
        
        # CORS headers for API
        @cors_preflight method OPTIONS
        handle @cors_preflight {
            header Access-Control-Allow-Origin "*"
            header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
            header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
            respond "" 204
        }
        
        # Proxy to Next.js application
        reverse_proxy localhost:3001 {
            # Headers
            header_up Host {http.reverse_proxy.upstream.hostport}
            header_up X-Real-IP {http.request.remote_host}
            header_up X-Forwarded-For {http.request.header.X-Forwarded-For}, {http.request.remote_host}
            header_up X-Forwarded-Proto {http.request.scheme}
            header_up X-Forwarded-Host {http.request.host}
            
            # Timeouts
            buffer_requests
            dial_timeout 30s
            read_timeout 300s
            write_timeout 300s
        }
    }
    
    # Handle static files with caching
    handle_path /static/* {
        file_server
        header Cache-Control "public, max-age=31536000, immutable"
        header Expires "Thu, 31 Dec 2037 23:55:55 GMT"
    }
    
    # Handle public assets
    handle_path /_next/static/* {
        file_server
        header Cache-Control "public, max-age=31536000, immutable"
        header Expires "Thu, 31 Dec 2037 23:55:55 GMT"
    }
    
    # Handle images and other assets
    handle_path /*.{jpg,jpeg,png,gif,ico,css,js,woff,woff2,ttf,svg,webp,avif} {
        file_server
        header Cache-Control "public, max-age=31536000, immutable"
        header Expires "Thu, 31 Dec 2037 23:55:55 GMT"
    }
    
    # Health check endpoint
    handle /health {
        respond "healthy\n" 200
        header Content-Type "text/plain"
    }
    
    # Block common exploit attempts
    handle_path /*.{aspx,php,jsp,cgi} {
        respond "Not Found" 404
    }
    
    # Block access to sensitive files
    handle_path /.git/* {
        respond "Not Found" 404
    }
    
    handle_path /.env {
        respond "Not Found" 404
    }
    
    handle_path /.htaccess {
        respond "Not Found" 404
    }
    
    # Main application proxy
    import rate_limit_general
    reverse_proxy localhost:3001 {
        # Headers
        header_up Host {http.reverse_proxy.upstream.hostport}
        header_up X-Real-IP {http.request.remote_host}
        header_up X-Forwarded-For {http.request.header.X-Forwarded-For}, {http.request.remote_host}
        header_up X-Forwarded-Proto {http.request.scheme}
        header_up X-Forwarded-Host {http.request.host}
        
        # Timeouts
        buffer_requests
        dial_timeout 30s
        read_timeout 300s
        write_timeout 300s
        
        # WebSocket support
        header_up Connection {http.request.header.Connection}
        header_up Upgrade {http.request.header.Upgrade}
    }
    
    # Logging
    log {
        output file /var/log/caddy/butcapp-access.log {
            roll_size 100mb
            roll_keep 5
            roll_keep_for 720h
        }
        format json
    }
    
    # Error pages
    handle_errors {
        @500 expression {http.error.status_code} == 500
        handle @500 {
            respond "Internal Server Error" 500
        }
        
        @502 expression {http.error.status_code} == 502
        handle @502 {
            respond "Service Temporarily Unavailable" 502
        }
        
        @503 expression {http.error.status_code} == 503
        handle @503 {
            respond "Service Temporarily Unavailable" 503
        }
        
        @504 expression {http.error.status_code} == 504
        handle @504 {
            respond "Gateway Timeout" 504
        }
    }
}

# www subdomain redirect
www.$DOMAIN {
    redir https://$DOMAIN{uri} 301
}
EOF

# 4. Caddy Konfigürasyon Testi
log "Caddy konfigürasyonu test ediliyor..."
sudo caddy validate --config /etc/caddy/Caddyfile

if [ $? -eq 0 ]; then
    log "✅ Caddy konfigürasyonu geçerli"
else
    error "❌ Caddy konfigürasyonu hatalı!"
    exit 1
fi

# 5. Caddy Servisini Yeniden Başlat
log "Caddy servisi yeniden başlatılıyor..."
sudo systemctl reload caddy

# 6. SSL Sertifikası Kontrolü
log "SSL sertifikası kontrol ediliyor..."
sleep 5

if curl -I https://$DOMAIN 2>/dev/null | grep -q "200 OK"; then
    log "✅ SSL sertifikası başarıyla kuruldu ve çalışıyor"
else
    warn "⚠️ SSL sertifikası kontrol edilemedi. Domain DNS ayarlarını kontrol edin."
fi

# 7. SSL Sertifikası Bilgileri
log "SSL sertifikası bilgileri:"
sudo caddy list-certificates 2>/dev/null || warn "Sertifika bilgileri alınamadı"

# 8. Otokurulum Testi
log "SSL otokurulum testi yapılıyor..."
echo "Test ediliyor: https://$DOMAIN"
if command -v curl &> /dev/null; then
    SSL_INFO=$(curl -I https://$DOMAIN 2>/dev/null | head -n1)
    if [[ $SSL_INFO == *"200"* ]]; then
        log "✅ HTTPS çalışıyor: $SSL_INFO"
    else
        warn "⚠️ HTTPS testi başarısız: $SSL_INFO"
    fi
fi

# 9. Log Dosyaları Kontrolü
log "Log dosyaları kontrol ediliyor..."
sudo mkdir -p /var/log/caddy
sudo chown -R caddy:caddy /var/log/caddy

if [ -f "/var/log/caddy/caddy.log" ]; then
    log "✅ Caddy log dosyası mevcut"
else
    warn "⚠️ Caddy log dosyası oluşturulamadı"
fi

# 10. Servis Durumu
log "Caddy servis durumu:"
sudo systemctl status caddy --no-pager -l

echo ""
log "✅ SSL/HTTPS kurulumu tamamlandı!"
echo ""
echo -e "${GREEN}📋 Özellikler:${NC}"
echo "- ✅ Otomatik SSL sertifikası (Let's Encrypt)"
echo "- ✅ HTTP'den HTTPS'e otomatik yönlendirme"
echo "- ✅ WWW'den non-WWW'e yönlendirme"
echo "- ✅ Security headers"
echo "- ✅ Rate limiting"
echo "- ✅ Static file caching"
echo "- ✅ WebSocket desteği"
echo "- ✅ HSTS preload"
echo ""
echo -e "${GREEN}📋 Yararlı Komutlar:${NC}"
echo "- SSL durumunu kontrol et: sudo caddy list-certificates"
echo "- Caddy loglarını görüntüle: sudo tail -f /var/log/caddy/caddy.log"
echo "- Caddy yeniden yükle: sudo systemctl reload caddy"
echo "- Konfigürasyon test: sudo caddy validate --config /etc/caddy/Caddyfile"
echo "- Sertifika yenile: sudo caddy reload --config /etc/caddy/Caddyfile"
echo ""
echo -e "${GREEN}📋 Önemli Notlar:${NC}"
echo "- SSL sertifikaları otomatik olarak yenilenir"
echo "- Domain DNS ayarları doğru olmalı"
echo "- 80 ve 443 portları açık olmalı"
echo "- Caddy servisi sürekli çalışmalı"
echo ""
echo -e "${GREEN}🎉 Uygulamanız hazır: https://$DOMAIN${NC}"
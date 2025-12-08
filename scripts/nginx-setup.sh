#!/bin/bash

# Butcapp.com Nginx + SSL Setup Script

echo "🌐 Setting up Butcapp.com with Nginx + SSL..."

# Variables
DOMAIN="butcapp.com"
EMAIL="admin@butcapp.com"
WEB_ROOT="/var/www/butcapp"
NGINX_CONF="/etc/nginx/sites-available/butcapp.conf"

# 1. Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# 2. Install required packages
echo "📦 Installing Nginx and Certbot..."
apt install -y nginx certbot python3-certbot-nginx

# 3. Create nginx directories
echo "📁 Creating nginx directories..."
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

# 4. Copy nginx configuration
echo "⚙️ Setting up Nginx configuration..."
cp $WEB_ROOT/nginx/butcapp.conf $NGINX_CONF

# 5. Create symbolic link
echo "🔗 Enabling site..."
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/

# 6. Remove default site
echo "🗑️ Removing default nginx site..."
rm -f /etc/nginx/sites-enabled/default

# 7. Test nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi

# 8. Setup firewall
echo "🔥 Setting up firewall..."
ufw allow 'Nginx Full'
ufw --force enable

# 9. Stop PM2 on port 3000 (if running)
echo "🛑 Stopping PM2 processes..."
pm2 stop all || true
pm2 delete all || true

# 10. Update PM2 to use port 3001
echo "🔄 Updating PM2 configuration..."
cd $WEB_ROOT
git pull origin master

# 11. Start PM2 on port 3001
echo "🚀 Starting PM2 on port 3001..."
pm2 start ecosystem.config.js --env production

# 12. Get SSL certificate
echo "🔒 Getting SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect

# 13. Restart nginx
echo "🔄 Restarting Nginx..."
systemctl restart nginx

# 14. Setup auto-renewal
echo "🔄 Setting up SSL auto-renewal..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# 15. Verify setup
echo "🔍 Verifying setup..."

# Check PM2 status
echo "📊 PM2 Status:"
pm2 status

# Check Nginx status
echo "🌐 Nginx Status:"
systemctl status nginx --no-pager

# Check SSL certificate
echo "🔒 SSL Certificate Status:"
certbot certificates

# Test HTTP to HTTPS redirect
echo "🌐 Testing HTTP redirect..."
curl -I http://$DOMAIN

# Test HTTPS
echo "🌐 Testing HTTPS..."
curl -I https://$DOMAIN

echo "✅ Setup Complete!"
echo "🌐 Your site should be available at: https://$DOMAIN"
echo "📋 Useful Commands:"
echo "  nginx -t                    - Test nginx configuration"
echo "  systemctl reload nginx        - Reload nginx without downtime"
echo "  pm2 status                  - Check PM2 status"
echo "  pm2 logs butcapp           - View application logs"
echo "  certbot renew --dry-run     - Test SSL renewal"
echo "  tail -f /var/log/nginx/butcapp.access.log - View nginx access logs"
echo "  tail -f /var/log/nginx/butcapp.error.log  - View nginx error logs"
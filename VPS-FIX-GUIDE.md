# VPS Deployment Instructions for ButcApp

## 🚨 COMMON VPS ISSUES & SOLUTIONS

### Issue 1: Database Path Problems
**Error:** `Cannot open database because the directory does not exist`

**Solution:**
```bash
# Create database directory
sudo mkdir -p /var/www/butcapp/db
sudo chown -R $USER:$USER /var/www/butcapp
sudo chmod -R 755 /var/www/butcapp

# Copy existing database
cp /home/z/my-project/db/custom.db /var/www/butcapp/db/
```

### Issue 2: Environment Variables
**Error:** 500 Internal Server Error

**Solution:** Set correct environment variables:
```bash
export NODE_ENV=production
export DATABASE_URL="file:/var/www/butcapp/db/custom.db"
export JWT_SECRET="butcapp-secret-key-change-in-production-2024"
```

### Issue 3: Missing Dependencies
**Error:** Module not found errors

**Solution:**
```bash
# Install system dependencies
sudo apt update
sudo apt install -y sqlite3 build-essential

# Install Node.js dependencies
npm install
```

## 🔧 QUICK FIX COMMANDS

Run these commands on your VPS:

```bash
# 1. Create directories and set permissions
sudo mkdir -p /var/www/butcapp/db
sudo chown -R $USER:$USER /var/www/butcapp
sudo chmod -R 755 /var/www/butcapp

# 2. Copy database
cp /home/z/my-project/db/custom.db /var/www/butcapp/db/

# 3. Set environment variables
export NODE_ENV=production
export DATABASE_URL="file:/var/www/butcapp/db/custom.db"
export JWT_SECRET="butcapp-secret-key-change-in-production-2024"

# 4. Install dependencies
npm install

# 5. Build and start
npm run build
npm start
```

## 📋 CODE CHANGES MADE

### 1. Enhanced Database Connection (`src/lib/db.ts`)
- ✅ Auto-directory creation
- ✅ Fallback mechanism
- ✅ Better error handling
- ✅ Environment-aware path resolution

### 2. Improved API Error Handling
- ✅ Detailed logging
- ✅ Development error details
- ✅ Graceful degradation

### 3. Fixed Logger (`src/lib/logger.ts`)
- ✅ Drizzle ORM syntax
- ✅ Error-safe logging
- ✅ Console fallback

## 🎯 EXPECTED RESULTS

After applying these fixes:
- ✅ `/api/auth/check-email` should return 200
- ✅ `/api/auth/signup` should return 201 on success
- ✅ Database operations should work correctly
- ✅ Error messages should be informative

## 🚨 TROUBLESHOOTING

If you still get errors:

1. **Check console logs:** Look for detailed error messages
2. **Verify database path:** Ensure `/var/www/butcapp/db/custom.db` exists
3. **Check permissions:** Ensure the app can read/write to database directory
4. **Environment variables:** Verify all required env vars are set

## 📞 DEBUG MODE

To enable detailed error messages:
```bash
export NODE_ENV=development
```

This will show detailed error messages in API responses.
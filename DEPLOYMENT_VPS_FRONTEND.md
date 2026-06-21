# 🚀 DEPLOYMENT FRONTEND KE VPS 187.77.116.90

**Status**: Frontend build complete ✅ | Ready untuk deploy

---

## 📋 CHECKLIST SEBELUM DEPLOY

- [x] Frontend build complete: `npm run build`
- [x] Config updated: `.env` → VITE_API_BASE_URL=http://187.77.116.90:3001
- [x] `dist/` folder ready (2.4MB)
- [ ] VPS credentials siap (SSH/FTP)
- [ ] Backend running di VPS (http://187.77.116.90:3001)
- [ ] Nginx/webserver configured di VPS

---

## 🔧 OPTION 1: DEPLOY VIA SCP (SSH RECOMMENDED)

### Syarat:
- SSH access ke VPS
- Credentials: root@187.77.116.90

### Command:
```bash
# Upload dist folder ke VPS
scp -r "C:\Users\ferry fernando\ARTIFICIAL-INTELIGENT-ORION\dist" root@187.77.116.90:/home/apps/deepernova/

# SSH ke VPS
ssh root@187.77.116.90

# Di VPS, copy ke Nginx
cp -r /home/apps/deepernova/dist/* /var/www/html/

# Verify
ls -la /var/www/html/

# Restart Nginx
systemctl restart nginx
```

### Test:
```bash
curl http://187.77.116.90
# Harus return HTML dari index.html
```

---

## 🔧 OPTION 2: DEPLOY VIA FTP/SFTP

### Tools:
- FileZilla (free)
- WinSCP
- Cyberduck

### Steps:
1. Connect ke 187.77.116.90 dengan FTP/SFTP credentials
2. Navigate ke: `/var/www/html/` (atau path Nginx root)
3. Upload folder `dist/*` ke sana
4. Verify di browser: http://187.77.116.90

---

## 🌐 NGINX CONFIGURATION (Jika belum configured)

### SSH ke VPS:
```bash
ssh root@187.77.116.90

# Check if Nginx installed
nginx -v

# If not, install:
apt-get update && apt-get install -y nginx
```

### Create/Update Nginx config:
```bash
nano /etc/nginx/sites-available/deepernova
```

### Paste config berikut:
```nginx
server {
    listen 80;
    server_name 187.77.116.90 deepernova.com www.deepernova.com;
    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # SPA routing - semua route ke index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static files caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy ke backend
    location /api/ {
        proxy_pass http://187.77.116.90:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip static files
    location ~* \.(js|css|woff|woff2)$ {
        gzip_static on;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable config:
```bash
ln -sf /etc/nginx/sites-available/deepernova /etc/nginx/sites-enabled/

# Test syntax
nginx -t

# Restart Nginx
systemctl restart nginx

# Start on boot
systemctl enable nginx
```

---

## 🔐 HTTPS SETUP (Optional tapi recommended)

### Install Certbot:
```bash
apt-get install -y certbot python3-certbot-nginx
```

### Get SSL certificate:
```bash
certbot --nginx -d 187.77.116.90 -d deepernova.com -d www.deepernova.com
```

### Auto-renew:
```bash
systemctl enable certbot.timer
```

---

## ✅ VERIFICATION CHECKLIST

### 1. Frontend running:
```bash
curl http://187.77.116.90
# Harus return HTML index page
```

### 2. API connectivity:
```bash
curl http://187.77.116.90/api/health
# Harus return response dari backend
```

### 3. Login test di browser:
- Buka: http://187.77.116.90
- Klik "Login"
- Verify authentication berjalan

### 4. Global Memory test:
- Login
- Kirim 2+ messages
- Buka Global Memory panel (⚙️ Opsi → 🧠 Global Memory)
- Verify memory tercatat

### 5. File generation test:
- Di chat: "buat dokumen tentang AI"
- Download file
- Verify bisa generate DOCX/PPTX

---

## 🚨 TROUBLESHOOTING

### Error: "Cannot GET /"
**Cause**: Nginx tidak serving `dist/` folder dengan benar
**Fix**:
```bash
# Verify dist files di server
ls -la /var/www/html/
# Harus ada: index.html, assets/, dll

# Check Nginx config
nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

### Error: "API connection failed"
**Cause**: Frontend tidak bisa connect ke backend di port 3001
**Fix**:
1. Verify backend running: `curl http://187.77.116.90:3001/health`
2. Check firewall: `iptables -L | grep 3001`
3. Check Nginx proxy config: `cat /etc/nginx/sites-enabled/deepernova`

### Error: "Cannot read property 'isAuthenticated'"
**Cause**: Session/auth issue
**Fix**:
1. Clear browser cache/cookies
2. Verify backend `.env` punya SESSION_SECRET
3. Restart backend

### Error: "Global Memory showing HTML response"
**Cause**: Endpoint returning HTML instead of JSON (likely 500 error)
**Fix**:
1. Check backend logs for error
2. Verify database initialized properly
3. Verify user is authenticated (401 is expected for guests)

---

## 📊 CURRENT ARCHITECTURE

```
┌─────────────────────────────────────┐
│  Browser (Client)                   │
│  http://187.77.116.90 (Nginx)       │
└────────────┬────────────────────────┘
             │ 
             ▼
┌─────────────────────────────────────┐
│  Nginx Reverse Proxy                │
│  Static: /var/www/html/dist/        │
│  API: → backend:3001                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Backend (Express)                  │
│  http://187.77.116.90:3001          │
│  - Sessions, Auth                   │
│  - Global Memory CRUD               │
│  - File generation                  │
│  - API integrations                 │
└─────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Database & External APIs           │
│  - SQLite (local)                   │
│  - TokenMix (image generation)      │
│  - DeepSeek (chat)                  │
│  - File generators                  │
└─────────────────────────────────────┘
```

---

## 📝 DEPLOYMENT COMMANDS QUICK REFERENCE

### 1. Build frontend:
```bash
cd C:\Users\ferry fernando\ARTIFICIAL-INTELIGENT-ORION
npm run build
```

### 2. Upload ke VPS:
```bash
# Option A - SCP
scp -r dist root@187.77.116.90:/home/apps/deepernova/

# Option B - Filezilla/WinSCP
# Transfer dist/* to /var/www/html/
```

### 3. Nginx setup di VPS:
```bash
ssh root@187.77.116.90
apt-get update && apt-get install -y nginx

# Update config (copas dari section di atas)
nano /etc/nginx/sites-available/deepernova

# Enable & restart
ln -sf /etc/nginx/sites-available/deepernova /etc/nginx/sites-enabled/
systemctl restart nginx
```

### 4. Test:
```bash
curl http://187.77.116.90
```

---

## 📞 NEXT STEPS

1. **Verify Backend** running di VPS:
   ```bash
   curl http://187.77.116.90:3001/health
   ```

2. **Upload Frontend** ke VPS

3. **Configure Nginx** di VPS

4. **Test** end-to-end

5. **Setup HTTPS** with Certbot (optional)

---

## 🎯 FINAL STATUS

- ✅ Frontend build complete
- ✅ Config updated to VPS backend
- ✅ Global Memory system implemented
- ⏳ Awaiting SSH credentials to deploy
- ⏳ Awaiting backend confirmation on VPS

**Ready to deploy on your command!** 🚀

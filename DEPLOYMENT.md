# MyBizTools Production Deployment Guide

## Pre-Deployment Checklist

### 1. Security - CRITICAL

Before deploying, you MUST:

- [ ] **Revoke all exposed API keys** and generate new ones:
  - Termii API key
  - Resend API key
  - Monnify API keys

- [ ] **Generate secure secrets**:
  ```bash
  # JWT Secret (64 characters)
  openssl rand -hex 64

  # Database password
  openssl rand -base64 24
  ```

- [ ] **Verify .env files are in .gitignore**

### 2. Database Setup (PostgreSQL)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql

CREATE DATABASE mybiztools;
CREATE USER mybiztools_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mybiztools TO mybiztools_user;
\q

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://mybiztools_user:your_secure_password@localhost:5432/mybiztools?schema=public"

# Run migrations
cd mybiztools-backend
npx prisma migrate deploy
npx prisma generate
```

### 3. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d mybiztools.ng -d www.mybiztools.ng

# Auto-renewal (add to crontab)
0 0 1 * * /usr/bin/certbot renew --quiet
```

### 4. Environment Configuration

Copy and configure production environment files:

```bash
# Backend
cd mybiztools-backend
cp .env.production.example .env
nano .env  # Edit with production values

# Frontend
cd ..
cp .env.production.example .env.production
nano .env.production
```

**Required environment variables:**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | 64+ char random hex string |
| `FRONTEND_URL` | `https://mybiztools.ng` |
| `RESEND_API_KEY` | Production Resend API key |
| `FROM_EMAIL` | `MyBizTools <noreply@mybiztools.ng>` |
| `TERMII_API_KEY` | Production Termii API key |

### 5. Build and Deploy

#### Option A: Docker Deployment

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose logs -f
```

#### Option B: Manual Deployment

```bash
# Backend
cd mybiztools-backend
npm ci --production
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 start dist/server.js --name mybiztools-api

# Frontend
cd ..
npm ci
npm run build
# Copy dist/ to nginx html directory
```

### 6. Nginx Configuration

```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/mybiztools
sudo ln -s /etc/nginx/sites-available/mybiztools /etc/nginx/sites-enabled/

# Add rate limiting to main nginx.conf
# In http {} block:
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Post-Deployment Verification

- [ ] Test HTTPS: `curl -I https://mybiztools.ng`
- [ ] Test API health: `curl https://mybiztools.ng/api/health`
- [ ] Test authentication: Try login/register
- [ ] Test email sending
- [ ] Monitor logs for errors

### 8. Monitoring Setup

```bash
# Install monitoring tools
pm2 install pm2-logrotate

# View real-time logs
pm2 logs mybiztools-api

# Monitor resources
pm2 monit
```

---

## Security Reminders

1. **Never commit .env files** to version control
2. **Rotate API keys** every 90 days
3. **Enable HSTS** after confirming HTTPS works (uncomment in nginx.conf)
4. **Set up database backups** (daily minimum)
5. **Monitor for failed login attempts**

## Troubleshooting

### Database connection failed
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify DATABASE_URL format
- Check firewall rules

### SSL certificate issues
- Verify domain DNS points to server
- Check certificate paths in nginx.conf
- Run `certbot renew --dry-run`

### API 502 errors
- Check backend is running: `pm2 status`
- Verify PORT matches nginx proxy_pass
- Check backend logs: `pm2 logs mybiztools-api`

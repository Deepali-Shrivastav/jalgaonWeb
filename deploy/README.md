# JalgaonWeb — Deployment Guide

> All deployment infrastructure lives in this `deploy/` directory.  
> Day-to-day deployments after initial setup are **fully automatic via GitHub Actions**.

---

## Directory Structure

```
deploy/
├── README.md                         ← This file (deployment guide)
├── nginx/
│   ├── jalgaon-api.conf              ← Nginx config for api.jalgaon.com (Django)
│   └── jalgaon-frontend.conf         ← Nginx config for www.jalgaon.com (React)
├── scripts/
│   └── server_setup.sh              ← One-time server bootstrap script
└── systemd/
    └── gunicorn_jalgaon.service      ← Gunicorn systemd service definition
```

---

## Infrastructure Overview

| Resource | Details |
|:---|:---|
| **Web Server** | `jalgaon-webapp` (AWS Lightsail, Ubuntu 22.04) |
| **Web Server IP** | `13.127.8.145` |
| **DB Server** | `jalgaon.com-dbs` (AWS Lightsail, Ubuntu 22.04) |
| **DB Server IP** | `65.1.52.6` (PostgreSQL 14) |
| **SSH User** | `ubuntu` (both servers) |
| **SSH Key** | Lightsail default key — Mumbai region |

---

## GitHub Actions Secrets Required

Add these in **GitHub → Settings → Secrets and variables → Actions → New repository secret**:

| Secret Name | Value | Notes |
|:---|:---|:---|
| `PRODUCTION_SERVER_IP` | `13.127.8.145` | jalgaon-webapp static IP |
| `PRODUCTION_SSH_USER` | `ubuntu` | Lightsail default user |
| `PRODUCTION_SSH_KEY` | Full `.pem` file contents | Download from Lightsail → jalgaon-webapp → Connect → "Download default key" |
| `DJANGO_SECRET_KEY` | Generate a new random key | `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DB_NAME` | `jalgaon_database` | |
| `DB_USER` | Your DB username | |
| `DB_PASSWORD` | Your DB password | |
| `DB_HOST` | `65.1.52.6` | jalgaon.com-dbs server |
| `DB_PORT` | `5432` | Default PostgreSQL |
| `FAST2SMS_API_KEY` | Your Fast2SMS key | |

---

## First-Time Server Setup

Run the bootstrap script **once** on the `jalgaon-webapp` server:

1. Open **Lightsail → jalgaon-webapp → Connect using SSH** (browser console)
2. Paste and run the contents of `deploy/scripts/server_setup.sh`
3. Follow the manual steps printed at the end of the script
4. Add all GitHub Secrets listed above

After that — every push to `main` auto-deploys. **You never SSH for deployments again.**

---

## CI/CD Workflow Summary

| Workflow | File | Triggers |
|:---|:---|:---|
| CI — Run Tests | `.github/workflows/ci-tests.yml` | Push to `develop`/`feature/**`, PRs to `main`/`develop`, Manual |
| CD — Deploy Backend | `.github/workflows/deploy-backend.yml` | Push to `main` (jalgaonApi changes), Manual |
| CD — Deploy Frontend | `.github/workflows/deploy-frontend.yml` | Push to `main` (jalgaonUi changes), Manual |

### Manual Trigger (Workflow Dispatch)
All three workflows have a **"Run workflow"** button in **GitHub → Actions** tab.  
Use this for emergency hotfixes or to re-deploy without making a code change.

---

## SSL Setup (Required for HTTPS)

After server bootstrap, enable HTTPS:

```bash
# 1. Open Port 443 in Lightsail firewall first:
#    Lightsail → jalgaon-webapp → Networking → Add rule → HTTPS (443)

# 2. Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 3. Issue certificates (certbot will update Nginx config automatically)
sudo certbot --nginx -d api.jalgaon.com -d www.jalgaon.com

# 4. Test auto-renewal
sudo certbot renew --dry-run
```

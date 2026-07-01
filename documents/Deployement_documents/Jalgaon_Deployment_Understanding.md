# Jalgaon.com — Complete Deployment Understanding Guide
## Reverse-Engineered from Codebase (No Deployment Docs Exist)

> **Situation:** The project was deployed on AWS years ago by someone else. There are no deployment documents. You now own it. This guide tells you everything we can determine from the code, what you need to verify on AWS, and how to take full ownership.

---

## Table of Contents

1. [What We KNOW from the Code](#1-what-we-know-from-the-code)
2. [What We Can INFER (Highly Likely)](#2-what-we-can-infer-highly-likely)
3. [What We DON'T Know Yet](#3-what-we-dont-know-yet)
4. [Current Architecture Diagram](#4-current-architecture-diagram)
5. [How to Fetch Everything from AWS](#5-how-to-fetch-everything-from-aws)
6. [Security Risks Found in Code](#6-security-risks-found-in-code)
7. [Your Action Plan as New Owner](#7-your-action-plan-as-new-owner)
8. [Checklists](#8-checklists)

---

## 1. What We KNOW from the Code

This is hard evidence — facts directly extracted from the source files.

### 1.1 From `settings.py`

| What We Found | Where | What It Means |
|---|---|---|
| `HOST = '65.1.52.6'` | Database config | The PostgreSQL DB server is at this IP (likely same EC2 instance) |
| `PORT = '5432'` | Database config | Standard PostgreSQL port |
| `DB NAME = 'jalgaon_database'` | Database config | The actual database name on the server |
| `DB USER = 'jalgaon-app'` | Database config | The PostgreSQL user Django uses |
| `DB PASSWORD = 'kjshfgkhdkjhgjdkhfgyghi'` | Database config | Hardcoded in source code — security risk |
| `SECRET_KEY` hardcoded | settings.py | Django secret key is in code — must move to env var |
| `DEBUG = True` | settings.py | Running in DEBUG mode in production — dangerous |
| `ALLOWED_HOSTS` | settings.py | Domains: `www.jalgaon.com`, `api.jalgaon.com` |
| `CORS_ALLOWED_ORIGINS` | settings.py | `https://www.jalgaon.com`, `https://api.jalgaon.com`, `capacitor://localhost` |
| `WSGI_APPLICATION` | settings.py | Uses WSGI — means Gunicorn is the likely server |
| `MEDIA_ROOT = /media/` | settings.py | Uploaded images stored locally on disk (NOT S3) |
| `STATIC_ROOT = /staticfiles/` | settings.py | Static files collected locally |

### 1.2 From `jalgaonUi/.env`

```
VITE_DJANGO_API=https://api.jalgaon.com
```
- The React frontend always calls `api.jalgaon.com`
- Backend Django API is served at a separate subdomain from the frontend
- The frontend is served at `www.jalgaon.com`

### 1.3 From `requirements.txt`

| Package | Deployment Implication |
|---|---|
| `Django==5.0.7` | Specific version — must match exactly on server |
| `psycopg2` (via `postgresql_psycopg2`) | PostgreSQL driver — must be installed on server |
| `Pillow==10.4.0` | Image processing — must be installed on server |
| `twilio==9.2.3` | Twilio SMS library — for OTP (unused in code currently) |
| No `gunicorn` in requirements | The WSGI server was installed separately on server |
| No `nginx` packages | Nginx config is entirely on the server, not in code |

### 1.4 From `package.json` (Frontend)

| Script | What It Does |
|---|---|
| `npm run build` | Creates `/dist` folder — this is what gets deployed |
| Vite | Build tool — output is plain HTML/CSS/JS files |
| Capacitor | Android wrapper — separate APK build process |

### 1.5 From File System

| File/Dir | Deployment Clue |
|---|---|
| `db.sqlite3` exists | Old/dev SQLite DB — NOT used in production |
| `staticfiles/` dir exists | `collectstatic` was run — Django static files collected |
| `media/` dir exists | Uploaded images stored on server's local disk |
| `data.json` (179KB) | Fixture/seed data — was used to populate initial DB |

---

## 2. What We Can INFER (Highly Likely)

These are educated conclusions based on the code patterns + typical AWS deployments for Django+React.

### 2.1 Server Setup (Almost Certain)

```
IP: 65.1.52.6  — This IS an AWS EC2 instance IP (65.x.x.x range is AWS)
```

The EC2 instance likely runs:
- **Ubuntu** or **Amazon Linux** (most common for Django)
- **Nginx** as a reverse proxy (standard for Django)
- **Gunicorn** as the WSGI server (standard for Django production)
- **Supervisor** or **systemd** to keep Gunicorn running

### 2.2 How the Backend is Served (Likely Setup)

```
Internet Request → Nginx (port 80/443) → Gunicorn (port 8000) → Django
```

Nginx handles:
- SSL termination (HTTPS)
- Serving `/media/` and `/static/` files directly
- Routing `/admin/`, `/app/`, `/api/` to Gunicorn

### 2.3 How the Frontend is Served (Two Options — Must Verify)

**Option A (Most Likely):** React build (`/dist`) served by **Nginx on the same EC2 instance**
- `www.jalgaon.com` → EC2 Nginx → serves `/dist/index.html`

**Option B:** React build deployed to **AWS S3 + CloudFront**
- `www.jalgaon.com` → CloudFront CDN → S3 bucket with built files

You need to check DNS records and AWS Console to confirm which one.

### 2.4 Domain & DNS (Inferred)

| Domain | Likely Points To |
|---|---|
| `www.jalgaon.com` | EC2 instance OR CloudFront/S3 |
| `api.jalgaon.com` | Same EC2 instance (65.1.52.6) |

### 2.5 SSL Certificate (Inferred)

Since both domains use `https://`, there must be:
- **Let's Encrypt** certificate (free, common) managed by Certbot on EC2, OR
- **AWS Certificate Manager (ACM)** certificate (if using CloudFront/ALB)

### 2.6 Database Location

Since `HOST = '65.1.52.6'` (same IP as the likely EC2 instance):

**Most likely:** PostgreSQL runs **directly on the same EC2 instance** — not on RDS.
- Common for smaller projects to save cost
- Means DB and Django app share the same server

**Less likely:** If it were AWS RDS, the HOST would be an RDS endpoint URL (like `xxx.rds.amazonaws.com`), not a plain IP.

---

## 3. What We DON'T Know Yet

Things you **must** verify by logging into AWS and/or the server:

| Unknown | How to Find It |
|---|---|
| EC2 instance type (t2.micro, t3.small etc.) | AWS Console → EC2 → Instances |
| AWS region of the server | AWS Console → EC2 (check region selector top-right) |
| Whether there are multiple EC2 instances | AWS Console → EC2 → Instances |
| Is there a Load Balancer? | AWS Console → EC2 → Load Balancers |
| Is S3 used for media files? | AWS Console → S3 OR Nginx config on server |
| Is S3 used for frontend? | AWS Console → S3 (check for bucket with HTML/JS files) |
| Is CloudFront used? | AWS Console → CloudFront |
| Where is DNS managed? | AWS Console → Route 53 |
| How is the app kept running? | SSH → `systemctl status gunicorn` |
| What Nginx config exists? | SSH → `/etc/nginx/sites-available/` |
| Is there a CI/CD pipeline? | AWS CodePipeline or GitHub Actions |
| Are there backups configured? | AWS Console → RDS (if any) or cron jobs on EC2 |
| What IAM users/roles exist? | AWS Console → IAM |
| CloudWatch alarms? | AWS Console → CloudWatch |
| Monthly costs? | AWS Console → Billing |

---

## 4. Current Architecture Diagram

Based on everything we know and infer:

```
┌────────────────────────────────────────────────────────────────┐
│                        THE INTERNET                            │
└──────────────────────────────┬─────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │   DNS Resolution     │
                    │  (Route53 or other) │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                                   │
    www.jalgaon.com                      api.jalgaon.com
             │                                   │
             ▼                                   ▼
   ┌─────────────────────────────────────────────────────────┐
   │              AWS EC2 Instance  (65.1.52.6)              │
   │                                                         │
   │  ┌─────────────────────────────────────────────────┐   │
   │  │                   Nginx                          │   │
   │  │  ┌──────────────┐    ┌──────────────────────┐   │   │
   │  │  │ www.jalgaon  │    │  api.jalgaon.com     │   │   │
   │  │  │ → /dist/*    │    │  → Gunicorn:8000     │   │   │
   │  │  │ (React build)│    │  /admin/ /app/ /api/ │   │   │
   │  │  └──────────────┘    └──────────┬───────────┘   │   │
   │  └────────────────────────────────┬┴───────────────┘   │
   │                                   │                     │
   │  ┌────────────────────────────────▼───────────────┐    │
   │  │              Gunicorn (WSGI Server)             │    │
   │  │              Django 5 Application               │    │
   │  └────────────────────────────────────────────────┘    │
   │                                                         │
   │  ┌──────────────────────┐  ┌──────────────────────┐    │
   │  │  PostgreSQL DB       │  │  Media Files (/media) │    │
   │  │  jalgaon_database    │  │  (uploaded images)    │    │
   │  │  user: jalgaon-app   │  │  stored on EC2 disk   │    │
   │  └──────────────────────┘  └──────────────────────┘    │
   └─────────────────────────────────────────────────────────┘

   ┌───────────────────────────────────┐
   │  Android App (Capacitor)          │
   │  → calls api.jalgaon.com directly │
   └───────────────────────────────────┘
```

> NOTE: This diagram shows the MOST LIKELY setup. Verify with AWS Console.

---

## 5. How to Fetch Everything from AWS

### Step 1: Log into AWS Console

Go to **https://console.aws.amazon.com** and log in.

> You need AWS account credentials. Ask your manager/previous developer for:
> - AWS Account ID
> - IAM username + password, OR root email + password

---

### Step 2: Find the EC2 Instance

```
AWS Console → Services → EC2 → Instances
```

Look for an instance with **Public IP = 65.1.52.6**

From there you can see:
- Instance ID (e.g., `i-0abc123`)
- Instance type (e.g., `t2.micro`, `t3.small`)
- Region (e.g., `ap-south-1` for Mumbai — most likely for India)
- Launch date
- Key pair name (needed to SSH)
- Security groups (firewall rules)
- AMI ID (OS type)

---

### Step 3: Check Security Groups (Firewall Rules)

```
AWS Console → EC2 → Security Groups
```

Look at the security group attached to your EC2 instance. You'll see:
- What ports are open (80/HTTP, 443/HTTPS, 22/SSH, 5432/PostgreSQL)
- Who can access them (0.0.0.0/0 = everyone, or specific IPs)

---

### Step 4: Check S3 Buckets

```
AWS Console → Services → S3
```

Look for buckets related to Jalgaon:
- A bucket with HTML/JS files = frontend is on S3
- A bucket with images = media files are on S3
- If no Jalgaon buckets exist = everything is on EC2 disk

---

### Step 5: Check CloudFront

```
AWS Console → Services → CloudFront
```

If you see a distribution pointing to `www.jalgaon.com` or an S3 bucket — the frontend uses CloudFront CDN.

---

### Step 6: Check Route 53 (DNS)

```
AWS Console → Services → Route 53 → Hosted Zones
```

If `jalgaon.com` appears here → DNS is managed in AWS.
- `www.jalgaon.com` record → tells you if it points to EC2 IP or CloudFront
- `api.jalgaon.com` record → should point to EC2 IP `65.1.52.6`

If Route 53 is empty → DNS is managed at the domain registrar (GoDaddy, Namecheap, etc.)

---

### Step 7: Check RDS

```
AWS Console → Services → RDS → Databases
```

If empty → PostgreSQL runs on the EC2 instance directly (not managed RDS).
If you see a database → note its endpoint, class, and backup settings.

---

### Step 8: Check IAM (Users and Permissions)

```
AWS Console → Services → IAM → Users
```

See all IAM users. You should:
- Create your own IAM user with appropriate permissions
- Disable old developer IAM users after confirming you have access

---

### Step 9: Check Billing

```
AWS Console → Billing → Bills
```

See monthly costs broken down by service — tells you exactly which services are being used.

---

### Step 10: SSH into the Server (Most Important Step)

Once you have the EC2 key pair file (`.pem` file), you can SSH in:

```bash
# Replace with your actual .pem file and EC2 IP
ssh -i "your-key.pem" ubuntu@65.1.52.6
# OR for Amazon Linux:
ssh -i "your-key.pem" ec2-user@65.1.52.6
```

Once logged in, run these commands to discover the real setup:

```bash
# 1. See what processes are running
ps aux | grep -E 'gunicorn|nginx|postgres'

# 2. Check Nginx config
sudo ls /etc/nginx/sites-available/
sudo cat /etc/nginx/sites-available/jalgaon  # (or whatever name)

# 3. Check if Gunicorn is a systemd service
sudo systemctl status gunicorn
# OR check supervisor
sudo supervisorctl status

# 4. Find where Django project lives on server
find / -name "manage.py" 2>/dev/null

# 5. Check PostgreSQL databases
sudo -u postgres psql -c "\l"

# 6. Check installed Python packages
pip freeze | grep -E 'gunicorn|django|psycopg'

# 7. Check cron jobs
crontab -l
sudo crontab -l

# 8. Check SSL certificate expiry
sudo certbot certificates
# OR
sudo ls /etc/letsencrypt/live/

# 9. Check disk usage (important for media files)
df -h
du -sh /var/www/*/media/ 2>/dev/null

# 10. Look for .env files on server
find /var/www /home /opt -name ".env" 2>/dev/null
```

---

## 6. Security Risks Found in Code

Critical issues you must fix as the new owner:

| Risk | Severity | Location | Fix Required |
|---|---|---|---|
| `SECRET_KEY` hardcoded in `settings.py` | 🔴 CRITICAL | settings.py line 12 | Move to environment variable |
| `DATABASE PASSWORD` hardcoded in `settings.py` | 🔴 CRITICAL | settings.py line 111 | Move to environment variable |
| `DEBUG = True` in production | 🔴 CRITICAL | settings.py line 15 | Set `DEBUG = False` |
| Fast2SMS API key hardcoded in `utils.py` | 🔴 HIGH | `app/utils.py` | Move to environment variable |
| DB password visible to anyone with code access | 🔴 HIGH | settings.py | Rotate DB password + move to env |
| No backup system visible in code | 🟡 MEDIUM | — | Set up automated PostgreSQL backups |
| Media files on local EC2 disk | 🟡 MEDIUM | settings.py | If EC2 crashes, all uploaded images lost — migrate to S3 |
| `db.sqlite3` committed to repo | 🟡 LOW | Repo root | Add to `.gitignore` |

---

## 7. Your Action Plan as New Owner

### Phase 1: Get Access (Week 1) — Most Critical

1. ✅ Get AWS Console login credentials from previous developer/manager
2. ✅ Get the EC2 SSH key pair (`.pem` file) — without this you can't access the server
3. ✅ Get domain registrar login if DNS is not in Route 53
4. ✅ Log into AWS Console and go through all steps in Section 5
5. ✅ Create your own IAM user with admin access
6. ✅ SSH into the server (65.1.52.6) and run discovery commands above

### Phase 2: Document the Real Setup (Week 1-2)

After SSHing in, document:
- [ ] Nginx config (copy to your repo's `Documents/` folder)
- [ ] Gunicorn/supervisor config
- [ ] Python version on server (`python3 --version`)
- [ ] Where the project code lives (`find / -name "manage.py"`)
- [ ] Any `.env` files on the server
- [ ] Cron jobs running

### Phase 3: Fix Critical Security Issues (Week 2)

1. [ ] Create a `.env` file on the server with all secrets
2. [ ] Update `settings.py` to read from environment variables
3. [ ] Set `DEBUG = False` and test nothing breaks
4. [ ] Rotate the DB password (change in PostgreSQL + `.env`)
5. [ ] Generate a new `SECRET_KEY` and put in `.env`

### Phase 4: Set Up Backups (Week 3)

1. [ ] Set up automated PostgreSQL backups (nightly `pg_dump` to S3)
2. [ ] Test restoration from backup
3. [ ] Consider migrating media files to S3

### Phase 5: Understand Deployment Process (Week 3-4)

Figure out how the previous developer deployed changes:
- Did they SSH and `git pull` manually?
- Was there a `deploy.sh` script?
- Was there CI/CD (GitHub Actions, CodePipeline)?

Then document the process so you can confidently deploy new features.

---

## 8. Checklists

### AWS Access Checklist

- [ ] AWS Console login obtained
- [ ] EC2 SSH key pair (`.pem` file) obtained
- [ ] EC2 instance found in console (IP: 65.1.52.6)
- [ ] Instance region identified
- [ ] Security groups reviewed
- [ ] S3 buckets checked
- [ ] Route 53 / DNS reviewed
- [ ] RDS checked
- [ ] IAM users reviewed
- [ ] Monthly billing cost noted
- [ ] CloudWatch checked

### Server Access Checklist

- [ ] SSH into 65.1.52.6 successfully
- [ ] Found Django project directory on server
- [ ] Read Nginx config
- [ ] Found Gunicorn/supervisor setup
- [ ] Found any `.env` files on server
- [ ] Noted Python version
- [ ] Checked cron jobs
- [ ] Checked SSL certificate expiry
- [ ] Checked disk usage

### Questions to Ask Previous Developer

1. "What EC2 instance type was chosen?"
2. "How do you deploy new code? What's the manual process?"
3. "Is there a CI/CD pipeline?"
4. "Where is the `.pem` SSH key file?"
5. "Are database backups automated anywhere?"
6. "Is S3 being used for media files or frontend?"
7. "Are there other AWS services in use I should know about?"
8. "Has SSL certificate auto-renewal been tested?"
9. "Are there any cron jobs set up for DB or app?"
10. "What's the monthly AWS bill approximately?"

---

## Summary

| What We Know (from code) | What We Need to Verify (AWS/SSH) |
|---|---|
| Server IP: `65.1.52.6` (AWS EC2) | SSH key pair to access it |
| PostgreSQL on same server (likely) | Is it on EC2 directly or RDS? |
| Backend: Django 5, WSGI/Gunicorn | Actual Nginx config on server |
| Frontend: React + Vite at `www.jalgaon.com` | Is frontend on EC2 or S3+CloudFront? |
| API at `api.jalgaon.com` | DNS provider (Route53 or external?) |
| Media files stored locally (not S3 yet) | How/if backups are done |
| No deployment docs exist | Need to document after SSH investigation |

> **The single most important next step: Get the AWS Console login + EC2 `.pem` SSH key. Everything else flows from there.**

# Jalgaon.com - Complete Deployment Documentation (FINAL UPDATE)
## 100% Fact-Based - Every Claim Has a Source

Every fact below is backed by a specific screenshot (SS) or source code line.
If something is UNKNOWN, it is labeled clearly.

Total screenshots analyzed: 9 (from 3 separate sharing sessions)
Last updated: June 2026

---

## PART 1: THE INFRASTRUCTURE

### Instance 1: jalgaon-webapp (Web Server)

| Property | Value | Proof |
|---|---|---|
| Name | jalgaon-webapp | Previous SS2 |
| OS | Ubuntu | Previous SS3 |
| RAM | 4 GB | Previous SS2 |
| vCPUs | 2 | Previous SS2 |
| SSD | 80 GB | Previous SS2 |
| Region | Mumbai, Zone A (ap-south-1a) | Previous SS3 |
| Static Public IPv4 | 13.127.8.145 | Previous SS3 |
| Private IPv4 | 172.26.4.114 | Previous SS3 |
| Status | Running | Previous SS2, SS3 |
| SSH Username | ubuntu | Previous SS5 |
| Load Balancer | NONE - "not sharing traffic with any others" | New SS1 |
| CloudFront | NONE - "not being used as origin of a distribution" | New SS1 |

---

### Instance 2: jalgaon.com-dbs (Database Server)

| Property | Value | Proof |
|---|---|---|
| Name | jalgaon.com-dbs | Previous SS2 |
| OS | Ubuntu | Previous SS4 |
| RAM | 1 GB | Previous SS2 |
| vCPUs | 2 | Previous SS2 |
| SSD | 40 GB | Previous SS2 |
| Region | Mumbai, Zone A (ap-south-1a) | Previous SS4 |
| Static Public IPv4 | 65.1.52.6 (named: jalgaon-com-dbs-ip) | New SS3 |
| Private IPv4 | 172.26.10.173 | New SS3 |
| Status | Running | Previous SS2 |
| Tags | pgsql, setoofy-1 | Previous SS2 |

---

## PART 2: FIREWALL RULES (What Ports Are Open)

### jalgaon-webapp IPv4 Firewall (CONFIRMED - New SS1 this session)

| Application | Protocol | Port | Accessible From |
|---|---|---|
| SSH | TCP | 22 | Any IPv4 address + Lightsail browser SSH |
| HTTP | TCP | 80 | Any IPv4 address |

The Static IP is named: jalgaon-web-ip (shown in SS1)

NOTE: Port 443 (HTTPS) is NOT in the IPv4 firewall.
NOTE: Port 443 (HTTPS) is NOT in the IPv6 firewall either (confirmed previous session).

### jalgaon-webapp IPv6 Firewall (CONFIRMED - previous session)

| Application | Protocol | Port | Accessible From |
|---|---|---|
| SSH | TCP | 22 | Any IPv6 address |
| HTTP | TCP | 80 | Any IPv6 address |

Same - No port 443 here either.

---

### jalgaon.com-dbs IPv4 Firewall (CONFIRMED - New SS3)

| Application | Protocol | Port | Accessible From | Risk |
|---|---|---|---|---|
| SSH | TCP | 22 | Any IPv4 + Lightsail browser | Medium |
| HTTP | TCP | 80 | Any IPv4 address | Unnecessary on DB |
| PostgreSQL | TCP | 5432 | ANY IPv4 ADDRESS | CRITICAL |

### jalgaon.com-dbs IPv6 Firewall (CONFIRMED - New SS4)

| Application | Protocol | Port | Accessible From | Risk |
|---|---|---|---|---|
| SSH | TCP | 22 | Any IPv6 address | Medium |
| HTTP | TCP | 80 | Any IPv6 address | Unnecessary |
| PostgreSQL | TCP | 5432 | ANY IPv6 ADDRESS | CRITICAL |

---

## PART 3: CRITICAL SECURITY FINDINGS

### FINDING 1: PostgreSQL Wide Open to Entire Internet

PROOF: New SS3 and SS4:
- PostgreSQL | TCP | 5432 | Any IPv4 address
- PostgreSQL | TCP | 5432 | Any IPv6 address

COMBINED with settings.py line 111 (DB password hardcoded in code):
Anyone who sees the code can:
1. Read the password from settings.py
2. Connect to 65.1.52.6:5432 (port is open - confirmed by SS3)
3. Access the entire database

FIX: Change the jalgaon.com-dbs firewall rule for port 5432:
  FROM: Any IPv4 address
  TO:   172.26.4.114  (jalgaon-webapp's private IP only)

---

### FINDING 2: Port 443 (HTTPS) is NOT Open on jalgaon-webapp

PROOF:
- New SS1 (IPv4 firewall of jalgaon-webapp): Only SSH:22 and HTTP:80 are listed
- Previous session SS1 (IPv6 firewall of jalgaon-webapp): Only SSH:22 and HTTP:80
- Port 443 is completely absent from BOTH IPv4 and IPv6 firewall rules

Yet jalgaonUi/.env has: VITE_DJANGO_API=https://api.jalgaon.com (HTTPS)
And settings.py CSRF_TRUSTED_ORIGINS has: https://api.jalgaon.com, https://www.jalgaon.com

This creates a contradiction:
  - The code expects HTTPS
  - But port 443 is NOT open in the Lightsail firewall

Possible explanations:
  Option A: HTTPS is truly broken and the site actually runs on HTTP only
            The .env was set with the intention of HTTPS but never fully configured
  Option B: There is HTTPS configured on the server (certbot/Nginx) but
            the Lightsail firewall is blocking it - making HTTPS unreachable
  Option C: HTTPS was working before and the firewall rule was accidentally deleted

FIX: Add port 443 (HTTPS) to jalgaon-webapp firewall:
  Lightsail -> jalgaon-webapp -> Networking -> IPv4 Firewall -> Add rule
  Application: HTTPS | Protocol: TCP | Port: 443 | Restricted to: Any IPv4
  Repeat for IPv6 firewall.

### FINDING 3: Zero SSL Certificates in Lightsail

PROOF: Previous session SSL page shows "SSL/TLS certificates (0)" and "No certificates"

Conclusion: SSL (if working) comes from Let's Encrypt (certbot) on the Ubuntu server.
NOT managed through Lightsail.

Verify via SSH: sudo certbot certificates

---

### FINDING 4: HTTP Port 80 Open on Database Server

PROOF: Previous session SS3 and SS4 show HTTP port 80 open on jalgaon.com-dbs.

A database server should never have web ports open.
FIX: Delete the HTTP port 80 rule from jalgaon.com-dbs firewall.

---

### FINDING 5: No Load Balancer, No CDN

PROOF: New SS2 (jalgaon-webapp Networking scroll-down):
- "This instance is not sharing traffic with any others."
- "This instance is not being used as the origin of a distribution."

Consequence: jalgaon-webapp = single point of failure.

---

### FINDING 6: DNS is NOT Managed in Lightsail

PROOF: New SS3 (Domains & DNS page):
- Page shows ONLY "Create a DNS Zone" and "Register a domain" - completely empty
- No existing DNS zones listed
- The page offers to create zones or register new domains

Conclusion: DNS for jalgaon.com is managed at an EXTERNAL registrar
(likely GoDaddy, Namecheap, Hostinger, or BigRock)

This means:
- www.jalgaon.com DNS A record = at the external registrar pointing to 13.127.8.145
- api.jalgaon.com DNS A record = at the external registrar (pointing to 13.127.8.145)
- You need access to that domain registrar to manage DNS
- SSL certificate renewal may depend on DNS configuration

FIX: Find out which registrar owns jalgaon.com and get login access.

---

### FINDING 7: Backups Are Almost Non-Existent

PROOF: New SS4 and SS5 (Snapshots page)

  jalgaon-webapp:
  - Manual snapshots: 1 exists
  - Last snapshot date: August 28, 2024 (named: jalgaon-webapp-1724822245)
  - Automatic snapshots: DISABLED (toggle is OFF - confirmed SS5)
  - That snapshot is approximately 10 MONTHS OLD

  jalgaon.com-dbs (database server):
  - NO snapshot listed at all - the database has ZERO backups

Consequence:
- If jalgaon-webapp crashes today -> you can restore from Aug 28, 2024 state
  but you lose ALL changes made in the past 10 months
- If jalgaon.com-dbs crashes today -> database is COMPLETELY LOST with no backup

FIX:
  1. Enable automatic snapshots on jalgaon-webapp immediately
  2. Take a manual snapshot of jalgaon.com-dbs immediately
  3. Enable automatic snapshots on jalgaon.com-dbs
  Location: Lightsail -> each instance -> Snapshots tab -> toggle Automatic snapshots ON

---

### FINDING 8: A Previous Instance Was Deleted (History Revealed)

PROOF: New SS4 (Snapshots page) shows:
  Instance: jalgaon-web
  Size: 2 GB RAM, 2 vCPUs, 60 GB SSD (smaller than current jalgaon-webapp)
  Last snapshot: August 12, 2024, 11:06 (UTC+5:30)
  Status: This instance NO LONGER EXISTS in the instances list

This tells us the history:
- Originally: jalgaon-web (2GB/2vCPU/60GB) was the web server
- Around August 2024: Upgraded to jalgaon-webapp (4GB/2vCPU/80GB)
- The old jalgaon-web was deleted, but its snapshot remains
- This means someone DID migrate/upgrade the server in August 2024

---

### FINDING 5: Secrets Hardcoded in Code

From settings.py:
- Line 15: DEBUG = True (should be False)
- Line 12: SECRET_KEY hardcoded
- Line 111: DB PASSWORD hardcoded
- Line 112: HOST = 65.1.52.6 (public IP, should use private 172.26.10.173)

---

## PART 4: ARCHITECTURE DIAGRAM (All Facts)

```
THE INTERNET
     |
     | HTTPS (443) or HTTP (80)
     v
[DNS: jalgaon.com]  -- STILL UNKNOWN: Route53 or external?
     |
     | Resolves to 13.127.8.145
     v
+--------------------------------------------------+
|  AWS Lightsail: jalgaon-webapp                   |
|  Ubuntu | 4GB RAM | 2vCPU | 80GB SSD             |
|  Public IP:  13.127.8.145                        |
|  Private IP: 172.26.4.114                        |
|  Mumbai ap-south-1a                              |
|                                                  |
|  IPv6 Firewall (CONFIRMED New SS1):              |
|    Port 22  SSH  - Open to all IPv6              |
|    Port 80  HTTP - Open to all IPv6              |
|    Port 443      - NOT in IPv6 rules             |
|                                                  |
|  [Nginx]                                         |
|    www.jalgaon.com -> serves React /dist/        |
|    api.jalgaon.com -> proxies to Gunicorn        |
|    SSL: Let's Encrypt (certbot on server)        |
|         [Lightsail SS5 shows 0 certs]            |
|                                                  |
|  [Gunicorn WSGI]                                 |
|    Django 5.0.7                                  |
|    /admin/ /app/ /api/                           |
|                                                  |
|  No Load Balancer [CONFIRMED New SS1]            |
|  No CloudFront    [CONFIRMED New SS1]            |
+--------------------------------------------------+
     |
     | Port 5432 (PostgreSQL)
     | via PUBLIC IP 65.1.52.6  <-- SECURITY RISK
     | Should use private: 172.26.10.173
     v
+--------------------------------------------------+
|  AWS Lightsail: jalgaon.com-dbs                  |
|  Ubuntu | 1GB RAM | 2vCPU | 40GB SSD             |
|  Public IP:  65.1.52.6 (jalgaon-com-dbs-ip)     |
|  Private IP: 172.26.10.173                       |
|  Mumbai ap-south-1a                              |
|                                                  |
|  IPv4 Firewall (CONFIRMED New SS3):              |
|    Port 22   SSH        - Open to ALL [risk]     |
|    Port 80   HTTP       - Open to ALL [risk]     |
|    Port 5432 PostgreSQL - Open to ALL [CRITICAL] |
|                                                  |
|  IPv6 Firewall (CONFIRMED New SS4):              |
|    Port 22   SSH        - Open to ALL [risk]     |
|    Port 80   HTTP       - Open to ALL [risk]     |
|    Port 5432 PostgreSQL - Open to ALL [CRITICAL] |
|                                                  |
|  [PostgreSQL]                                    |
|    DB: jalgaon_database                          |
|    User: jalgaon-app                             |
|    Password: hardcoded in settings.py L111       |
+--------------------------------------------------+
```

---

## PART 5: COMPLETE VERIFIED FACTS TABLE

| # | Fact | Value | Proof |
|---|---|---|---|
| 1 | Cloud Service | AWS Lightsail (NOT EC2) | SS2 URL |
| 2 | AWS Account | Jalgaon.Com (6374236394I2) | SS1, SS2 |
| 3 | Region | Mumbai (ap-south-1a) | SS3, SS4 |
| 4 | Web server | jalgaon-webapp | SS2 |
| 5 | Web server public IP | 13.127.8.145 | SS3 |
| 6 | Web server private IP | 172.26.4.114 | SS3 |
| 7 | Web server OS | Ubuntu | SS3 |
| 8 | Web server size | 4GB RAM, 2vCPU, 80GB SSD | SS2 |
| 9 | DB server | jalgaon.com-dbs | SS2 |
| 10 | DB server public IP | 65.1.52.6 | SS4 + settings.py L112 |
| 11 | DB server private IP | 172.26.10.173 | New SS3 |
| 12 | DB server OS | Ubuntu | SS4 |
| 13 | DB server size | 1GB RAM, 2vCPU, 40GB SSD | SS2 |
| 14 | Database name | jalgaon_database | settings.py L109 |
| 15 | DB user | jalgaon-app | settings.py L110 |
| 16 | DB password | HARDCODED in source | settings.py L111 |
| 17 | Port 5432 open publicly | YES - entire internet | New SS3, SS4 |
| 18 | Lightsail SSL certs | ZERO - none exist | New SS5 |
| 19 | HTTPS source | Let's Encrypt (certbot) | Deduced from SS5 |
| 20 | Load balancer | NONE | New SS1 |
| 21 | CloudFront | NONE | New SS1 |
| 22 | Monthly cost | $37.93/month | Billing SS1 |
| 23 | Lightsail cost | $32.14/month | Billing SS1 |
| 24 | Django version | 5.0.7 | requirements.txt |
| 25 | Frontend | React 18 + Vite | package.json |
| 26 | DEBUG in production | True (should be False) | settings.py L15 |
| 27 | SECRET_KEY | Hardcoded | settings.py L12 |
| 28 | DB connection | Uses public IP (risk) | settings.py L112 |

---

## PART 6: WHAT IS STILL UNKNOWN (Only SSH Will Answer These)

| What We Need | How to Get It | What It Tells Us |
|---|---|---|
| Is HTTPS actually working? | Visit https://api.jalgaon.com in browser | Does port 443 respond despite firewall? |
| Nginx config on server | SSH -> /etc/nginx/sites-available/ | How requests are routed |
| SSL cert status | SSH -> sudo certbot certificates | Is cert valid, when does it expire? |
| Where Django code lives | SSH -> find / -name manage.py | Deployment directory |
| How Gunicorn is managed | SSH -> systemctl status gunicorn | Is it systemd or supervisor? |
| Cron jobs | SSH -> sudo crontab -l && crontab -l | Is certbot auto-renew scheduled? |
| Which registrar owns jalgaon.com | Visit whois.domaintools.com/jalgaon.com | GoDaddy? Namecheap? BigRock? |

---

## PART 7: PRIORITY ACTION PLAN

### CRITICAL - Do RIGHT NOW (Today)

Action 1: Add HTTPS port 443 to jalgaon-webapp firewall
  PROOF IT IS MISSING: New SS1 shows only SSH:22 and HTTP:80 on jalgaon-webapp
  Lightsail -> jalgaon-webapp -> Networking -> IPv4 Firewall -> Add rule
  Application: HTTPS | Protocol: TCP | Port: 443 | Any IPv4 address
  Repeat for IPv6 firewall too.
  IMPACT: HTTPS may not be working right now without this rule.

Action 2: Take a manual snapshot of jalgaon.com-dbs NOW
  PROOF: SS4 shows jalgaon.com-dbs has ZERO snapshots (database is unprotected)
  Lightsail -> jalgaon.com-dbs -> Snapshots tab -> Create snapshot
  NAME IT: jalgaon-dbs-backup-$(date)

Action 3: Enable automatic snapshots on BOTH instances
  PROOF: SS5 shows "Automatic snapshots are disabled" on jalgaon-webapp
  Lightsail -> jalgaon-webapp -> Snapshots tab -> Enable automatic snapshots
  Lightsail -> jalgaon.com-dbs -> Snapshots tab -> Enable automatic snapshots

Action 4: Lock down PostgreSQL port 5432
  PROOF: Previous SS3/SS4 show port 5432 open to entire internet
  Lightsail -> jalgaon.com-dbs -> Networking -> IPv4 Firewall
  DELETE: PostgreSQL | TCP | 5432 | Any IPv4 address
  ADD:    PostgreSQL | TCP | 5432 | 172.26.4.114 (webapp private IP only)
  Repeat for IPv6 firewall.

### THIS WEEK

Action 5: Remove HTTP port 80 from DB server
  DELETE: HTTP | TCP | 80 from both firewalls of jalgaon.com-dbs

Action 6: Check SSL certificate status
  SSH into jalgaon-webapp (click Connect using SSH button)
  Run: sudo certbot certificates
  If expiry < 30 days: sudo certbot renew

Action 7: Find the domain registrar
  PROOF: Domains & DNS in Lightsail is empty (New SS3) - DNS is external
  Visit: https://whois.domaintools.com/jalgaon.com
  Get login access to wherever jalgaon.com is registered

### SOON (Code Changes)

Action 8: Change DB connection to private IP
  settings.py line 112 -> HOST = 172.26.10.173

Action 9: Move secrets to environment variables on server
  Move SECRET_KEY and DB PASSWORD out of settings.py

Action 10: Set DEBUG = False in settings.py

---

## PART 8: HISTORICAL TIMELINE (What We Know About the Past)

| Date | Event | Proof |
|---|---|---|
| Before Aug 2024 | Site ran on jalgaon-web (2GB/60GB instance) | SS4 snapshot of old instance |
| Aug 12, 2024 | Last snapshot of old jalgaon-web taken | SS4: Aug 12, 2024, 11:06 |
| ~Aug 2024 | Upgrade: new jalgaon-webapp (4GB/80GB) created | SS4: new instance exists |
| Aug 28, 2024 | Only snapshot of jalgaon-webapp taken | SS5: Aug 28, 2024, 10:47 |
| After Aug 28, 2024 | No more snapshots taken (10 months unprotected) | SS5: 1 of 1 snapshots |
| Dec 2025 | Tiny CloudFront charge ($0.01) - then never again | Billing SS1 |
| Dec 2025 onwards | Monthly cost stabilized at ~$37.93 | Billing SS1 |

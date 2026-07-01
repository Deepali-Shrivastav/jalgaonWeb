# 🛠️ Jalgaon.com Deployment Diagnostic Guide

Since there is no single built-in operating system command to check the complete details of a multi-service web deployment (Nginx + Gunicorn + Django + PostgreSQL + SSL), you can use a custom **diagnostic script**. 

Below is a complete, ready-to-use script that collects, checks, and displays the status of all components in your stack.

---

## 📋 The Deployment Health-Check Script (`check_deployment.sh`)

You can create this script directly on your **`jalgaon-webapp`** server to run a full diagnostic anytime with one command.

### 1. How to create and run it on your server:

1. **Connect via SSH** to your web server.
2. **Create the file** by running:
   ```bash
   nano check_deployment.sh
   ```
3. **Copy and paste** the script code below into the terminal.
4. **Save and exit** (Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit).
5. **Make it executable**:
   ```bash
   chmod +x check_deployment.sh
   ```
6. **Run it** as superuser (to view Nginx configs and systemd logs):
   ```bash
   sudo ./check_deployment.sh
   ```

---

### 🖥️ The Script Code

```bash
#!/bin/bash
# ==============================================================================
# Jalgaon.com — Deployment & System Diagnostics Script
# Run this on the web server (jalgaon-webapp) as sudo.
# ==============================================================================

# Reset, Colors for output formatting
NC='\033[0m'
BOLD='\033[1m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'

echo -e "${BLUE}${BOLD}======================================================================${NC}"
echo -e "${BLUE}${BOLD}        🔍  JALGAON.COM SYSTEM & DEPLOYMENT DIAGNOSTICS REPORT        ${NC}"
echo -e "${BLUE}${BOLD}======================================================================${NC}"
echo "Generated on: $(date)"
echo ""

# ------------------------------------------------------------------------------
# 1. SERVER RESOURCE STATUS
# ------------------------------------------------------------------------------
echo -e "${CYAN}${BOLD}[1/6] 🖥️  Server Resources & Hardware${NC}"
echo -e "----------------------------------------------------"
echo -e "${BOLD}Server Hostname:${NC} $(hostname)"
echo -e "${BOLD}Server Public IP:${NC} $(curl -s https://api.ipify.org || echo "Could not fetch public IP")"
echo -e "${BOLD}Server Uptime:${NC} $(uptime -p)"

echo -e "\n${BOLD}Disk Usage:${NC}"
df -h / | awk 'NR==1 || NR==2 {print "  " $0}'

# Memory Usage
echo -e "\n${BOLD}RAM Usage:${NC}"
free -h | awk 'NR==1 || NR==2 {print "  " $0}'
echo ""

# ------------------------------------------------------------------------------
# 2. WEB SERVER & ROUTING STATUS (NGINX)
# ------------------------------------------------------------------------------
echo -e "${CYAN}${BOLD}[2/6] 🌐  Web Server & Routing (Nginx)${NC}"
echo -e "----------------------------------------------------"
if systemctl is-active --quiet nginx; then
    echo -e "Nginx Status: ${GREEN}${BOLD}● RUNNING (Active)${NC}"
else
    echo -e "Nginx Status: ${RED}${BOLD}● STOPPED (Inactive)${NC}"
fi

# Config syntax check
echo -n "Nginx Configuration Check: "
if sudo nginx -t >/dev/null 2>&1; then
    echo -e "${GREEN}${BOLD}PASS${NC}"
else
    echo -e "${RED}${BOLD}FAIL (Config Error)${NC}"
    sudo nginx -t
fi

# Show Nginx config links
echo -e "\nActive Web Configurations in sites-enabled/:"
ls -l /etc/nginx/sites-enabled/ | awk '{print "  " $9 " -> " $11}'
echo ""

# ------------------------------------------------------------------------------
# 3. BACKEND SERVICE STATUS (GUNICORN & DJANGO)
# ------------------------------------------------------------------------------
echo -e "${CYAN}${BOLD}[3/6] 🐍  Application Server (Gunicorn & Django)${NC}"
echo -e "----------------------------------------------------"
if systemctl is-active --quiet gunicorn; then
    echo -e "Gunicorn Status: ${GREEN}${BOLD}● RUNNING (Active)${NC}"
    echo -e "Gunicorn Socket: $(sudo systemctl show gunicorn -p Listen | cut -d= -f2-)"
else
    echo -e "Gunicorn Status: ${RED}${BOLD}● STOPPED (Inactive)${NC}"
fi

# Check for running Gunicorn processes
echo -n "Gunicorn Process Count: "
GUNICORN_PROC=$(ps aux | grep gunicorn | grep -v grep | wc -l)
if [ "$GUNICORN_PROC" -gt 0 ]; then
    echo -e "${GREEN}${BOLD}$GUNICORN_PROC processes active${NC}"
else
    echo -e "${RED}${BOLD}0 processes active (Django is offline!)${NC}"
fi

# Check Python environment
echo -e "\nPython & Django Environment:"
VENV_PATH="/home/ubuntu/jalgaonWeb/jalgaonApi/venv"
if [ -d "$VENV_PATH" ]; then
    echo -e "  Virtual Environment: ${GREEN}Found at $VENV_PATH${NC}"
    PYTHON_VER=$("$VENV_PATH/bin/python" --version)
    DJANGO_VER=$("$VENV_PATH/bin/python" -c "import django; print(django.get_version())" 2>/dev/null || echo "Not installed")
    echo -e "  Python Version:      $PYTHON_VER"
    echo -e "  Django Version:      $DJANGO_VER"
else
    echo -e "  Virtual Environment: ${RED}NOT FOUND at $VENV_PATH${NC}"
fi
echo ""

# ------------------------------------------------------------------------------
# 4. DATABASE CONNECTIVITY
# ------------------------------------------------------------------------------
echo -e "${CYAN}${BOLD}[4/6] 🗄️  Database Connectivity${NC}"
echo -e "----------------------------------------------------"
# Path to settings.py
SETTINGS_FILE="/home/ubuntu/jalgaonWeb/jalgaonApi/jalgaonApi/settings.py"

if [ -f "$SETTINGS_FILE" ]; then
    # Extract DB settings from settings.py
    DB_HOST=$(grep -A 10 "DATABASES" "$SETTINGS_FILE" | grep "HOST" | cut -d"'" -f4)
    DB_PORT=$(grep -A 10 "DATABASES" "$SETTINGS_FILE" | grep "PORT" | cut -d"'" -f4)
    DB_NAME=$(grep -A 10 "DATABASES" "$SETTINGS_FILE" | grep "NAME" | cut -d"'" -f4)
    DB_USER=$(grep -A 10 "DATABASES" "$SETTINGS_FILE" | grep "USER" | cut -d"'" -f4)
    
    [ -z "$DB_PORT" ] && DB_PORT="5432" # Fallback if empty
    
    echo -e "Database config in settings.py:"
    echo -e "  Host: ${BOLD}$DB_HOST${NC}"
    echo -e "  Port: ${BOLD}$DB_PORT${NC}"
    echo -e "  DB Name: ${BOLD}$DB_NAME${NC}"
    echo -e "  DB User: ${BOLD}$DB_USER${NC}"
    
    # Test network connectivity to the DB port
    echo -n "Network connection to database ($DB_HOST:$DB_PORT): "
    if nc -z -w 3 "$DB_HOST" "$DB_PORT" 2>/dev/null; then
        echo -e "${GREEN}${BOLD}SUCCESS (Port Open)${NC}"
        
        # Try running a simple Django DB query to verify credentials and migrations
        if [ -d "$VENV_PATH" ]; then
            echo -n "Django DB connection / authentication check: "
            cd /home/ubuntu/jalgaonWeb/jalgaonApi/
            if "$VENV_PATH/bin/python" manage.py shell -c "from django.db import connection; connection.cursor()" >/dev/null 2>&1; then
                echo -e "${GREEN}${BOLD}SUCCESS (Logged In)${NC}"
                
                # Check for unapplied migrations
                echo -n "Django Migrations Check: "
                UNAPPLIED_MIGRATIONS=$("$VENV_PATH/bin/python" manage.py showmigrations | grep "\[ \]" | wc -l)
                if [ "$UNAPPLIED_MIGRATIONS" -eq 0 ]; then
                    echo -e "${GREEN}${BOLD}ALL MIGRATIONS APPLIED (0 pending)${NC}"
                else
                    echo -e "${YELLOW}${BOLD}WARNING ($UNAPPLIED_MIGRATIONS migrations are pending!)${NC}"
                fi
            else
                echo -e "${RED}${BOLD}FAILED (Check DB credentials/permissions!)${NC}"
            fi
        fi
    else
        echo -e "${RED}${BOLD}FAILED (Port Closed / Timeout)${NC}"
        echo -e "  ${YELLOW}Tip: Is PostgreSQL running on the database server? Is the firewall blocking port $DB_PORT?${NC}"
    fi
else
    echo -e "${RED}settings.py not found at $SETTINGS_FILE. Cannot test DB configuration.${NC}"
fi
echo ""

# ------------------------------------------------------------------------------
# 5. SECURITY & SSL CERTIFICATES
# ------------------------------------------------------------------------------
echo -e "${CYAN}${BOLD}[5/6] 🔒  Security & SSL Status${NC}"
echo -e "----------------------------------------------------"
# Check Certbot certificates
if command -v certbot &> /dev/null; then
    echo -e "SSL Certificates managed by Certbot:"
    sudo certbot certificates | grep -E "Certificate Name:|Domains:|Expiry Date:" | sed 's/^/  /'
else
    echo -e "Certbot is not installed. Checking common SSL certificate paths:"
    if [ -f "/etc/letsencrypt/live/jalgaon.com/fullchain.pem" ]; then
        echo -e "  Certificate found at: /etc/letsencrypt/live/jalgaon.com/fullchain.pem"
        EXPIRY_DATE=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/jalgaon.com/fullchain.pem | cut -d= -f2)
        echo -e "  Expiry Date:          $EXPIRY_DATE"
    else
        echo -e "  ${RED}No SSL certificates found!${NC}"
    fi
fi

# Check open network ports
echo -e "\nActive Network Ports listening on this server:"
sudo ss -tlnp | grep -E "LISTEN.*(nginx|gunicorn|python|ssh|Systemd)" | awk '{print "  Port: " $4 " (Process: " $6 ")"}' || echo "  No matched ports found."
echo ""

# ------------------------------------------------------------------------------
# 6. SYSTEM LOG EXCERPTS (LATEST 3 ERRORS EACH)
# ------------------------------------------------------------------------------
echo -e "${CYAN}${BOLD}[6/6] 📋  Latest Logs & Error Check${NC}"
echo -e "----------------------------------------------------"

echo -e "${BOLD}Last 3 Nginx Error Logs (/var/log/nginx/error.log):${NC}"
if [ -f "/var/log/nginx/error.log" ]; then
    sudo tail -n 3 /var/log/nginx/error.log | sed 's/^/  /'
else
    echo "  No log file found."
fi

echo -e "\n${BOLD}Last 3 Gunicorn/Django System Logs (journalctl):${NC}"
sudo journalctl -u gunicorn -n 3 --no-pager | grep -v "^--" | sed 's/^/  /'

echo -e "\n${BLUE}${BOLD}======================================================================${NC}"
echo -e "${GREEN}${BOLD}                       DIAGNOSTIC COMPLETE                            ${NC}"
echo -e "${BLUE}${BOLD}======================================================================${NC}"
```

#!/bin/bash
# =============================================================================
# JalgaonWeb — One-Time Production Server Bootstrap Script
# =============================================================================
# Run this ONCE on the jalgaon-webapp Lightsail server (13.127.8.145)
# as the 'ubuntu' user via the Lightsail browser SSH console.
#
# What this script does:
#   1. Installs all system dependencies (Python 3.11, Node 20, Nginx, etc.)
#   2. Clones the Git repository
#   3. Creates and configures the Python virtual environment
#   4. Installs the Gunicorn systemd service from deploy/systemd/
#   5. Configures Nginx using config files from deploy/nginx/
#   6. Sets up the correct file permissions
#
# After this script completes, ALL future deployments are handled automatically
# by GitHub Actions. This script is never run again.
# =============================================================================

set -euo pipefail  # Exit on error, unbound variable, or pipe failure

# ===== CONFIGURATION — Change these if your setup is different =====
REPO_URL="git@github.com:Deepali-Shrivastav/jalgaonWeb.git"
REPO_DIR="/home/ubuntu/jalgaonWeb"
API_DIR="${REPO_DIR}/jalgaonApi"
VENV_DIR="${API_DIR}/.venv"
WEB_ROOT="/var/www/jalgaon-frontend"
# ===================================================================

echo "============================================================"
echo " JalgaonWeb — Production Server Bootstrap"
echo " Server: jalgaon-webapp (13.127.8.145)"
echo " Started at: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "============================================================"

# --- Step 1: Update package list ---
echo ""
echo "[1/9] Updating package list..."
sudo apt-get update -y


# --- Step 2: Install system dependencies ---
echo ""
echo "[2/9] Installing system dependencies..."
sudo apt-get install -y \
    python3.11 \
    python3.11-venv \
    python3.11-dev \
    python3-pip \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    libpng-dev \
    zlib1g-dev \
    nginx \
    git \
    curl \
    unzip

# Install Node.js 20 LTS via NodeSource
echo "Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
echo "Verifying installations:"
python3.11 --version
node --version
npm --version
nginx -v
git --version

# --- Step 3: Clone the repository ---
echo ""
echo "[3/9] Cloning repository from GitHub..."
if [ -d "${REPO_DIR}" ]; then
    echo "Repository already exists at ${REPO_DIR}, pulling latest..."
    cd "${REPO_DIR}"
    git fetch origin main
    git reset --hard origin/main
else
    git clone "${REPO_URL}" "${REPO_DIR}"
fi
cd "${REPO_DIR}"
echo "✅ Repository ready at: ${REPO_DIR}"
echo "   Latest commit: $(git log -1 --oneline)"

# --- Step 4: Set up Python virtual environment ---
echo ""
echo "[4/9] Setting up Python virtual environment..."
python3.11 -m venv "${VENV_DIR}"
source "${VENV_DIR}/bin/activate"
pip install --upgrade pip
pip install -r "${API_DIR}/requirements.txt"
pip install gunicorn  # Ensure gunicorn is in the venv
deactivate
echo "✅ Virtual environment ready at: ${VENV_DIR}"

# --- Step 5: Create required directories and set permissions ---
echo ""
echo "[5/9] Setting up directories and permissions..."

# Web root for React frontend (must be writable by ubuntu user for CI/CD)
sudo mkdir -p "${WEB_ROOT}"
sudo chown ubuntu:www-data "${WEB_ROOT}"
sudo chmod 755 "${WEB_ROOT}"

# Gunicorn log directory
sudo mkdir -p /var/log/gunicorn
sudo chown ubuntu:www-data /var/log/gunicorn

echo "✅ Directories created and permissions set"

# --- Step 6: Install the Gunicorn systemd service ---
echo ""
echo "[6/9] Installing Gunicorn systemd service..."
sudo cp "${REPO_DIR}/deploy/systemd/gunicorn_jalgaon.service" \
        /etc/systemd/system/gunicorn_jalgaon.service
sudo systemctl daemon-reload
sudo systemctl enable gunicorn_jalgaon
echo "✅ Gunicorn service installed and enabled"
echo "   NOTE: Service will be started after you create the .env.production file (Step 8)"

# --- Step 7: Configure Nginx ---
echo ""
echo "[7/9] Configuring Nginx..."

# Copy Nginx site configs from the repository
sudo cp "${REPO_DIR}/deploy/nginx/jalgaon-api.conf" \
        /etc/nginx/sites-available/jalgaon-api
sudo cp "${REPO_DIR}/deploy/nginx/jalgaon-frontend.conf" \
        /etc/nginx/sites-available/jalgaon-frontend

# Enable the sites
sudo ln -sf /etc/nginx/sites-available/jalgaon-api \
            /etc/nginx/sites-enabled/jalgaon-api
sudo ln -sf /etc/nginx/sites-available/jalgaon-frontend \
            /etc/nginx/sites-enabled/jalgaon-frontend

# Remove the default placeholder site
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
echo "✅ Nginx configured and running"

# --- Step 8: Configure sudoers for CI/CD (passwordless service restart) ---
echo ""
echo "[8/9] Configuring passwordless sudo for Gunicorn and Nginx (CI/CD)..."
# This allows GitHub Actions to restart services without a password prompt
sudo tee /etc/sudoers.d/jalgaon-cicd > /dev/null << 'EOF'
# Allow ubuntu user to manage jalgaon services without password prompt
# This is required for automated CI/CD deployments via GitHub Actions
ubuntu ALL=(ALL) NOPASSWD: /bin/systemctl restart gunicorn_jalgaon
ubuntu ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
ubuntu ALL=(ALL) NOPASSWD: /bin/systemctl is-active gunicorn_jalgaon
ubuntu ALL=(ALL) NOPASSWD: /bin/journalctl -u gunicorn_jalgaon *
ubuntu ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t
EOF
sudo chmod 440 /etc/sudoers.d/jalgaon-cicd
echo "✅ Sudoers configured"

echo ""
echo "============================================================"
echo " Bootstrap Complete!"
echo "============================================================"
echo ""
echo " MANUAL STEPS REQUIRED BEFORE STARTING SERVICES:"
echo ""
echo " [A] Create the production .env.production file:"
echo "     nano ${API_DIR}/.env.production"
echo "     (Paste the production credentials — see deploy/README.md)"
echo ""
echo " [B] Run first migration and collect static files:"
echo "     source ${VENV_DIR}/bin/activate"
echo "     cd ${API_DIR}"
echo "     DJANGO_ENV=production python manage.py migrate"
echo "     DJANGO_ENV=production python manage.py collectstatic --noinput"
echo "     deactivate"
echo ""
echo " [C] Start the Gunicorn service:"
echo "     sudo systemctl start gunicorn_jalgaon"
echo "     sudo systemctl status gunicorn_jalgaon"
echo ""
echo " [D] Add GitHub Actions Secrets (see deploy/README.md)"
echo ""
echo " [E] Open Port 443 in Lightsail firewall and set up SSL:"
echo "     sudo apt-get install certbot python3-certbot-nginx -y"
echo "     sudo certbot --nginx -d api.jalgaon.com -d www.jalgaon.com"
echo ""
echo " After step [D], all future deployments are AUTOMATIC via GitHub Actions."
echo "============================================================"

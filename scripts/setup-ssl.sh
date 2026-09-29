#!/bin/bash
# Run on the Ubuntu server as root (after app + HTTP nginx are working):
#   bash scripts/setup-ssl.sh
set -euo pipefail

DOMAIN="ksa.aigamopedia.com"
APP_DIR="${APP_DIR:-/var/www/vaszeen/ksa.aigamopedia.com}"
EMAIL="${CERTBOT_EMAIL:-}"
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"

echo "==> Setting up SSL for ${DOMAIN}"

if ! command -v certbot >/dev/null 2>&1; then
  apt-get update
  apt-get install -y certbot python3-certbot-nginx
fi

mkdir -p /var/www/html

echo "==> Installing HTTP Nginx config (for ACME + app)..."
cp "${APP_DIR}/scripts/nginx-ksa.aigamopedia.com.conf" "/etc/nginx/sites-available/${DOMAIN}"
ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
nginx -t
systemctl reload nginx

echo "==> Checking DNS..."
SERVER_IP="$(curl -4 -s ifconfig.me || curl -4 -s icanhazip.com || true)"
DNS_IP="$(dig +short "${DOMAIN}" A | tail -1)"
echo "    Server public IP: ${SERVER_IP:-unknown}"
echo "    ${DOMAIN} DNS A record: ${DNS_IP:-not found}"

if [ -n "${SERVER_IP}" ] && [ -n "${DNS_IP}" ] && [ "${SERVER_IP}" != "${DNS_IP}" ]; then
  echo "WARNING: DNS may not point to this server yet. Certbot can fail."
fi

CERTBOT_ARGS=(certonly --webroot -w /var/www/html -d "${DOMAIN}" --non-interactive --agree-tos)
if [ -n "${EMAIL}" ]; then
  CERTBOT_ARGS+=(--email "${EMAIL}")
else
  CERTBOT_ARGS+=(--register-unsafely-without-email)
fi

if [ ! -f "${CERT_PATH}" ]; then
  echo "==> Requesting Let's Encrypt certificate..."
  certbot "${CERTBOT_ARGS[@]}"
else
  echo "==> Certificate already exists, renewing if needed..."
  certbot renew --quiet || true
fi

echo "==> Enabling HTTPS via certbot nginx plugin..."
certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos \
  ${EMAIL:+--email "$EMAIL"} \
  ${EMAIL:---register-unsafely-without-email} || true

nginx -t
systemctl reload nginx

echo ""
echo "OK: https://${DOMAIN}/"
curl -sI "https://${DOMAIN}/" | head -5

#!/bin/bash
# Run on the production server (as root), after uploading files via FileZilla:
#   bash scripts/deploy-server.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/vaszeen/ksa.aigamopedia.com}"
APP_NAME="ksa-aigamopedia"
PORT=5055

echo "==> Deploying AiGamopedia KSA to ${APP_DIR}"

cd "$APP_DIR"

npm ci --omit=dev 2>/dev/null || npm install --production

pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

sleep 2
curl -sf "http://127.0.0.1:${PORT}/" > /dev/null \
  || (pm2 logs "$APP_NAME" --lines 30 --nostream && exit 1)

echo "OK: http://127.0.0.1:${PORT}/"
echo "Public: https://ksa.aigamopedia.com/"
echo ""
echo "SSL not configured yet? Run:"
echo "  bash scripts/setup-ssl.sh"

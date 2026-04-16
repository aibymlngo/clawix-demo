#!/usr/bin/env bash
# Sets up local trusted HTTPS certs for Safari PWA support.
# Run once on your Mac before starting docker compose.
set -e

echo "→ Checking mkcert..."
if ! command -v mkcert &>/dev/null; then
  echo "  mkcert not found. Installing via Homebrew..."
  if ! command -v brew &>/dev/null; then
    echo "  ERROR: Homebrew not found. Install it first: https://brew.sh"
    exit 1
  fi
  brew install mkcert
fi

echo "→ Installing mkcert root CA (you may be prompted for your Mac password)..."
mkcert -install

echo "→ Generating certs for localhost..."
mkdir -p "$(dirname "$0")/../infra/certs"
mkcert \
  -cert-file "$(dirname "$0")/../infra/certs/localhost.pem" \
  -key-file  "$(dirname "$0")/../infra/certs/localhost-key.pem" \
  localhost 127.0.0.1

echo ""
echo "✓ Done! Certs saved to infra/certs/"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env and fill in values"
echo "  2. docker compose -f docker-compose.dev.yml up"
echo "  3. Open Safari → https://localhost:3443"
echo "  4. Safari menu → File → Add to Dock"

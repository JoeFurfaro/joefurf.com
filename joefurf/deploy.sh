#!/bin/bash

# Simple deployment script for Fly.io
# Usage: Run from repo root: ./joefurf/deploy.sh
#        Or from joefurf dir: ./deploy.sh

set -e  # Exit on any error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the script directory
cd "$SCRIPT_DIR"

echo "🚀 Deploying to Fly.io..."
echo "📁 Working directory: $(pwd)"

flyctl deploy --remote-only

echo ""
echo "✅ Deployment successful!"
echo "🌐 Visit: https://joefurf.fly.dev"
echo "🌐 Custom domain: https://joefurf.com"

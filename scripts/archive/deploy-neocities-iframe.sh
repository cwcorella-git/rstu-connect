#!/bin/bash
# Deploy iframe wrapper to Neocities
# This replaces the Neocities site with a simple iframe that embeds GitHub Pages

set -e

echo "🚀 Deploying iframe wrapper to Neocities..."

# Check if neocities CLI is installed
if ! command -v neocities &> /dev/null; then
    echo "❌ Error: neocities CLI not found"
    echo "Install it with: gem install neocities"
    exit 1
fi

# Deploy the iframe HTML as index.html
echo "📤 Uploading index.html..."
neocities upload neocities-iframe.html -d index.html

echo "✅ Deployment complete!"
echo "🌐 Site: https://rstu-connect.neocities.org"
echo ""
echo "The Neocities URL now shows your GitHub Pages app via iframe."

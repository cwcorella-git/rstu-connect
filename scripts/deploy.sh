#!/bin/bash

# RSTU Connect Deployment Script
# Builds Next.js app and copies static files to root for Neocities deployment

set -e  # Exit on error

echo "🏗️  Building Next.js application..."
npm run build

echo "📦 Copying static files to root directory..."

# Remove old static files (but keep source code and data)
rm -rf index.html _next 404 about assets get-started help join properties resources toolkit

# Copy new build output to root
cp -r out/* ./

echo "✅ Deployment build complete!"
echo ""
echo "Files ready for Neocities deployment:"
ls -lh index.html 2>/dev/null || echo "⚠️  index.html not found"
ls -d _next 2>/dev/null || echo "⚠️  _next directory not found"
echo ""
echo "Next steps:"
echo "1. Test locally: open index.html in browser"
echo "2. Commit: git add . && git commit -m 'Deploy Next.js build'"
echo "3. Push: git push origin main"
echo "4. Neocities will auto-deploy via GitHub Actions"

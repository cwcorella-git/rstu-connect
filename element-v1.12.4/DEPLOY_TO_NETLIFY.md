# Deploy Element Web to Netlify - Quick Guide

This Element Web instance is pre-configured with the necessary headers and configuration to embed in the RSTU Connect dashboard.

## Configuration Already Applied ✓

- **`_headers`** - Allows iframe embedding from rstu-connect.neocities.org
- **`config.json`** - Points to matrix.org homeserver with RSTU settings

## Deploy to Netlify (GitHub Method - RECOMMENDED)

### Step 1: Create a New GitHub Repository

1. Go to https://github.com/new
2. Name it: `rstu-element` (or any name you prefer)
3. Keep it **Public** (free hosting)
4. **Do NOT** initialize with README
5. Click "Create repository"

### Step 2: Push Element Web to GitHub

```bash
# Navigate to the element directory
cd element-v1.12.4

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial Element Web deployment for RSTU Connect"

# Add your GitHub repo as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/rstu-element.git

# Push to GitHub
git push -u origin main
```

### Step 3: Deploy to Netlify

1. Go to https://app.netlify.com/
2. Click **"Sign up"** or **"Log in"**
3. Choose **"Continue with GitHub"** (IMPORTANT - this makes updates easier!)
4. Authorize Netlify to access your GitHub account
5. Click **"Add new site"** → **"Import an existing project"**
6. Click **"Deploy with GitHub"**
7. Select your **`rstu-element`** repository
8. Leave all settings as default:
   - Build command: (leave empty)
   - Publish directory: (leave empty, should default to root `/`)
9. Click **"Deploy site"**

### Step 4: Wait for Deployment (1-2 minutes)

Netlify will:
- Clone your GitHub repo
- Deploy the static files
- Generate a URL like: `https://sparkly-unicorn-abc123.netlify.app`

### Step 5: Get Your Netlify URL

Once deployed, you'll see:
```
Site is live ✓
https://YOUR-SITE-NAME.netlify.app
```

**Copy this URL!** You'll need it for the next step.

### Step 6: Optional - Customize Site Name

1. In Netlify dashboard, click **"Site settings"**
2. Click **"Change site name"**
3. Enter: `rstu-element` (or your preferred name)
4. Your URL becomes: `https://rstu-element.netlify.app`

---

## Next Step: Update RSTU Connect

After deploying, you need to update the RSTU Connect site to use your Netlify URL:

1. Open `rstu-connect/src/components/MatrixChatEmbed.tsx`
2. Find line 12:
   ```typescript
   const ELEMENT_URL = 'https://app.element.io'; // ⚠️ This will NOT work!
   ```
3. Replace with your Netlify URL:
   ```typescript
   const ELEMENT_URL = 'https://rstu-element.netlify.app';
   ```
4. Save the file
5. Build and deploy RSTU Connect:
   ```bash
   cd /home/user/Projects/rstu-connect
   npm run build
   git add .
   git commit -m "Update Element URL to Netlify instance"
   git push origin main
   ```

---

## Troubleshooting

**Problem:** Netlify shows 404 or blank page
- **Solution:** Make sure "Publish directory" is set to `/` (root) in Site settings → Build & deploy

**Problem:** Chat still won't embed
- **Solution:** Verify `_headers` file is present (check in Netlify file browser)
- **Solution:** Clear browser cache and hard refresh (Ctrl+Shift+R)

**Problem:** "Configure headers" message appears
- **Solution:** The `_headers` file must be in the root directory with no file extension

---

## Verify It's Working

1. Visit your Netlify URL: `https://YOUR-SITE-NAME.netlify.app`
2. You should see Element Web login page
3. Check headers are working:
   ```bash
   curl -I https://YOUR-SITE-NAME.netlify.app | grep -i frame
   ```
   Should show:
   ```
   X-Frame-Options: ALLOW-FROM https://rstu-connect.neocities.org
   ```

---

## Future Updates

When Element Web releases a new version:
1. Download the new release
2. Copy `_headers` and `config.json` into it
3. Push to GitHub
4. Netlify automatically deploys the update!

**Questions?** Check the main setup guide: `docs/NETLIFY_ELEMENT_SETUP.md`

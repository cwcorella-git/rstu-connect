# Deploy Element Web to Netlify for RSTU Connect

This guide walks you through deploying your own Element Web instance to Netlify, which will allow iframe embedding in the RSTU Connect dashboard.

## Why This is Needed

The hosted `app.element.io` blocks iframe embedding with security headers. By hosting our own Element instance on Netlify, we can configure it to allow embedding from `rstu-connect.neocities.org`.

## Setup Steps (15-20 minutes)

### Step 1: Download Element Web

1. Go to [Element Web Releases](https://github.com/element-hq/element-web/releases)
2. Download the latest version (v1.11.83 or newer)
3. Look for the file named `element-v1.11.83.tar.gz`
4. Extract the archive to a folder (e.g., `element-web/`)

### Step 2: Configure Element

Inside the extracted folder, create or edit `config.json`:

```json
{
  "default_server_config": {
    "m.homeserver": {
      "base_url": "https://matrix.org",
      "server_name": "matrix.org"
    }
  },
  "brand": "Element",
  "integrations_ui_url": "https://scalar.vector.im/",
  "integrations_rest_url": "https://scalar.vector.im/api",
  "integrations_widgets_urls": [
    "https://scalar.vector.im/_matrix/integrations/v1",
    "https://scalar.vector.im/api",
    "https://scalar-staging.vector.im/_matrix/integrations/v1",
    "https://scalar-staging.vector.im/api",
    "https://scalar-staging.riot.im/scalar/api"
  ],
  "bug_report_endpoint_url": "https://element.io/bugreports/submit",
  "showLabsSettings": false,
  "roomDirectory": {
    "servers": ["matrix.org"]
  },
  "enable_presence_by_hs_url": {
    "https://matrix.org": false
  }
}
```

**Key settings:**
- `m.homeserver.base_url`: Points to matrix.org (where your rooms are hosted)
- `m.homeserver.server_name`: The Matrix homeserver name

### Step 3: Create Netlify Headers Configuration

In the same folder, create a file named `_headers`:

```
/*
  X-Frame-Options: ALLOW-FROM https://rstu-connect.neocities.org
  Content-Security-Policy: frame-ancestors 'self' https://rstu-connect.neocities.org https://*.neocities.org
```

This tells browsers to allow embedding from your Neocities site.

### Step 4: Deploy to Netlify

#### Option A: Drag & Drop (Easiest)

1. Go to [Netlify](https://app.netlify.com/)
2. Sign up or log in (free account)
3. Click "Add new site" → "Deploy manually"
4. Drag the entire `element-web` folder into the upload area
5. Wait for deployment to complete (~1 minute)
6. You'll get a URL like `https://random-name-12345.netlify.app`

#### Option B: Git Deployment (Better for updates)

1. Create a new GitHub repository called `rstu-element`
2. Upload the element-web folder contents
3. In Netlify: "Add new site" → "Import from Git"
4. Connect to GitHub and select your repository
5. Deploy settings:
   - Build command: (leave blank, it's pre-built)
   - Publish directory: `.` (root directory)
6. Click "Deploy site"

### Step 5: Customize Your Netlify URL (Optional)

1. In Netlify dashboard, go to "Site settings" → "Site details"
2. Click "Change site name"
3. Choose something like `rstu-element` or `reno-tenants-chat`
4. Your URL becomes `https://rstu-element.netlify.app`

### Step 6: Test Your Element Instance

1. Visit your Netlify URL (e.g., `https://rstu-element.netlify.app`)
2. You should see the Element login page
3. Try logging in or creating an account
4. Verify it connects to Matrix.org

### Step 7: Test Iframe Embedding

Create a test HTML file on your computer:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Iframe Test</title>
</head>
<body>
  <h1>Testing Element Embed</h1>
  <iframe
    src="https://rstu-element.netlify.app/#/room/%232500-e-2nd-st%3Amatrix.org"
    width="800"
    height="600"
    frameborder="0"
  ></iframe>
</body>
</html>
```

Open it in your browser. If you see the Element interface (not a security error), it worked!

### Step 8: Update RSTU Connect Code

Now update your Next.js site to use the Netlify URL:

**File:** `src/components/MatrixChatEmbed.tsx`

Change:
```typescript
const embedUrl = `https://app.element.io/#/room/${encodedAlias}?embed=1`;
```

To:
```typescript
const embedUrl = `https://rstu-element.netlify.app/#/room/${encodedAlias}`;
```

**Important:** Replace `rstu-element.netlify.app` with YOUR actual Netlify URL.

### Step 9: Rebuild and Deploy RSTU Connect

```bash
cd /home/user/Projects/rstu-connect
npm run build
git add .
git commit -m "Update Matrix chat to use Netlify Element instance"
git push origin main
```

Wait for GitHub Actions to deploy to Neocities (~2 minutes).

### Step 10: Verify It Works

1. Visit https://rstu-connect.neocities.org/
2. Click on a building in the left panel
3. The Matrix chat should load in the right panel
4. No "Firefox Can't Open This Page" error!

## Troubleshooting

### Element loads but shows "Can't connect to homeserver"
**Solution:** Check your `config.json` has the correct `base_url` for matrix.org

### Still getting iframe blocking error
**Solution:** Verify the `_headers` file is in the root of your Netlify deployment and has the correct Neocities URL

### Element loads but rooms don't appear
**Solution:** Make sure you're logged in with the same Matrix account that created the rooms (@cwcorella:matrix.org)

### Netlify deployment fails
**Solution:** Make sure you're deploying the extracted element-web folder, not the .tar.gz archive

## Maintenance

**Updating Element:**
1. Download new Element Web release
2. Extract and replace files in your GitHub repo (or re-drag to Netlify)
3. Preserve your custom `config.json` and `_headers` files
4. Redeploy

**Monitoring:**
- Netlify free tier: 100GB bandwidth/month (plenty for RSTU use)
- Check Netlify dashboard for usage stats
- Element updates released monthly - update quarterly is fine

## Cost

**$0/month** - Netlify free tier includes:
- 100GB bandwidth
- 300 build minutes (not needed for pre-built Element)
- Automatic HTTPS
- Custom domain (optional)

## Security Notes

- Element instance is public (anyone can access the URL)
- Matrix rooms are still private/invite-only as configured
- Your `_headers` file allows embedding from your Neocities domain
- Keep your Matrix account credentials secure

## Next Steps

Once working, you can:
- Add custom branding to Element (edit config.json)
- Use a custom domain (e.g., chat.renotenants.org)
- Set up automated Element updates via GitHub Actions

---

**Last Updated:** November 2025
**Element Version:** v1.11.83
**Netlify Platform:** Free tier

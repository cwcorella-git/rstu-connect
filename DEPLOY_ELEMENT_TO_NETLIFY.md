# Deploy Element Web to Netlify - Clear Instructions

## Understanding the Architecture

You need **TWO separate sites** that work together:

### Site 1: RSTU Connect Dashboard
- **URL:** `https://rstu-connect.neocities.org/`
- **What:** Your Next.js dashboard (building list + iframe)
- **Hosted on:** Neocities
- **Repository:** `rstu-connect` (this repo)
- **Status:** ✓ Already live and working

### Site 2: Element Web Chat
- **URL:** `https://??????.netlify.app` (you choose)
- **What:** The Matrix/Element chat application
- **Hosted on:** Netlify
- **Repository:** Also in `rstu-connect` (in the `element-v1.12.4` folder)
- **Status:** ✗ Needs deployment

### How They Work Together:
The Neocities site (Site 1) has an `<iframe>` that embeds the Netlify site (Site 2).

```
Neocities Dashboard → <iframe> → Netlify Element Web
```

**Why two sites?**
- Neocities doesn't support custom HTTP headers
- Element needs special headers to allow iframe embedding
- Netlify supports headers via `_headers` file

---

## Step-by-Step Deployment

### Step 1: Commit Element to GitHub

```bash
cd /home/user/Projects/rstu-connect

# Add the Element folder
git add element-v1.12.4/

# Commit
git commit -m "Add Element Web v1.12.4 for Netlify deployment"

# Push to GitHub
git push origin main
```

### Step 2: Login to Netlify

1. Go to https://app.netlify.com/
2. Click **"Log in"**
3. Choose **"Continue with GitHub"** (you already gave permissions)
4. You'll see your dashboard

### Step 3: Create a New Site from the Same Repo

1. Click **"Add new site"** → **"Import an existing project"**
2. Click **"Deploy with GitHub"**
3. Select your **`rstu-connect`** repository (the same one!)
4. **IMPORTANT CONFIGURATION:**
   - **Base directory:** `element-v1.12.4`
   - **Build command:** (leave empty)
   - **Publish directory:** `element-v1.12.4`
5. Click **"Deploy site"**

### Step 4: Wait for Deployment

Netlify will deploy in 30-60 seconds. You'll see:
```
✓ Site is live
https://random-name-123456.netlify.app
```

### Step 5: Customize Your Site Name (Optional)

1. Click **"Site settings"**
2. Click **"Change site name"**
3. Enter: `rstu-element` (or any name you want)
4. Your URL becomes: `https://rstu-element.netlify.app`

### Step 6: Verify Headers Are Working

Check that iframe embedding is allowed:

```bash
curl -I https://rstu-element.netlify.app | grep -i frame
```

You should see:
```
X-Frame-Options: ALLOW-FROM https://rstu-connect.neocities.org
Content-Security-Policy: frame-ancestors 'self' https://rstu-connect.neocities.org
```

If you see these headers, **it's working!** ✓

---

## Step 7: Update RSTU Connect to Use Your Netlify URL

Now that Element is deployed, update the dashboard to use it:

### Edit the Chat Component:

Open `src/components/MatrixChatEmbed.tsx` and change line 12:

**Before:**
```typescript
const ELEMENT_URL = 'https://app.element.io'; // ⚠️ This will NOT work!
```

**After (use YOUR Netlify URL):**
```typescript
const ELEMENT_URL = 'https://rstu-element.netlify.app'; // ✓ Your Netlify instance
```

### Rebuild and Deploy:

```bash
# Build the updated Next.js site
npm run build

# Commit the change
git add src/components/MatrixChatEmbed.tsx
git commit -m "Update Element URL to Netlify instance"

# Push to GitHub (triggers Neocities deployment)
git push origin main
```

### Wait for GitHub Actions:

Your GitHub Actions workflow will automatically:
1. Build the Next.js site
2. Deploy to Neocities
3. Site updates in 1-2 minutes

---

## Step 8: Test the Live Site

1. Visit `https://rstu-connect.neocities.org/`
2. Click on a building
3. The chat should now load in the right panel (no more Firefox error!)

---

## Troubleshooting

### Problem: Netlify shows 404 error

**Solution:** Check your deployment settings:
- Base directory should be: `element-v1.12.4`
- Publish directory should be: `element-v1.12.4`

### Problem: Chat iframe still shows "Firefox can't open this page"

**Solutions:**
1. Verify your Netlify URL is correct in `MatrixChatEmbed.tsx`
2. Clear browser cache (Ctrl+Shift+R)
3. Check headers with: `curl -I https://your-site.netlify.app | grep frame`

### Problem: Headers not appearing

**Solution:**
- Make sure `_headers` file exists in `element-v1.12.4/` folder
- File must be named `_headers` with NO file extension
- Check in Netlify UI: Deploys → (latest deploy) → Deploy log

---

## Summary of URLs

After deployment, you'll have:

| Site | URL | Purpose |
|------|-----|---------|
| **RSTU Connect** | `https://rstu-connect.neocities.org/` | Main dashboard |
| **Element Web** | `https://rstu-element.netlify.app` | Chat client (embedded) |

The Neocities site embeds the Netlify site via `<iframe>`.

---

## Future Updates

When Element Web releases a new version:

1. Download new Element release
2. Copy `_headers` and `config.json` into it
3. Replace `element-v1.12.4` folder
4. Commit and push to GitHub
5. Netlify automatically redeploys!

---

## References

- [Netlify: Deploying from subdirectories](https://docs.netlify.com/build/configure-builds/monorepos/)
- [Netlify: Base directory and publish directory](https://docs.netlify.com/build/configure-builds/overview/)
- [Element Web releases](https://github.com/element-hq/element-web/releases)

---

**Questions?** The entire setup should take about 10-15 minutes total.

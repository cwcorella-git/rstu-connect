# Netlify Element Configuration Files

These configuration files should be placed in the root directory of your Element Web deployment on Netlify.

## Files

1. **`_headers`** - Netlify headers configuration
   - Allows iframe embedding from rstu-connect.neocities.org
   - Sets security headers

2. **`config.json`** - Element Web configuration
   - Points to matrix.org as the homeserver
   - Configures integrations and features

## How to Use

### When deploying Element Web to Netlify:

1. Download Element Web from https://github.com/element-hq/element-web/releases
2. Extract the archive (e.g., `element-v1.11.83.tar.gz`)
3. **Copy these two files into the extracted Element directory:**
   - `_headers` → goes in the root
   - `config.json` → REPLACE the existing config.json
4. Deploy the entire folder to Netlify (drag & drop or Git)

## Customization

### To change the branding:

Edit `config.json` and modify:
```json
{
  "brand": "RSTU Chat",
  "default_theme": "light"
}
```

### To use a different Matrix homeserver:

Edit `config.json`:
```json
{
  "default_server_config": {
    "m.homeserver": {
      "base_url": "https://your-homeserver.org",
      "server_name": "your-homeserver.org"
    }
  }
}
```

## Verification

After deploying to Netlify, you can verify the headers are working:

```bash
curl -I https://your-element-site.netlify.app | grep -i frame
```

You should see:
```
X-Frame-Options: ALLOW-FROM https://rstu-connect.neocities.org
Content-Security-Policy: frame-ancestors 'self' https://rstu-connect.neocities.org https://*.neocities.org
```

## Troubleshooting

- **Headers not applying:** Make sure `_headers` file has no file extension and is in the root
- **Config not loading:** Verify `config.json` is valid JSON (use jsonlint.com)
- **Still getting iframe errors:** Check that your Neocities URL exactly matches what's in `_headers`

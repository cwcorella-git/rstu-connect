# Session Log: Element Web Deployment Attempts

**Date:** November 21-22, 2025
**Goal:** Deploy Element Web to Netlify for iframe embedding in RSTU Connect
**Status:** ❌ FAILED (multiple attempts)

---

## Session Overview

This session attempted to deploy Element Web v1.12.4 to Netlify so it could be embedded via iframe in the RSTU Connect static site (hosted on Neocities). The deployment has failed repeatedly due to Netlify configuration issues and framework auto-detection.

---

## Background: Why We Need This

### The Architecture

**RSTU Connect has a three-tier communication system:**

1. **Element on rstu-connect.neocities.org** - Public building coordination (guest access)
2. **Discord** - Vetted RSTU members only (internal coordination)
3. **Signal** - Sensitive organizing (encrypted leadership coordination)

### The Technical Challenge

**Problem:** Element Web (`app.element.io`) blocks iframe embedding with security headers.

**Solution:** Self-host Element Web on Netlify with custom headers allowing iframe embedding from `rstu-connect.neocities.org`.

**Repository structure:**
```
rstu-connect/
├── src/                    # Next.js source code
├── out/                    # Next.js build output (deployed to Neocities)
├── element-v1.12.4/        # Element Web v1.12.4 (should deploy to Netlify)
│   ├── index.html
│   ├── _headers           # Custom headers for iframe embedding
│   ├── config.json        # Matrix homeserver configuration
│   └── bundles/           # Element Web JavaScript/CSS assets
├── package.json           # Next.js dependencies
├── next.config.js         # Next.js configuration
└── netlify.toml           # Netlify deployment configuration (added this session)
```

**Challenge:** Deploy ONLY `element-v1.12.4/` to Netlify, not the Next.js site.

---

## Research Phase: Communication Platform Evaluation

### Initial Question

User asked whether Matrix/Element was the right choice for RSTU's organizing needs, given difficulties with embedding.

### Research Conducted

**Signal vs Element comparison:**
- ❌ **Signal cannot be embedded** - No web client, no iframe capability, phone number required
- ✅ **Element/Matrix is architecturally perfect** - Designed for public community rooms, web-embeddable, guest access

**Alternative platforms evaluated:**
- Rocket.Chat - Requires self-hosting (additional cost/complexity)
- Gitter - Being deprecated, migrating to Matrix
- Discord widgets - Read-only (can't send messages)
- Telegram - Phone number requirement (privacy concern)
- Mattermost/Zulip - Require backend servers

**Conclusion:** Element/Matrix is the correct choice for public building coordination on a static site.

**Key findings:**
- Element supports **guest access** - users can join public rooms without creating accounts
- Element is designed for this exact use case - public community rooms embedded in websites
- The Discord/Signal/Element split makes sense as security tiers (public → members → leadership)

---

## Implementation Attempts

### Attempt 1: Update MatrixChatEmbed Component

**Action:** Updated `src/components/MatrixChatEmbed.tsx` to use Netlify URL

**Changes:**
```typescript
// Changed from:
const ELEMENT_URL = 'https://app.element.io'; // ⚠️ Blocked

// To:
const ELEMENT_URL = 'https://rstu-element.netlify.app'; // Netlify instance
```

**Result:** ❌ **INFINITY MIRROR EFFECT**
- The iframe showed the RSTU Connect site itself (building list), not Element Web
- Created recursive embedding loop

**Problem Identified:** Element Web wasn't actually deployed to `https://rstu-element.netlify.app` yet - the Netlify site either didn't exist or was misconfigured.

---

### Attempt 2: Create Hydrogen SDK Alternative (Abandoned)

**Action:** Attempted to create minimal chat embed using Hydrogen SDK

**Rationale:** Try to build a simpler, minimal Matrix client embed

**Files created:**
- `src/components/HydrogenChatEmbed.tsx` (experimental)
- `src/components/SimpleMatrixViewer.tsx` (fallback)

**Result:** ❌ **ABANDONED**
- Hydrogen SDK requires authentication (same problem as Element)
- Too complex for static site deployment
- Matrix Client-Server API requires backend (can't hardcode access tokens in client code)

**Learning:** Matrix chat REQUIRES Element Web or similar client for proper embedding. Can't build a minimal client-side-only solution.

---

### Attempt 3: First netlify.toml Configuration

**Action:** Created `netlify.toml` to deploy Element Web subfolder

**Configuration:**
```toml
[build]
  base = "element-v1.12.4"
  publish = "element-v1.12.4"
  command = ""
```

**Reasoning:** Set both base and publish to the Element Web folder

**Result:** ❌ **PATH DOUBLING ERROR**

**Error message:**
```
Your publish directory was not found at: /opt/build/repo/element-v1.12.4/element-v1.12.4
```

**Problem:**
- Netlify interprets `publish` as relative to `base`
- `base = element-v1.12.4` + `publish = element-v1.12.4` = `/element-v1.12.4/element-v1.12.4/`
- This path doesn't exist

**What we learned:** Netlify's `publish` directory is relative to the `base` directory, not the repository root.

---

### Attempt 4: Change Publish to Current Directory

**Action:** Changed publish directory to `.` (current directory relative to base)

**Configuration:**
```toml
[build]
  base = "element-v1.12.4"
  publish = "."  # Current directory relative to base
  command = ""
```

**Reasoning:** If base is `element-v1.12.4`, then `.` should deploy that folder

**Result:** ❌ **NEXT.JS PLUGIN ERROR**

**Error message:**
```
Plugin "@netlify/plugin-nextjs" failed
Error: Your publish directory cannot be the same as the base directory of your site
```

**Problem:**
- Netlify auto-detected the repository as a Next.js project (saw `package.json` and `next.config.js` in root)
- Automatically enabled `@netlify/plugin-nextjs` plugin
- Next.js plugin validates that `base !== publish` (different directories)
- When resolved, base and publish were the same: `/opt/build/repo/element-v1.12.4`

**What we learned:**
- Netlify's framework detection can cause problems for monorepos
- Next.js plugin is automatically enabled when it detects Next.js in repo
- The plugin has validation rules that reject certain configurations

---

### Attempt 5: Try to Disable Next.js Plugin

**Action:** Attempted to disable Next.js plugin via `netlify.toml`

**Configuration added:**
```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
  [plugins.inputs]
    disable = true
```

**Reasoning:** Disable the auto-detected Next.js plugin since Element Web is static HTML

**Result:** ❌ **INVALID PLUGIN INPUT ERROR**

**Error message:**
```
Plugin "@netlify/plugin-nextjs" invalid input "disable"
Plugin "@netlify/plugin-nextjs" does not accept any inputs but you specified: "disable"
```

**Problem:**
- The Next.js plugin doesn't have a `disable` input option
- Plugins must be disabled in Netlify UI, not via configuration file
- Framework plugins (auto-detected) can't be easily disabled

**What we learned:**
- Netlify plugins can't always be disabled via `netlify.toml`
- Auto-detected framework plugins persist even when deploying different content
- The UI doesn't provide an easy way to remove framework detection plugins

---

### Attempt 6: Remove Base Directory Entirely

**Action:** Removed `base` setting, set `publish` to subfolder path from repo root

**Configuration:**
```toml
[build]
  # No base directory - deploy from repository root
  publish = "element-v1.12.4"
  command = ""
```

**Reasoning:**
- Deploy from repo root (no `base` directory)
- Point `publish` to Element Web subfolder
- This way `base ≠ publish` (should satisfy Next.js plugin)

**Result:** ❌ **STATUS UNKNOWN - LATEST ATTEMPT**

**Expected outcome:** Should deploy successfully, but user reported it failed

**User feedback:** "this last attempt has failed, too"

---

## Current State

### What's Deployed

**Netlify site:** `https://rstu-element.netlify.app`
**Current status:** Serving RSTU Connect Next.js site (infinity mirror effect) OR failing to deploy

**RSTU Connect site:** `https://rstu-connect.neocities.org/`
**Current status:** Working, but iframes point to broken Netlify URL

### Files Modified This Session

1. **`src/components/MatrixChatEmbed.tsx`** - Updated Element URL to Netlify
2. **`netlify.toml`** - Created and modified 6 times with different configurations
3. **`src/components/HydrogenChatEmbed.tsx`** - Created then deleted (experimental)
4. **`src/components/SimpleMatrixViewer.tsx`** - Created then deleted (experimental)
5. **`package.json`** - Temporarily added `hydrogen-view-sdk` dependency (removed)

### Git Commits This Session

1. `310edae` - Add Element Web v1.12.4 for Netlify deployment
2. `5323720` - Update Element URL to Netlify instance for iframe embedding
3. `9c9cc93` - Add Netlify configuration to deploy Element Web subfolder
4. `149a21b` - Fix Netlify publish directory and disable Next.js plugin
5. `ebe32a9` - Remove invalid Next.js plugin disable attempt
6. `23cf1fa` - Fix: Remove base directory to avoid base==publish error

---

## Problems Encountered

### 1. Netlify Configuration Complexity

**Issue:** Netlify's base/publish directory configuration is confusing when deploying from monorepos

**Challenges:**
- `publish` is relative to `base`, not repo root
- When `base` is set, `publish = "."` means "publish the base directory"
- When `base` is NOT set, `publish` is relative to repo root
- Documentation doesn't make this clear for monorepo scenarios

### 2. Framework Auto-Detection

**Issue:** Netlify auto-detects frameworks and applies plugins that interfere with deployment

**Challenges:**
- Detected Next.js from `package.json` in repo root
- Applied `@netlify/plugin-nextjs` automatically
- Plugin has validation rules (base ≠ publish) that cause failures
- Can't easily disable framework plugins via configuration
- UI doesn't show framework plugins in "Build plugins" section (they're not manual plugins)

### 3. Path Resolution Confusion

**Issue:** Multiple failed attempts due to misunderstanding how Netlify resolves paths

**Sequence:**
1. `base = "element-v1.12.4"` + `publish = "element-v1.12.4"` = `/element-v1.12.4/element-v1.12.4/` ❌
2. `base = "element-v1.12.4"` + `publish = "."` = `/element-v1.12.4` but triggers plugin error ❌
3. `base = (none)` + `publish = "element-v1.12.4"` = `/element-v1.12.4` ← Current attempt

### 4. Static Site vs Build Output Confusion

**Issue:** Element Web is pre-built static files, but Netlify expects build output

**Challenges:**
- Most Netlify examples assume you're building something (Next.js, Hugo, etc.)
- Element Web is already built - just HTML/JS/CSS files
- No `out/` or `public/` or `dist/` folder - files are in the subfolder root
- This creates the base==publish problem (source and output are the same location)

---

## Lessons Learned

### Technical Insights

1. **Signal cannot be embedded in websites** - No web client, architecturally incompatible
2. **Element/Matrix is the right choice** for public building coordination
3. **Guest access** solves the barrier-to-entry problem for public Matrix rooms
4. **Netlify framework detection** can interfere with monorepo deployments
5. **Publish directory is relative to base** - critical configuration detail
6. **Pre-built static sites** (like Element Web) create unique Netlify configuration challenges

### Organizational Insights

1. **The three-tier communication model makes sense:**
   - Element = Public coordination (low barrier, guest access)
   - Discord = Vetted members (moderate security)
   - Signal = Leadership strategy (maximum security)

2. **Matrix/Element architectural advantages:**
   - Public rooms anyone can join via link
   - Federation capability (connect with other tenant unions)
   - Open source, community-controlled
   - Designed for communities, not just messaging

3. **Static site limitations:**
   - Can embed external services (Element via iframe)
   - Cannot run Matrix homeserver or auth services
   - Must rely on external Matrix homeserver (matrix.org)

---

## Next Steps to Resolve

### Option A: Deploy Element Web Separately (Recommended)

**Approach:** Create a separate GitHub repository for Element Web

**Steps:**
1. Create new repo: `rstu-element` (separate from `rstu-connect`)
2. Copy `element-v1.12.4` contents to repo root
3. Deploy to Netlify from this repo (no monorepo confusion)
4. Configure Netlify:
   ```toml
   [build]
     publish = "."
     command = ""
   ```
5. Update `rstu-connect` iframe URL once deployed

**Advantages:**
- Avoids monorepo configuration complexity
- No Next.js auto-detection (no `package.json` in Element repo)
- Clear separation of concerns
- Each site deploys independently

**Disadvantages:**
- Requires managing two repositories
- More complex for future Element updates

### Option B: Use Netlify UI Configuration (Bypass netlify.toml)

**Approach:** Delete `netlify.toml` and configure entirely in Netlify UI

**Steps:**
1. Remove `netlify.toml` from repository
2. In Netlify UI → Site settings → Build & deploy:
   - Base directory: (leave blank)
   - Build command: (leave blank)
   - Publish directory: `element-v1.12.4`
3. Try to remove/ignore Next.js plugin detection
4. Deploy manually

**Advantages:**
- Bypass configuration file issues
- Direct control over settings

**Disadvantages:**
- Settings not version-controlled
- May still face Next.js plugin auto-detection
- Harder to reproduce deployment

### Option C: Use Different Static Hosting (Not Netlify)

**Approach:** Deploy Element Web to a service without framework auto-detection

**Options:**
- **Cloudflare Pages** - Similar to Netlify but different detection
- **Vercel** - May have same issues (they also auto-detect frameworks)
- **GitHub Pages** - Simple static hosting, no build detection
- **Firebase Hosting** - Static hosting, no framework detection

**Advantages:**
- Avoid Netlify-specific issues
- May be simpler for static file hosting

**Disadvantages:**
- Need to configure headers for iframe embedding (may not be possible)
- Less familiar deployment process
- May not support `_headers` file

### Option D: Contact Netlify Support

**Approach:** Ask Netlify how to deploy static files from monorepo subfolder without framework plugin interference

**Questions to ask:**
1. How to disable auto-detected framework plugins?
2. How to deploy pre-built static files (no build step) from monorepo subfolder?
3. Why does Next.js plugin activate for non-Next.js content?

---

## Immediate Action Required

**Before next attempt, we need:**

1. **Latest error log** - What exactly failed in Attempt 6?
2. **Decision on approach** - Separate repo, UI config, or different host?
3. **Verification of Netlify state** - Is there a site deployed? What's serving?

**User's request:** "please document everything we've done this session and note the recent successive failures"

**This document serves that purpose.** ✓

---

## Research Documentation Created

This session also produced comprehensive research documents:

1. **Communication platform research** - Signal vs Element vs alternatives for tenant organizing
2. **Tenant union technology analysis** - What other unions use (KC Tenants, LA Tenants Union, etc.)
3. **Netlify deployment documentation research** - Base/publish directory configuration

**Key research findings:**
- No good alternatives to Element for public web-embeddable chat on static sites
- Signal is better for sensitive organizing but cannot be embedded
- Most successful tenant unions use multiple tools for different purposes
- The RSTU three-tier model (Element/Discord/Signal) is sound organizing practice

---

## Conclusion

**Session outcome:** ❌ Element Web deployment to Netlify **FAILED** after 6 attempts

**Root cause:** Netlify framework auto-detection + monorepo configuration complexity

**Recommended path forward:** Create separate `rstu-element` repository for clean deployment

**Alternative:** Deploy to GitHub Pages or Cloudflare Pages (may have simpler static hosting)

**What works:** Research and architectural decisions are solid - Element is the right choice

**What doesn't work:** Current Netlify monorepo deployment approach

---

**Session participants:** User (organizer), Claude Code (AI assistant)
**Time spent:** ~3 hours
**Commits made:** 6
**Deployment attempts:** 6
**Successful deployments:** 0

**Status:** Awaiting decision on next approach and latest error details.

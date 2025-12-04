# RSTU Gun.js Relay Server

Simple Gun.js relay peer for RSTU Connect P2P chat.

## What is this?

This is a lightweight relay server that allows browser clients to sync Gun.js data across different sessions. Without a relay server, messages only stay in local browser storage and don't sync between tabs or different users.

## Quick Deploy to Render.com (Free Tier)

1. **Create Render.com account** (free)
   - Visit https://render.com/
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `relay-server` directory

3. **Configure Service**
   - **Name**: `rstu-gun-relay` (or your choice)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Deploy**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Note your service URL (e.g., `https://rstu-gun-relay.onrender.com`)

5. **Update rstu-connect**
   - Go to `src/lib/gun.ts`
   - Update `peers` array with your new relay URL:
     ```javascript
     peers: [
       'https://your-relay-name.onrender.com/gun'
     ]
     ```

## Alternative: Deploy to Railway.app

1. Visit https://railway.app/
2. Import from GitHub
3. Select `relay-server` folder
4. Deploy automatically
5. Get your public URL

## Alternative: Deploy to Fly.io

1. Install fly CLI: `curl -L https://fly.io/install.sh | sh`
2. `cd relay-server`
3. `fly launch`
4. Follow prompts
5. `fly deploy`

## Local Testing

```bash
cd relay-server
npm install
npm start
```

Server runs at `http://localhost:8765/gun`

Update `src/lib/gun.ts` to point to `http://localhost:8765/gun` for local testing.

## Why We Need This

- Heroku ended free tier in November 2022
- Old public Gun relays (gun-manhattan.herokuapp.com, gun-us.herokuapp.com) are dead
- Browser-to-browser sync requires a relay server
- WebRTC alone is too unreliable

## How It Works

1. Browser clients connect to relay server
2. When you send a message, it's stored in Gun's in-memory graph
3. Relay server pushes updates to all connected peers
4. New peers joining can retrieve historical messages

## Cost

- **Render.com Free Tier**: Free forever, spins down after 15 min inactivity, 750 hrs/month
- **Railway.app Free Trial**: $5 credit, then pay-as-you-go
- **Fly.io**: 3 small VMs free

For RSTU's use case, Render free tier is perfect.

# How to Get Your Matrix Access Token

## Method 1: Via Element Web (Easiest)

1. Go to https://app.element.io and log in with your Matrix account
2. Click your profile picture (top left)
3. Click "All settings"
4. Click "Help & About" (in the left sidebar)
5. Scroll down to "Advanced" section
6. Click the section that says "Access Token: <click to reveal>"
7. Copy the token (it will look like: `syt_abcd1234...`)

## Method 2: Via API (For Advanced Users)

```bash
curl -X POST https://matrix.org/_matrix/client/r0/login \
  -H "Content-Type: application/json" \
  -d '{
    "type": "m.login.password",
    "user": "your_username",
    "password": "your_password"
  }'
```

This will return a JSON response with your `access_token`.

## Security Warning ⚠️

**IMPORTANT:** Your access token is like a password!

- **DO NOT** commit it to git
- **DO NOT** share it publicly
- Store it in a `.env` file (which is in .gitignore)
- Treat it like you would a password

## Storage (For Scripts)

Create a file at `/home/user/Projects/rstu-connect/.env`:

```
MATRIX_ACCESS_TOKEN=syt_your_token_here
MATRIX_USER_ID=@yourusername:matrix.org
```

Then add `.env` to your `.gitignore` if not already there.

# NICER Admin Panel — Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Cloudflare account (free plan works)
- Access to the `nicer-images` R2 bucket
- The `nicertatscru.com` domain on Cloudflare DNS

---

## Step 1: Create R2 API Token

1. Go to **Cloudflare Dashboard → R2 → Manage R2 API Tokens**
2. Click **Create API Token**
3. Permissions: **Object Read & Write**
4. Scope it to the `nicer-images` bucket
5. Save the **Access Key ID** and **Secret Access Key** — you'll need these as Worker secrets

---

## Step 2: Deploy the Cloudflare Worker

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Navigate to the worker project
cd nicer-worker

# Install dependencies
npm install

# Set secrets (you'll be prompted to paste each value)
wrangler secret put ADMIN_PASSWORD
wrangler secret put JWT_SECRET
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
wrangler secret put CF_ACCOUNT_ID

# Deploy
wrangler deploy
```

**Setting secret values:**
- `ADMIN_PASSWORD` — The password Nicer will use to log into the admin panel
- `JWT_SECRET` — Any random string (e.g. run `openssl rand -hex 32` to generate one)
- `R2_ACCESS_KEY_ID` — From Step 1
- `R2_SECRET_ACCESS_KEY` — From Step 1
- `CF_ACCOUNT_ID` — Your Cloudflare Account ID (found on the dashboard overview page)

### Add Custom Domain to the Worker

1. Go to **Cloudflare Dashboard → Workers & Pages → nicer-api**
2. Click **Settings → Triggers → Custom Domains**
3. Add `api.nicertatscru.com`
4. Cloudflare will auto-create the DNS record

---

## Step 3: Configure CORS on R2 Bucket

1. Go to **Cloudflare Dashboard → R2 → nicer-images → Settings**
2. Scroll to **CORS Policy** and add this rule:

```json
[
  {
    "AllowedOrigins": ["https://nicertatscru.com"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["Content-Type"],
    "MaxAgeSeconds": 86400
  }
]
```

---

## Step 4: Upload the Seed Manifest

This creates the initial `manifest.json` matching the currently hardcoded gallery data:

```bash
cd nicer-website
node scripts/seed-manifest.js > manifest.json
```

Then upload `manifest.json` to the **root** of the `nicer-images` R2 bucket:

1. Go to **Cloudflare Dashboard → R2 → nicer-images**
2. Click **Upload**
3. Upload the `manifest.json` file
4. Delete the local copy: `rm manifest.json`

---

## Step 5: Deploy the Updated Website

```bash
cd nicer-website
git add .
git commit -m "Add admin panel and dynamic gallery"
git push
```

Vercel will auto-deploy from the push.

---

## Step 6: Test Everything

### Public Gallery
1. Visit `https://nicertatscru.com`
2. Scroll to the gallery — it should load collections from the manifest
3. Verify all 4 collections appear with correct images
4. Test the lightbox, tab switching, hover effects

### Admin Panel
1. Visit `https://nicertatscru.com/#admin`
2. Log in with the `ADMIN_PASSWORD` you set
3. Verify all collections appear in the sidebar
4. Click a collection to see its images

### Upload Test
1. In the admin panel, select a collection
2. Drag a test image into the upload zone (or click to browse)
3. Wait for the upload to complete (progress bar → checkmark)
4. Verify the image appears in the grid
5. Visit the public gallery — the new image should appear within ~1 minute

### Title Editing
1. Click an image title in the admin panel
2. Type a new title, press Enter
3. Verify it saves (refresh the admin to confirm)

### Image Deletion
1. Hover over an image in the admin panel
2. Click the X, then click "Delete?" to confirm
3. Verify the image disappears from both admin and public gallery

---

## Architecture Overview

```
Browser (nicertatscru.com)
  ├─ Public gallery → fetches manifest.json from R2
  └─ Admin panel (#admin) → talks to Worker API
       ↓
Cloudflare Worker (api.nicertatscru.com)
  ├─ Auth (JWT)
  ├─ Presigned URLs → browser uploads directly to R2
  └─ Manifest CRUD → reads/writes manifest.json in R2
       ↓
Cloudflare R2 (images.nicertatscru.com)
  ├─ manifest.json
  ├─ morocco-paintings/...
  ├─ naughty-but-nicer/...
  └─ (new collections)/...
```

## Costs
- **Cloudflare Worker**: Free tier — 100,000 requests/day
- **Cloudflare R2**: Free tier — 10 GB storage, 10 million reads/month
- **Vercel**: Free Hobby plan
- **Total additional cost**: $0

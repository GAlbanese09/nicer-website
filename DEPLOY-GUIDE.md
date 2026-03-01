# 🚀 Deploying NICER's Website to Vercel — Step by Step

---

## PHASE 1: Set Up Your Accounts (One-Time Setup)

### Step 1 — Create a GitHub Account (skip if you have one)
1. Go to **github.com**
2. Click **Sign Up**
3. Create your free account with email + password

### Step 2 — Create a Vercel Account
1. Go to **vercel.com**
2. Click **Sign Up**
3. Choose **"Continue with GitHub"** — this links them together automatically
4. Authorize Vercel to access your GitHub

### Step 3 — Install Git on Your Computer
- **Mac**: Open Terminal and type `git --version` — if not installed, it'll prompt you to install
- **Windows**: Download from **git-scm.com** and install with default settings
- **Verify**: Open Terminal/Command Prompt and type `git --version` — you should see a version number

### Step 4 — Install Node.js
1. Go to **nodejs.org**
2. Download the **LTS** version (the big green button)
3. Install with all default settings
4. **Verify**: Open Terminal/Command Prompt and type `node --version` — you should see a version number

---

## PHASE 2: Get the Project on GitHub

### Step 5 — Unzip the Project
1. Download the **nicer-website.zip** file I provided
2. Unzip it somewhere easy to find (like your Desktop)
3. You should have a folder called `nicer-website` with files inside

### Step 6 — Create a GitHub Repository
1. Go to **github.com** → click the **+** button (top right) → **New repository**
2. Name it: `nicer-website`
3. Set it to **Public** (required for Vercel free tier)
4. Do NOT check "Add a README" or any other boxes
5. Click **Create repository**
6. You'll see a page with instructions — keep this page open

### Step 7 — Push Your Code to GitHub
Open Terminal (Mac) or Command Prompt (Windows), then type these commands one at a time:

```bash
# Navigate to the project folder (adjust path to where you unzipped it)
cd ~/Desktop/nicer-website

# Install the project dependencies
npm install

# Initialize Git
git init

# Add all files
git add .

# Create your first commit
git commit -m "Initial commit - NICER website"

# Connect to your GitHub repo (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/nicer-website.git

# Push the code up
git branch -M main
git push -u origin main
```

If prompted for GitHub credentials, enter your username and a **Personal Access Token** 
(GitHub no longer accepts passwords — go to GitHub → Settings → Developer Settings → 
Personal Access Tokens → Generate New Token → check "repo" → copy the token and use it 
as your password).

---

## PHASE 3: Deploy on Vercel

### Step 8 — Import Your Project
1. Go to **vercel.com/dashboard**
2. Click **"Add New..."** → **"Project"**
3. You should see your `nicer-website` repo listed — click **Import**
4. Vercel auto-detects it's a Vite project. The defaults are correct:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**

### Step 9 — Wait ~60 Seconds
Vercel will:
- Pull your code from GitHub
- Install dependencies
- Build the site
- Deploy it globally

You'll see a **"Congratulations!"** screen with a live URL like:
`https://nicer-website.vercel.app`

**🎉 Your site is LIVE on the internet!**

---

## PHASE 4: Add a Custom Domain ($10-15/year — Optional)

### Step 10 — Buy a Domain
Best registrars (cheapest first):
1. **Cloudflare Registrar** (cloudflare.com) — at-cost pricing, cheapest option
2. **Namecheap** (namecheap.com) — usually ~$9-12/year for .com
3. **Porkbun** (porkbun.com) — great prices, easy interface

Suggested domain names:
- `nicertatscru.com`
- `nicerart.com`
- `hectornicer.com`
- `nicermurals.com`

### Step 11 — Connect Domain to Vercel
1. In **Vercel Dashboard** → your project → **Settings** → **Domains**
2. Type in your new domain (e.g., `nicerart.com`) → click **Add**
3. Vercel will show you DNS records to add
4. Go to your domain registrar → **DNS Settings** → add the records Vercel shows you:
   - Usually an **A record** pointing to `76.76.21.21`
   - And a **CNAME** for `www` pointing to `cname.vercel-dns.com`
5. Wait 5-30 minutes for DNS to propagate
6. Vercel automatically adds **free SSL/HTTPS** — no action needed

---

## ONGOING: How to Update the Site

Whenever you want to make changes:

```bash
# Navigate to your project
cd ~/Desktop/nicer-website

# Make your changes to the files...

# Then push the update:
git add .
git commit -m "Updated [whatever you changed]"
git push
```

**That's it!** Vercel automatically detects the push and redeploys within ~30 seconds. 
No manual deployment needed — ever.

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| `git` command not found | Reinstall Git from git-scm.com |
| `npm` command not found | Reinstall Node.js from nodejs.org |
| Vercel build fails | Check the build logs on Vercel dashboard for errors |
| Domain not working | DNS can take up to 48 hours (usually 5-30 min) |
| GitHub push rejected | Make sure you're using a Personal Access Token, not password |

---

## Summary of Costs

| Item | Cost |
|------|------|
| GitHub | **Free** |
| Vercel Hosting | **Free** (Hobby plan) |
| SSL/HTTPS | **Free** (included with Vercel) |
| Custom Domain | **~$10-15/year** |
| **Total** | **~$10-15/year** |

---

*Built with ❤️ for Hector "Nicer" Nazario — The Mural King*

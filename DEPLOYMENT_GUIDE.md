# 🚀 Deployment Guide: GitHub Pages (Frontend) & Render (Backend)

This guide walks you through deploying **DocReview Pro**:
- **Frontend** on **GitHub Pages** (Free, fast static CDN)
- **Backend** on **Render** (Free Web Service for Node.js + WhatsApp WebSocket)

---

## 📦 Step 1: Push Code to Your GitHub Repository

1. Open your terminal in `c:\code\doc_review_tool` (or VS Code terminal).
2. Create a new repository on your [GitHub](https://github.com/new) (e.g., `doc_review_tool`).
3. Run the following commands:
```bash
git init
git add .
git commit -m "Initial commit: WhatsApp Clinic Review Tool"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/doc_review_tool.git
git push -u origin main
```
*(Note: Your WhatsApp login keys in `server/session_auth/` are already excluded in `.gitignore` so your personal sessions are 100% safe).*

---

## ⚡ Step 2: Deploy Backend to Render

1. Log into [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repo `doc_review_tool`.
4. Fill in the service configuration:
   - **Name:** `docreview-backend` (or any name you prefer)
   - **Region:** Choose closest to your clinic (e.g., Singapore / Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Click **Create Web Service**.
6. Wait 1-2 minutes for Render to build. Once live, Render will give you a public URL, for example:
   👉 `https://docreview-backend.onrender.com`

---

## 🌐 Step 3: Deploy Frontend to GitHub Pages

### Option A: Automatic via GitHub Actions (Recommended)
1. In your GitHub repository, go to **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. That's it! Every time you push to `main`, GitHub Actions will automatically build and publish your frontend to:
   👉 `https://YOUR_GITHUB_USERNAME.github.io/doc_review_tool/`

### Option B: Quick CLI Deploy (Optional)
From your local terminal, run:
```bash
cd c:\code\doc_review_tool\client
npm run deploy
```

---

## 🔗 Step 4: Connect Frontend to Your Render Backend

1. Open your live GitHub Pages website: `https://YOUR_GITHUB_USERNAME.github.io/doc_review_tool/`
2. In the top navigation bar, click the **"Server URL"** button.
3. Paste your live Render backend URL:
   `https://docreview-backend.onrender.com`
4. Click **Save & Connect**.
5. The site will refresh and link directly to your Render backend via WebSockets!

You can now generate the QR code, link WhatsApp, pick doctor templates, upload patient Excel sheets, and send review requests directly from your live hosted URL.

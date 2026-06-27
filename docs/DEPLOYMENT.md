# 🚀 AgriCrop Deployment Guide

## Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Vercel     │────▶│   Render    │────▶│  MongoDB Atlas  │
│  (Frontend)  │     │  (Backend)  │     │   (Database)    │
│  React App   │     │  Flask API  │     │  Free M0 Tier   │
└─────────────┘     └─────────────┘     └─────────────────┘
```

---

## 1. MongoDB Atlas Setup

### Create Account & Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Click **"Build a Database"**
4. Select **M0 Free Tier**
5. Choose a cloud provider and region closest to your users
6. Name your cluster (e.g., `agricrop-cluster`)
7. Click **Create Cluster**

### Configure Access

1. **Database Access:**
   - Go to **Security → Database Access**
   - Click **Add New Database User**
   - Choose **Password** authentication
   - Set username: `agricrop_admin`
   - Generate a secure password (save it!)
   - Set privileges: **Read and write to any database**
   - Click **Add User**

2. **Network Access:**
   - Go to **Security → Network Access**
   - Click **Add IP Address**
   - For development: Click **Allow Access from Anywhere** (0.0.0.0/0)
   - For production: Add specific Render IP addresses
   - Click **Confirm**

### Get Connection String

1. Go to **Databases → Connect**
2. Choose **Connect your application**
3. Select **Python** driver, version **3.12 or later**
4. Copy the connection string:
   ```
   mongodb+srv://agricrop_admin:<password>@agricrop-cluster.xxxxx.mongodb.net/agricrop?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your database user's password

### Create Database & Collections

The application auto-creates collections on first run. However, you can manually create indexes:

1. Go to **Databases → Browse Collections**
2. Click **Create Database**
   - Database name: `agricrop`
   - Collection name: `users`
3. Create additional collections: `fields`, `disease_reports`, `moisture_reports`, `notifications`

### Create Geospatial Indexes

In the MongoDB Atlas UI:
1. Go to your `fields` collection → **Indexes** tab
2. Click **Create Index**
3. Add field: `location` with type `2dsphere`
4. Repeat for `disease_reports.location`

Or via the MongoDB Shell:
```javascript
use agricrop

db.fields.createIndex({ "location": "2dsphere" })
db.disease_reports.createIndex({ "location": "2dsphere" })
db.users.createIndex({ "email": 1 }, { unique: true })
db.notifications.createIndex({ "user_id": 1, "created_at": -1 })
```

---

## 2. Backend Deployment (Render)

### Prepare Repository

Ensure your `agricrop-backend/` directory contains:
- `run.py`
- `requirements.txt`
- `render.yaml`
- `app/` directory with all source files
- `ai/` directory with model code

### Deploy to Render

#### Option A: render.yaml (Recommended)

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New → Blueprint**
4. Connect your GitHub repository
5. Render auto-detects `render.yaml` and configures the service
6. Click **Apply**

#### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `agricrop-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `agricrop-backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn run:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - **Plan**: Free

### Set Environment Variables

In Render dashboard → your service → **Environment**:

| Variable | Value |
|----------|-------|
| `FLASK_ENV` | `production` |
| `FLASK_DEBUG` | `False` |
| `SECRET_KEY` | Generate: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `JWT_SECRET_KEY` | Generate another unique key |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `UPLOAD_FOLDER` | `uploads` |
| `MAX_CONTENT_LENGTH` | `16777216` |

### Verify Deployment

Once deployed, visit:
```
https://your-app.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "AgriCrop API is running",
  "data": { "version": "1.0.0", "status": "healthy" }
}
```

### Important Notes for Render Free Tier

- Free services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- AI model loading adds to cold start time
- Consider upgrading to Starter plan ($7/month) for always-on service

---

## 3. Frontend Deployment (Vercel)

### Prepare Build

```bash
cd agricrop-frontend

# Set production API URL
echo "VITE_API_URL=https://your-backend.onrender.com/api" > .env.production

# Test build
npm run build
```

### Deploy to Vercel

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd agricrop-frontend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? agricrop
# - Directory? ./
# - Override settings? No
```

#### Option B: GitHub Integration (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New → Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `agricrop-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Set Environment Variables:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
6. Click **Deploy**

### Configure SPA Routing

The `vercel.json` file handles client-side routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Verify Deployment

Visit your Vercel URL (e.g., `https://agricrop.vercel.app`).

---

## 4. Post-Deployment Checklist

### Security

- [ ] Generate unique SECRET_KEY and JWT_SECRET_KEY for production
- [ ] Restrict MongoDB Network Access to Render IP addresses only
- [ ] Enable HTTPS (automatic on Vercel and Render)
- [ ] Update CORS settings to only allow your Vercel domain:
  ```python
  CORS(app, origins=["https://agricrop.vercel.app"])
  ```

### Performance

- [ ] AI models are generated on first request (may take 1-2 minutes)
- [ ] Consider pre-generating models before deployment
- [ ] MongoDB indexes are created on app startup

### Monitoring

- [ ] Check Render logs for backend errors
- [ ] Check Vercel function logs for frontend issues
- [ ] Monitor MongoDB Atlas metrics

### DNS (Custom Domain)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your domain (e.g., `agricrop.com`)
3. Update DNS records as instructed

**Render:**
1. Go to Service Settings → Custom Domains
2. Add your API domain (e.g., `api.agricrop.com`)
3. Update DNS records as instructed

---

## 5. Troubleshooting

### Backend won't start on Render

1. Check build logs for dependency errors
2. Ensure `requirements.txt` is in the root directory or `agricrop-backend/`
3. Verify Python version compatibility
4. Check environment variables are set correctly

### MongoDB connection fails

1. Verify connection string format
2. Check database user password (no special characters that need URL encoding)
3. Ensure Network Access allows Render IP (or 0.0.0.0/0 for testing)
4. Try connecting with MongoDB Compass locally first

### Frontend can't reach backend

1. Verify `VITE_API_URL` environment variable is set correctly
2. Check CORS configuration allows the Vercel domain
3. Test backend health endpoint directly in browser
4. Check browser console for CORS errors

### AI Models take too long to load

1. First request triggers model creation (1-2 min on free tier)
2. Subsequent requests should be fast
3. Consider pre-training models locally and including the .h5/.pkl files in deployment

---

## 6. CI/CD (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy AgriCrop

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd agricrop-backend
          pip install -r requirements.txt
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Build Frontend
        run: |
          cd agricrop-frontend
          npm install
          npm run build
```

Vercel and Render both support automatic deployments on GitHub push — CI/CD is built-in when using their GitHub integrations.

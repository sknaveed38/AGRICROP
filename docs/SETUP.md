# 🛠️ AgriCrop Local Development Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

| Software | Version | Download |
|----------|---------|----------|
| **Node.js** | ≥ 18.x | [nodejs.org](https://nodejs.org/) |
| **Python** | ≥ 3.9 | [python.org](https://www.python.org/downloads/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **MongoDB** | ≥ 6.0 (local) or Atlas account | [mongodb.com](https://www.mongodb.com/) |

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/agricrop.git
cd agricrop
```

---

## Step 2: Backend Setup

### 2.1 Create Python Virtual Environment

```bash
cd agricrop-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (Command Prompt):
venv\Scripts\activate
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate
```

### 2.2 Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- Flask & extensions (CORS, PyMongo, JWT)
- TensorFlow (for disease detection model)
- scikit-learn (for moisture prediction model)
- bcrypt (password hashing)
- gunicorn (production server)
- Pillow (image processing)

> **Note:** TensorFlow is a large package (~400MB). Installation may take a few minutes.

### 2.3 Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` with your settings:

```env
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-change-in-production
MONGO_URI=mongodb://localhost:27017/agricrop
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
```

#### Using MongoDB Atlas (Remote)

If you don't have MongoDB installed locally:

1. Create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
2. Create a free M0 cluster
3. Get your connection string
4. Update `MONGO_URI` in `.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/agricrop?retryWrites=true&w=majority
   ```

#### Using Local MongoDB

If you have MongoDB installed locally, the default URI works:
```
MONGO_URI=mongodb://localhost:27017/agricrop
```

### 2.4 Start the Backend Server

```bash
python run.py
```

Expected output:
```
 * Loading AI models...
 * Disease detection model initialized
 * Soil moisture model initialized
 * Creating MongoDB indexes...
 * Running on http://0.0.0.0:5000
```

> **First Run Note:** The first startup will:
> 1. Create AI models with synthetic training data (takes 30-60 seconds)
> 2. Create MongoDB geospatial indexes
> 3. Create the uploads directory

### 2.5 Verify Backend

Open a browser or use curl:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "AgriCrop API is running",
  "data": { "version": "1.0.0", "status": "healthy" }
}
```

---

## Step 3: Frontend Setup

Open a **new terminal window** (keep the backend running).

### 3.1 Install Node Dependencies

```bash
cd agricrop-frontend
npm install
```

### 3.2 Configure API URL (Optional)

By default, the frontend proxies API requests to `http://localhost:5000` via Vite config.

To override, create `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3.3 Start the Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v6.0.0  ready in 500ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

### 3.4 Access the Application

Open `http://localhost:5173` in your browser.

---

## Step 4: First-Time Usage

### Register an Account

1. Click **"Get Started"** on the landing page
2. Fill in the registration form:
   - Full Name
   - Email
   - Password (min 6 characters)
3. You'll be redirected to the dashboard

### Add a Farm

1. Navigate to **Farms** page
2. Click **"Add Farm"**
3. Fill in field details:
   - Field Name
   - Crop Type
   - Latitude & Longitude
   - Area (acres)
4. Click **Save**

### Detect a Disease

1. Navigate to **Disease Detection** page
2. Upload a leaf image (JPG, PNG, JPEG)
3. Click **Analyze**
4. View the diagnosis results

### Predict Soil Moisture

1. Navigate to **Soil Moisture** page
2. Enter environmental parameters:
   - Temperature, Humidity, Rainfall, Wind Speed, Soil Type
3. Click **Predict**
4. View moisture level, risk assessment, and recommendations

---

## Development Tips

### Backend Hot Reload

Flask development mode auto-reloads on file changes:
```env
FLASK_ENV=development
FLASK_DEBUG=True
```

### Frontend Hot Reload

Vite provides instant hot module replacement (HMR) out of the box.

### Testing API Endpoints

Use tools like:
- **Postman** — GUI API client
- **Thunder Client** — VS Code extension
- **curl** — Command line

Example API test flow:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Use the returned token for protected endpoints
curl http://localhost:5000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### MongoDB GUI

For viewing/managing your database:
- **MongoDB Compass** — Official desktop GUI
- **MongoDB Atlas UI** — Web-based (for Atlas clusters)

### Retraining AI Models

```bash
cd agricrop-backend

# Retrain disease model (synthetic data)
python -m ai.disease_model.train

# Retrain moisture model (synthetic data)
python -m ai.moisture_model.train
```

To train with real data, provide a data directory:
```bash
python -m ai.disease_model.train --data_dir /path/to/plant-images
python -m ai.moisture_model.train --data_path /path/to/moisture.csv
```

---

## Common Issues

### Port Already in Use

```bash
# Find process using port 5000 (Windows)
netstat -ano | findstr :5000
# Kill it
taskkill /PID <PID> /F

# Find process using port 5173 (Windows)
netstat -ano | findstr :5173
```

### TensorFlow Installation Issues

If TensorFlow fails to install:
```bash
# Try installing with specific version
pip install tensorflow==2.19.0

# On Apple Silicon (M1/M2)
pip install tensorflow-macos==2.19.0
```

### MongoDB Connection Refused

- Ensure MongoDB is running: `mongosh` should connect
- For Atlas: Check your IP is whitelisted
- Verify connection string format

### CORS Errors in Browser

If you see CORS errors, ensure:
1. Backend is running on port 5000
2. Vite proxy is configured in `vite.config.js`
3. Flask-CORS is initialized in the app factory

---

## Project Scripts

### Backend
```bash
python run.py                          # Start development server
gunicorn run:app                       # Start production server
python -m ai.disease_model.train       # Train disease model
python -m ai.moisture_model.train      # Train moisture model
```

### Frontend
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
```

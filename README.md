# 🌿 AgriCrop – Geospatial Plant Disease & Soil Moisture Intelligence Network

<div align="center">

![AgriCrop](https://img.shields.io/badge/AgriCrop-Smart%20Agriculture-2E7D32?style=for-the-badge&logo=leaf&logoColor=white)
![Version](https://img.shields.io/badge/Version-1.0.0-4CAF50?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-6D4C41?style=for-the-badge)

**An AI-powered agricultural intelligence platform that helps smallholder farmers detect crop diseases, predict soil moisture levels, and monitor outbreaks geographically.**

[Live Demo](#) · [API Docs](docs/API_DOCS.md) · [Deployment Guide](docs/DEPLOYMENT.md) · [Setup Guide](docs/SETUP.md)

</div>

---

## 🚀 Features

### 🔬 Disease Detection
- Upload leaf images for instant AI-powered disease diagnosis
- MobileNetV2 transfer learning model with 5 disease classes
- Confidence scoring with detailed symptoms, prevention, and treatment info

### 💧 Soil Moisture Prediction
- Predict moisture levels from environmental parameters
- Random Forest regression model
- Water requirement and evaporation rate calculations
- Irrigation recommendations

### 🗺️ Geospatial Monitoring
- Interactive disease outbreak map with Leaflet.js
- MongoDB 2dsphere geospatial queries
- Heatmap visualization for disease density
- Marker clustering and color-coded risk levels

### 🌾 Farm Management
- Full CRUD operations for farm fields
- Track crop types, disease status, and coordinates
- Farm health scoring

### 📊 Analytics Dashboard
- Disease distribution charts
- Moisture trends over time
- Farm health scoring
- High-risk zone identification

### 🔔 Smart Alerts
- Automated disease alerts (confidence > 80%)
- Moisture threshold warnings
- Notification center with read/unread tracking

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, Vite, Tailwind CSS, Framer Motion, Leaflet.js, Chart.js |
| **Backend** | Python Flask, REST APIs, JWT Authentication |
| **Database** | MongoDB Atlas with 2dsphere Geospatial Indexing |
| **AI/ML** | TensorFlow (MobileNetV2), scikit-learn (Random Forest) |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## 📁 Project Structure

```
agricrop/
├── agricrop-frontend/          # React + Vite Frontend
│   ├── src/
│   │   ├── api/                # API service layer
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Buttons, Cards, Modals
│   │   │   ├── charts/         # Chart.js wrappers
│   │   │   ├── map/            # Leaflet components
│   │   │   └── layout/         # Navbar, Sidebar
│   │   ├── contexts/           # Auth & Alert providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   └── utils/              # Helpers & constants
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── agricrop-backend/           # Flask Backend
│   ├── app/
│   │   ├── models/             # MongoDB document models
│   │   ├── routes/             # API route blueprints
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # JWT & error handling
│   │   └── utils/              # Validators & helpers
│   ├── ai/
│   │   ├── disease_model/      # MobileNetV2 pipeline
│   │   ├── moisture_model/     # Random Forest pipeline
│   │   └── models/             # Saved model files
│   └── run.py
│
└── docs/                       # Documentation
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.9
- **MongoDB Atlas** account (or local MongoDB)
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/agricrop.git
cd agricrop
```

### 2. Backend Setup

```bash
cd agricrop-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and secret keys

# Start the server
python run.py
```

The backend will start on `http://localhost:5000`.

> **Note**: On first run, AI models will be auto-generated using synthetic training data. For production, retrain with real agricultural datasets.

### 3. Frontend Setup

```bash
cd agricrop-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`.

### 4. Access the Application

Open `http://localhost:5173` in your browser. Register a new account to get started.

---

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` in the backend directory:

```env
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/agricrop
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
```

### Frontend Configuration

Set the API URL in `agricrop-frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🤖 AI Models

### Disease Detection Model

- **Architecture**: MobileNetV2 (ImageNet pre-trained) + Custom classification head
- **Input**: 224×224 RGB leaf images
- **Classes**: Healthy, Leaf Spot, Rust, Blight, Powdery Mildew
- **Output**: Disease name, confidence score, symptoms, prevention, treatment

### Soil Moisture Model

- **Architecture**: Random Forest Regressor (scikit-learn)
- **Inputs**: Temperature, Humidity, Rainfall, Wind Speed, Soil Type
- **Outputs**: Moisture Level (%), Evaporation Rate (mm/day), Water Requirement (L/acre)

### Retraining Models

```bash
# Train disease detection model with custom data
cd agricrop-backend
python -m ai.disease_model.train --data_dir /path/to/plant-images

# Train moisture model with custom data
python -m ai.moisture_model.train --data_path /path/to/moisture-data.csv
```

---

## 📡 API Documentation

See [API_DOCS.md](docs/API_DOCS.md) for complete API documentation.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with JWT |
| POST | `/api/disease/predict` | Predict disease from image |
| POST | `/api/moisture/predict` | Predict soil moisture |
| GET | `/api/fields` | List farm fields |
| GET | `/api/map/outbreaks` | Get outbreak data |
| GET | `/api/analytics/dashboard` | Dashboard statistics |

---

## 🚀 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Frontend → Vercel**
```bash
cd agricrop-frontend
npm run build
# Deploy via Vercel CLI or GitHub integration
```

**Backend → Render**
- Connect GitHub repository
- Render auto-detects `render.yaml` configuration
- Set environment variables in Render dashboard

**Database → MongoDB Atlas**
- Create a free M0 cluster
- Whitelist Render IP addresses
- Copy connection string to backend `.env`

---

## 📸 Screenshots

### Dashboard
Premium analytics dashboard with animated statistics, disease distribution charts, and moisture trends.

### Disease Detection
AI-powered leaf disease analysis with detailed diagnosis results including symptoms and treatment.

### Geospatial Map
Interactive outbreak map with color-coded markers, heatmap visualization, and advanced filtering.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Team

Built with ❤️ for smallholder farmers worldwide.

---

<div align="center">

**🌱 AgriCrop — Empowering Farmers with AI Intelligence 🌱**

</div>

# 📡 AgriCrop API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-backend.onrender.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained via the `/auth/login` or `/auth/register` endpoints.

---

## Response Format

All API responses follow this consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🔐 Auth APIs

### POST `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "full_name": "John Farmer",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789012345",
      "full_name": "John Farmer",
      "email": "john@example.com"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**
- 400: Missing required fields
- 400: Invalid email format
- 400: Password must be at least 6 characters
- 409: Email already registered

---

### POST `/auth/login`

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789012345",
      "full_name": "John Farmer",
      "email": "john@example.com",
      "profile": {
        "location": "Punjab, India",
        "farm_area": 5.5,
        "crop_type": "Wheat"
      }
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**
- 400: Missing email or password
- 401: Invalid email or password

---

### GET `/auth/profile`

Get current user's profile. **Requires authentication.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "64a1b2c3d4e5f6789012345",
    "full_name": "John Farmer",
    "email": "john@example.com",
    "profile": {
      "location": "Punjab, India",
      "farm_area": 5.5,
      "crop_type": "Wheat"
    },
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### PUT `/auth/profile`

Update farmer profile. **Requires authentication.**

**Request Body:**
```json
{
  "full_name": "John Farmer Updated",
  "location": "Maharashtra, India",
  "farm_area": 8.0,
  "crop_type": "Rice"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

## 🔬 Disease Detection APIs

### POST `/disease/predict`

Upload a leaf image for disease prediction. **Requires authentication.**

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image | File | Yes | Leaf image (JPG, JPEG, PNG) |
| latitude | Float | No | Location latitude |
| longitude | Float | No | Location longitude |

**Response (200):**
```json
{
  "success": true,
  "message": "Disease prediction completed",
  "data": {
    "report_id": "64a1b2c3d4e5f6789012345",
    "disease_name": "Leaf Spot",
    "confidence": 87.5,
    "description": "Leaf spot diseases are caused by various fungi and bacteria...",
    "symptoms": [
      "Small, dark brown or black spots on leaves",
      "Spots may have yellow halos",
      "Premature leaf drop in severe cases"
    ],
    "prevention": [
      "Use disease-resistant crop varieties",
      "Practice crop rotation every 2-3 years",
      "Avoid overhead irrigation to reduce leaf wetness"
    ],
    "treatment": [
      "Apply copper-based fungicide spray",
      "Remove and destroy infected leaves",
      "Apply neem oil as an organic alternative"
    ],
    "all_predictions": {
      "Healthy": 5.2,
      "Leaf Spot": 87.5,
      "Rust": 3.1,
      "Blight": 2.8,
      "Powdery Mildew": 1.4
    }
  }
}
```

**Errors:**
- 400: No image file provided
- 400: Invalid file format (only JPG, JPEG, PNG)
- 413: File too large (max 16MB)

---

### GET `/disease/reports`

Get user's disease detection history. **Requires authentication.**

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | Integer | 20 | Max results to return |
| page | Integer | 1 | Page number |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "64a1b2c3d4e5f6789012345",
        "disease_name": "Leaf Spot",
        "confidence": 87.5,
        "image_url": "/uploads/image123.jpg",
        "created_at": "2024-01-15T14:30:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET `/disease/reports/:id`

Get a specific disease report. **Requires authentication.**

**Response (200):** Full disease report object (same as predict response).

---

## 💧 Moisture Prediction APIs

### POST `/moisture/predict`

Predict soil moisture from environmental parameters. **Requires authentication.**

**Request Body:**
```json
{
  "temperature": 32.5,
  "humidity": 65.0,
  "rainfall": 12.5,
  "wind_speed": 8.0,
  "soil_type": "Loamy"
}
```

**Soil Types:** `Sandy`, `Loamy`, `Clay`, `Silt`, `Peaty`, `Chalky`

**Response (200):**
```json
{
  "success": true,
  "message": "Moisture prediction completed",
  "data": {
    "report_id": "64a1b2c3d4e5f6789012345",
    "moisture_level": 45.2,
    "evaporation_rate": 3.8,
    "water_requirement": 2500,
    "risk_level": "Medium",
    "recommendations": [
      "Consider scheduling irrigation within the next 24-48 hours",
      "Loamy soil retains moisture well - moderate watering recommended",
      "Apply mulch to reduce evaporation rate",
      "Monitor soil moisture levels daily during hot weather"
    ]
  }
}
```

**Errors:**
- 400: Missing required fields
- 400: Invalid soil type
- 400: Values out of valid range

---

### GET `/moisture/reports`

Get user's moisture prediction history. **Requires authentication.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "64a1b2c3d4e5f6789012345",
        "moisture_level": 45.2,
        "risk_level": "Medium",
        "inputs": { ... },
        "created_at": "2024-01-15T14:30:00Z"
      }
    ]
  }
}
```

---

## 🌾 Field Management APIs

### GET `/fields`

List all fields for the authenticated user. **Requires authentication.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "fields": [
      {
        "id": "64a1b2c3d4e5f6789012345",
        "field_name": "North Paddy Field",
        "crop_type": "Rice",
        "location": {
          "type": "Point",
          "coordinates": [78.9629, 20.5937]
        },
        "area": 3.5,
        "disease_status": "Healthy",
        "last_inspection": "2024-01-15T14:30:00Z",
        "created_at": "2024-01-10T10:00:00Z"
      }
    ]
  }
}
```

---

### POST `/fields`

Create a new field. **Requires authentication.**

**Request Body:**
```json
{
  "field_name": "North Paddy Field",
  "crop_type": "Rice",
  "latitude": 20.5937,
  "longitude": 78.9629,
  "area": 3.5,
  "disease_status": "Healthy"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Field created successfully",
  "data": { ... }
}
```

---

### PUT `/fields/:id`

Update a field. **Requires authentication.**

**Request Body:** Same as POST (all fields optional).

**Response (200):**
```json
{
  "success": true,
  "message": "Field updated successfully",
  "data": { ... }
}
```

---

### DELETE `/fields/:id`

Delete a field. **Requires authentication.**

**Response (200):**
```json
{
  "success": true,
  "message": "Field deleted successfully"
}
```

---

## 🗺️ Map APIs

### GET `/map/outbreaks`

Get disease outbreak data for map visualization. **Requires authentication.**

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| crop_type | String | Filter by crop type |
| disease_name | String | Filter by disease |
| min_lat | Float | Bounding box minimum latitude |
| max_lat | Float | Bounding box maximum latitude |
| min_lng | Float | Bounding box minimum longitude |
| max_lng | Float | Bounding box maximum longitude |
| days | Integer | Filter to last N days (default: 30) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "outbreaks": [
      {
        "id": "64a1b2c3d4e5f6789012345",
        "disease_name": "Blight",
        "confidence": 92.3,
        "location": {
          "type": "Point",
          "coordinates": [78.9629, 20.5937]
        },
        "crop_type": "Rice",
        "risk_level": "High",
        "created_at": "2024-01-15T14:30:00Z"
      }
    ],
    "total": 42
  }
}
```

---

### GET `/map/heatmap`

Get aggregated disease density data. **Requires authentication.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "points": [
      [20.5937, 78.9629, 0.8],
      [19.0760, 72.8777, 0.6]
    ]
  }
}
```

Each point: `[latitude, longitude, intensity]`

---

## 📊 Analytics APIs

### GET `/analytics/dashboard`

Get dashboard overview statistics. **Requires authentication.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_farms": 12,
    "active_diseases": 5,
    "avg_moisture": 52.3,
    "high_risk_zones": 3,
    "recent_reports": [ ... ],
    "recent_alerts": [ ... ]
  }
}
```

---

### GET `/analytics/disease-distribution`

Get disease type distribution. **Requires authentication.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "distribution": {
      "Healthy": 45,
      "Leaf Spot": 18,
      "Rust": 12,
      "Blight": 20,
      "Powdery Mildew": 5
    }
  }
}
```

---

### GET `/analytics/moisture-trends`

Get moisture level trends over time. **Requires authentication.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trends": [
      { "date": "2024-01-01", "avg_moisture": 55.2 },
      { "date": "2024-01-02", "avg_moisture": 48.7 },
      { "date": "2024-01-03", "avg_moisture": 62.1 }
    ]
  }
}
```

---

### GET `/analytics/farm-health`

Get farm health scores. **Requires authentication.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "farms": [
      {
        "field_name": "North Paddy Field",
        "health_score": 85,
        "disease_count": 1,
        "avg_moisture": 55.2,
        "risk_level": "Low"
      }
    ]
  }
}
```

---

## 🔔 Alert APIs

### GET `/alerts`

Get user's notifications. **Requires authentication.**

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| type | String | all | Filter: `all`, `disease_alert`, `moisture_alert`, `system` |
| limit | Integer | 50 | Max results |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "64a1b2c3d4e5f6789012345",
        "type": "disease_alert",
        "title": "High Confidence Disease Detected",
        "message": "Blight detected with 92.3% confidence on your Rice field",
        "severity": "critical",
        "is_read": false,
        "created_at": "2024-01-15T14:30:00Z"
      }
    ],
    "unread_count": 3
  }
}
```

---

### PUT `/alerts/:id/read`

Mark a notification as read. **Requires authentication.**

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### PUT `/alerts/read-all`

Mark all notifications as read. **Requires authentication.**

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### GET `/alerts/unread-count`

Get count of unread notifications. **Requires authentication.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "unread_count": 3
  }
}
```

---

## 🏥 Health Check

### GET `/health`

Check API health status. **No authentication required.**

**Response (200):**
```json
{
  "success": true,
  "message": "AgriCrop API is running",
  "data": {
    "version": "1.0.0",
    "status": "healthy"
  }
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider using `flask-limiter`:

```python
from flask_limiter import Limiter
limiter = Limiter(app, default_limits=["100 per hour"])
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 409 | Conflict - Resource already exists |
| 413 | Payload Too Large |
| 500 | Internal Server Error |

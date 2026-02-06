# System Architecture Documentation

## Emotion Detection from Text (Chat Analyzer)

---

## 1. Overview

This document describes the system architecture of the Emotion Detection web application, including component design, data flow, communication patterns, and deployment architecture.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Web Browser                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │   React     │  │  Tailwind   │  │   Vite      │  │  Lucide    │ │   │
│  │  │ Components  │  │    CSS      │  │   Build     │  │   Icons    │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ HTTP/HTTPS
                                       │ REST API (JSON)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Nginx Server                                 │   │
│  │     (Reverse Proxy, Load Balancer, SSL Termination)                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Flask Application                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │   Routes    │  │   CORS      │  │   Input     │  │   Error    │ │   │
│  │  │  (/predict) │  │   Handler   │  │ Validation  │  │  Handler   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MACHINE LEARNING LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    EmotionPredictor Class                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │  Text       │  │   TF-IDF    │  │ Multinomial │  │  Output    │ │   │
│  │  │Preprocessor │→ │ Vectorizer  │→ │     NB      │→ │ Formatter  │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  Model Files    │  │  Dataset Files  │  │    Prediction History       │  │
│  │  (Pickle)       │  │  (CSV)          │  │    (In-Memory/Database)     │  │
│  │                 │  │                 │  │                             │  │
│  │ • emotion_model │  │ • emotion_      │  │ • Recent predictions        │  │
│  │ • tfidf_vector  │  │   dataset.csv   │  │ • Timestamps                │  │
│  │ • model_info    │  │                 │  │ • Confidence scores         │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Architecture

### 3.1 Frontend Components

```
src/
├── App.tsx                 # Main application component
├── components/
│   ├── EmotionInput.tsx    # Text input with analysis button
│   ├── EmotionResult.tsx   # Result display with visualization
│   ├── HistoryPanel.tsx    # Analysis history sidebar
│   ├── EmotionBadge.tsx    # Emotion label with emoji
│   └── ConfidenceBar.tsx   # Progress bar for confidence
├── hooks/
│   ├── useEmotionApi.ts    # API communication hook
│   └── useHistory.ts       # History management hook
└── types/
    └── emotion.ts          # TypeScript interfaces
```

### 3.2 Backend Components

```
backend/
├── app.py                  # Flask application entry point
├── config.py               # Configuration settings
├── routes/
│   ├── predict.py          # Prediction endpoints
│   ├── health.py           # Health check endpoints
│   └── history.py          # History management endpoints
├── services/
│   ├── emotion_predictor.py # ML prediction service
│   └── text_processor.py   # Text preprocessing service
└── utils/
    ├── validators.py       # Input validation
    └── formatters.py       # Response formatting
```

### 3.3 ML Pipeline Components

```
ml_model/
├── train_emotion_model.py  # Training script
├── evaluate_model.py       # Evaluation script
└── utils/
    ├── preprocessing.py    # Text preprocessing
    └── feature_extraction.py # TF-IDF vectorization
```

---

## 4. Data Flow

### 4.1 Single Prediction Flow

```
User Input
    │
    ▼
┌─────────────────┐
│  React Frontend │
│  Text Input     │
└────────┬────────┘
         │ HTTP POST /predict
         │ {text: "I am happy!"}
         ▼
┌─────────────────┐
│  Flask Backend  │
│  Receive Request│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Input          │
│  Validation     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Text           │
│  Preprocessing  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  TF-IDF         │
│  Vectorization  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Multinomial NB │
│  Prediction     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Format         │
│  Response       │
└────────┬────────┘
         │ JSON Response
         ▼
┌─────────────────┐
│  React Frontend │
│  Display Result │
└─────────────────┘
```

### 4.2 Batch Prediction Flow

```
Multiple Texts
    │
    ▼
┌─────────────────┐     ┌─────────────────┐
│  Flask Backend  │────►│  Parallel       │
│  /predict/batch │     │  Processing     │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
               ┌────────┐   ┌────────┐   ┌────────┐
               │ Text 1 │   │ Text 2 │   │ Text N │
               └───┬────┘   └───┬────┘   └───┬────┘
                   │            │            │
                   └────────────┼────────────┘
                                ▼
                         ┌─────────────┐
                         │  Aggregate  │
                         │  Results    │
                         └──────┬──────┘
                                │
                                ▼
                         ┌─────────────┐
                         │  JSON       │
                         │  Response   │
                         └─────────────┘
```

---

## 5. Communication Patterns

### 5.1 Frontend-Backend Communication

| Aspect | Implementation |
|--------|----------------|
| Protocol | HTTP/1.1 or HTTP/2 |
| Data Format | JSON |
| CORS | Enabled for cross-origin requests |
| Authentication | None (can add JWT) |
| Rate Limiting | Not implemented (can add Flask-Limiter) |

### 5.2 API Endpoints

```
GET  /health              → Health check
GET  /emotions            → List emotions
POST /predict             → Single prediction
POST /predict/batch       → Batch prediction
GET  /history             → Get history
POST /history/clear       → Clear history
POST /analyze             → Conversation analysis
```

### 5.3 Request/Response Format

**Request (POST /predict):**
```json
{
  "text": "string (required, max 1000 chars)",
  "save_history": "boolean (optional, default: true)"
}
```

**Response:**
```json
{
  "success": "boolean",
  "emotion": "string",
  "confidence": "number (0-100)",
  "emoji": "string",
  "color": "string (hex)",
  "description": "string",
  "intensity": "string (positive/negative/neutral)",
  "all_probabilities": "object",
  "original_text": "string"
}
```

---

## 6. Database Schema

### 6.1 Prediction History (In-Memory)

```javascript
{
  id: UUID,
  timestamp: ISO8601,
  original_text: String,
  emotion: String,
  confidence: Number,
  emoji: String
}
```

### 6.2 For Production (PostgreSQL)

```sql
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    original_text TEXT NOT NULL,
    processed_text TEXT,
    emotion VARCHAR(50) NOT NULL,
    confidence DECIMAL(5,2),
    probabilities JSONB,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(100)
);

CREATE INDEX idx_predictions_timestamp ON predictions(timestamp);
CREATE INDEX idx_predictions_emotion ON predictions(emotion);
CREATE INDEX idx_predictions_user ON predictions(user_id);
```

---

## 7. Security Considerations

### 7.1 Input Validation

- Maximum text length: 1000 characters
- HTML/script tag sanitization
- Unicode normalization

### 7.2 CORS Configuration

```python
CORS(app, resources={
    r"/predict": {
        "origins": ["http://localhost:5173", "https://yourdomain.com"],
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})
```

### 7.3 Rate Limiting (Recommended)

```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["100 per hour"]
)

@app.route('/predict', methods=['POST'])
@limiter.limit("10 per minute")
def predict():
    ...
```

---

## 8. Scalability Considerations

### 8.1 Horizontal Scaling

```
                    ┌─────────────┐
                    │   Nginx     │
                    │  (Load      │
                    │  Balancer)  │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Flask App  │ │  Flask App  │ │  Flask App  │
    │   (Gunicorn)│ │   (Gunicorn)│ │   (Gunicorn)│
    │   Worker 1  │ │   Worker 2  │ │   Worker 3  │
    └─────────────┘ └─────────────┘ └─────────────┘
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                    ┌─────────────┐
                    │    Redis    │
                    │   (Cache)   │
                    └─────────────┘
```

### 8.2 Caching Strategy

- Cache frequent predictions (Redis)
- Cache model predictions for identical inputs
- TTL: 1 hour for predictions

---

## 9. Monitoring & Logging

### 9.1 Application Metrics

| Metric | Description |
|--------|-------------|
| request_count | Total API requests |
| prediction_latency | Time to predict (ms) |
| emotion_distribution | Count per emotion |
| error_rate | Failed requests % |

### 9.2 Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

---

## 10. Deployment Architecture

### 10.1 Local Development

```
┌─────────────────────────────────────────┐
│           Development Machine            │
│                                          │
│  ┌─────────────┐    ┌─────────────┐     │
│  │  Flask      │    │  React      │     │
│  │  :5000      │◄──►│  :5173      │     │
│  │  (Python)   │    │  (Node.js)  │     │
│  └─────────────┘    └─────────────┘     │
│                                          │
└─────────────────────────────────────────┘
```

### 10.2 Production Deployment

```
┌─────────────────────────────────────────┐
│           Production Server              │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │           Nginx                 │    │
│  │      (Port 80/443)              │    │
│  │  ┌─────────┐    ┌─────────┐    │    │
│  │  │ Static  │    │  /api   │    │    │
│  │  │ Files   │    │  Proxy  │    │    │
│  │  └───┬─────┘    └────┬────┘    │    │
│  │      │               │         │    │
│  └──────┼───────────────┼─────────┘    │
│         │               │              │
│         ▼               ▼              │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  Frontend   │  │   Gunicorn  │      │
│  │  (Built)    │  │   Workers   │      │
│  │             │  │   (Flask)   │      │
│  └─────────────┘  └─────────────┘      │
│                                          │
└─────────────────────────────────────────┘
```

---

## 11. Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React + TypeScript | UI framework |
| Styling | Tailwind CSS | CSS framework |
| Components | shadcn/ui | UI components |
| Build Tool | Vite | Bundler |
| Backend | Flask | Web framework |
| ML | scikit-learn | Machine learning |
| Server | Gunicorn | WSGI server |
| Proxy | Nginx | Reverse proxy |
| SSL | Let's Encrypt | HTTPS certificates |

---

## 12. Future Architecture Enhancements

### 12.1 Microservices

```
┌─────────────────────────────────────────┐
│              API Gateway                 │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌────────┐  ┌────────┐  ┌────────┐
│Predict │  │History │  │  Auth  │
│Service │  │Service │  │Service │
└────┬───┘  └────┬───┘  └────┬───┘
     │           │           │
     └───────────┼───────────┘
                 ▼
          ┌────────────┐
          │  Database  │
          │ (PostgreSQL)│
          └────────────┘
```

### 12.2 Container Orchestration

```
┌─────────────────────────────────────────┐
│           Kubernetes Cluster             │
│                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Frontend│ │ Backend │ │  ML     │   │
│  │   Pod   │ │   Pod   │ │  Pod    │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                          │
│  ┌─────────┐ ┌─────────┐               │
│  │  Redis  │ │PostgreSQL│               │
│  │   Pod   │ │   Pod   │               │
│  └─────────┘ └─────────┘               │
│                                          │
└─────────────────────────────────────────┘
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-06  
**Author**: Senior System Architect

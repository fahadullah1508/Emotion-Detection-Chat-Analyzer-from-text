# Emotion Detection from Text (Chat Analyzer)

![Emotion Detection](https://img.shields.io/badge/ML-Emotion%20Detection-blue)
![Flask](https://img.shields.io/badge/Backend-Flask-green)
![React](https://img.shields.io/badge/Frontend-React-blue)
![scikit-learn](https://img.shields.io/badge/ML%20Library-scikit--learn-orange)

A complete, production-ready Data Science web application for detecting emotions from text using Machine Learning. This system analyzes written conversations and detects emotions including **Happiness**, **Anger**, **Sadness**, **Stress**, and **Neutral**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Dataset](#dataset)
6. [Machine Learning Model](#machine-learning-model)
7. [Installation & Setup](#installation--setup)
8. [Usage](#usage)
9. [API Documentation](#api-documentation)
10. [Deployment](#deployment)
11. [Project Structure](#project-structure)
12. [Future Improvements](#future-improvements)

---

## Project Overview

This application provides:

- **Real-time emotion detection** from text input
- **Confidence scores** for each prediction
- **Analysis history** tracking
- **Batch processing** capabilities
- **Conversation analysis** for chat logs
- **RESTful API** for integration

### Use Cases

- **Customer Support Analysis**: Understand customer emotions in support tickets
- **Mental Health Monitoring**: Track emotional states in journal entries
- **Human-Computer Interaction**: Improve chatbot responses based on user emotions
- **Social Media Monitoring**: Analyze sentiment in posts and comments

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EMOTION DETECTION SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐      HTTP/REST      ┌─────────────────────────────┐   │
│  │                 │ ◄─────────────────► │                             │   │
│  │   REACT         │      CORS Enabled   │      FLASK BACKEND          │   │
│  │   FRONTEND      │                     │      (Python 3.8+)          │   │
│  │                 │                     │                             │   │
│  │  • TypeScript   │                     │  ┌─────────────────────┐    │   │
│  │  • Tailwind CSS │                     │  │  REST API Endpoints │    │   │
│  │  • shadcn/ui    │                     │  │  • /predict         │    │   │
│  │  • Vite         │                     │  │  • /health          │    │   │
│  │                 │                     │  │  • /history         │    │   │
│  └─────────────────┘                     │  │  • /analyze         │    │   │
│           │                              │  └─────────────────────┘    │   │
│           │                              │           │                 │   │
│           │                              │           ▼                 │   │
│           │                              │  ┌─────────────────────┐    │   │
│           │                              │  │   ML MODEL (Pickle) │    │   │
│           │                              │  │  • Multinomial NB   │    │   │
│           │                              │  │  • TF-IDF Vectorizer│    │   │
│           │                              │  └─────────────────────┘    │   │
│           │                              │                             │   │
│           │                              └─────────────────────────────┘   │
│           │                                              │                  │
│           │                    DATA FLOW                 │                  │
│           │                                              ▼                  │
│           │                              ┌─────────────────────────────┐   │
│           └─────────────────────────────►│      PREDICTION RESULT      │   │
│                                          │  • Emotion Label            │   │
│                                          │  • Confidence Score         │   │
│                                          │  • Probability Distribution │   │
│                                          └─────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Input**: User enters text in the React frontend
2. **API Request**: Frontend sends POST request to `/predict` endpoint
3. **Preprocessing**: Flask backend preprocesses text (tokenization, cleaning)
4. **Vectorization**: TF-IDF vectorizer transforms text to numerical features
5. **Prediction**: Trained ML model predicts emotion class
6. **Response**: Backend returns emotion label, confidence, and probabilities
7. **Display**: Frontend renders results with visualizations

---

## Features

### Core Features

- ✅ **5 Emotion Classes**: Happiness, Anger, Sadness, Stress, Neutral
- ✅ **Real-time Analysis**: Instant emotion detection
- ✅ **Confidence Scoring**: Probability scores for all emotions
- ✅ **History Tracking**: View past analyses
- ✅ **Batch Processing**: Analyze multiple texts at once
- ✅ **Conversation Analysis**: Analyze entire chat conversations

### Frontend Features

- 🎨 **Modern UI**: Clean, professional interface with Tailwind CSS
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🌙 **Dark Mode Support**: Automatic theme detection
- 📊 **Visualizations**: Progress bars, emotion distribution charts
- ⚡ **Fast Loading**: Optimized React build with Vite

### Backend Features

- 🔒 **Input Validation**: Sanitization and length limits
- 📝 **Error Handling**: Comprehensive error responses
- 🌐 **CORS Enabled**: Cross-origin requests supported
- 💾 **In-Memory History**: Quick access to recent predictions
- 🔍 **Health Checks**: Server status monitoring

---

## Technology Stack

### Machine Learning / Data Science

| Component | Technology | Version |
|-----------|------------|---------|
| Language | Python | 3.8+ |
| ML Library | scikit-learn | 1.3.2 |
| NLP | Custom preprocessing | - |
| Vectorization | TF-IDF | - |
| Model | Multinomial Naive Bayes | - |
| Data Processing | pandas, numpy | 2.0.3, 1.24.3 |

### Backend

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Flask | 3.0.0 |
| CORS | flask-cors | 4.0.0 |
| Server | Gunicorn | 21.2.0 |

### Frontend

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 18.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4.19 |
| Components | shadcn/ui | - |
| Build Tool | Vite | 7.x |
| Icons | Lucide React | - |

---

## Dataset

### Overview

The model is trained on a curated dataset of 125 text samples across 5 emotion categories:

| Emotion | Samples | Description |
|---------|---------|-------------|
| Happiness | 25 | Joyful, content, pleased expressions |
| Anger | 25 | Irritated, frustrated, furious expressions |
| Sadness | 25 | Unhappy, sorrowful, depressed expressions |
| Stress | 25 | Anxious, overwhelmed, tense expressions |
| Neutral | 25 | Factual, emotionless statements |

### Dataset Structure

```csv
text,emotion
"I am so happy today!",happiness
"This makes me so angry!",anger
"I feel so sad...",sadness
```

### Data Preprocessing Pipeline

1. **Lowercasing**: Convert all text to lowercase
2. **URL Removal**: Remove http/https links
3. **Mention/Hashtag Removal**: Clean social media artifacts
4. **Special Character Removal**: Keep only alphabetic characters
5. **Tokenization**: Split text into words
6. **Stopword Removal**: Remove common words (keeping negations)
7. **Length Filtering**: Remove tokens shorter than 3 characters

### For Production Use

For better accuracy in production, consider using:
- **GoEmotions Dataset**: 58,000 Reddit comments with 27 emotion labels
- **CARER Dataset**: Twitter emotion classification dataset
- **Emotion Detection from Text (Kaggle)**: 20,000 samples with 6 emotions

---

## Machine Learning Model

### Model Selection

After evaluating multiple algorithms:

| Model | Accuracy | Precision | Recall | F1-Score |
|-------|----------|-----------|--------|----------|
| **Multinomial Naive Bayes** | **72.00%** | **76.00%** | **72.00%** | **72.75%** |
| Logistic Regression | 72.00% | 74.43% | 72.00% | 72.44% |
| Support Vector Machine | 72.00% | 74.43% | 72.00% | 72.44% |
| Random Forest | 52.00% | 69.67% | 52.00% | 53.60% |

**Selected Model**: Multinomial Naive Bayes (best F1-score)

### Feature Extraction

**TF-IDF Vectorization**:
- Max features: 3,000
- N-gram range: (1, 2) - unigrams and bigrams
- Min document frequency: 1
- Max document frequency: 95%
- Sublinear TF scaling: Enabled

### Model Performance

```
Classification Report:
              precision    recall  f1-score   support

       anger       0.50      0.80      0.62         5
   happiness       0.75      0.60      0.67         5
     neutral       0.75      0.60      0.67         5
     sadness       0.80      0.80      0.80         5
      stress       1.00      0.80      0.89         5

    accuracy                           0.72        25
   macro avg       0.76      0.72      0.73        25
weighted avg       0.76      0.72      0.73        25
```

### Model Files

| File | Description | Size |
|------|-------------|------|
| `emotion_model.pkl` | Trained MultinomialNB model | ~15 KB |
| `tfidf_vectorizer.pkl` | TF-IDF vectorizer | ~45 KB |
| `model_info.pkl` | Model metadata | ~1 KB |

---

## Installation & Setup

### Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd emotion-detection-app
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify model files exist
ls model/
# Should show: emotion_model.pkl, tfidf_vectorizer.pkl, model_info.pkl
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### Step 4: Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
# Server will start on http://localhost:5000
```

**Terminal 2 - Frontend (Development):**
```bash
cd frontend
npm run dev
# Development server on http://localhost:5173
```

**Access the Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

---

## Usage

### Web Interface

1. Open the frontend URL in your browser
2. Enter text in the input area (e.g., "I am so happy today!")
3. Click "Analyze Emotion" button
4. View the detected emotion with confidence score
5. Check the history panel for past analyses

### API Usage

#### Single Prediction

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "I am so happy today!"}'
```

**Response:**
```json
{
  "success": true,
  "emotion": "happiness",
  "confidence": 94.25,
  "emoji": "😊",
  "color": "#FFD700",
  "description": "Joyful, content, or pleased feeling",
  "intensity": "positive",
  "all_probabilities": {
    "happiness": 94.25,
    "anger": 1.23,
    "sadness": 0.45,
    "stress": 2.10,
    "neutral": 1.97
  }
}
```

#### Batch Prediction

```bash
curl -X POST http://localhost:5000/predict/batch \
  -H "Content-Type: application/json" \
  -d '{"texts": ["I am happy!", "This is so frustrating!"]}'
```

#### Conversation Analysis

```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"sender": "user1", "text": "Hello!"},
      {"sender": "user2", "text": "I am so angry about this!"}
    ]
  }'
```

---

## API Documentation

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/emotions` | GET | List supported emotions |
| `/predict` | POST | Predict emotion from text |
| `/predict/batch` | POST | Batch emotion prediction |
| `/history` | GET | Get prediction history |
| `/history/clear` | POST | Clear history |
| `/analyze` | POST | Analyze conversation |

### Request/Response Examples

#### GET /health

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-06T12:00:00",
  "service": "Emotion Detection API",
  "version": "1.0.0",
  "model_loaded": true,
  "supported_emotions": ["happiness", "anger", "sadness", "stress", "neutral"]
}
```

#### POST /predict

**Request Body:**
```json
{
  "text": "I am feeling great today!",
  "save_history": true
}
```

**Response:**
```json
{
  "success": true,
  "emotion": "happiness",
  "confidence": 89.5,
  "emoji": "😊",
  "color": "#FFD700",
  "description": "Joyful, content, or pleased feeling",
  "intensity": "positive",
  "all_probabilities": {...},
  "original_text": "I am feeling great today!"
}
```

---

## Deployment

### Local Deployment

**Using Flask Development Server:**
```bash
cd backend
python app.py
```

**Using Gunicorn (Production):**
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Production Deployment (Linux Server)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3 python3-pip python3-venv -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Nginx
sudo apt install nginx -y
```

#### Step 2: Application Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/emotion-detection
cd /var/www/emotion-detection

# Copy application files
sudo cp -r /path/to/emotion-detection-app/* .

# Setup Python virtual environment
sudo python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Build frontend
cd frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

#### Step 3: Gunicorn Service

Create `/etc/systemd/system/emotion-detection.service`:

```ini
[Unit]
Description=Emotion Detection API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/emotion-detection/backend
Environment="PATH=/var/www/emotion-detection/venv/bin"
ExecStart=/var/www/emotion-detection/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable emotion-detection
sudo systemctl start emotion-detection
```

#### Step 4: Nginx Configuration

Create `/etc/nginx/sites-available/emotion-detection`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/emotion-detection /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Docker Deployment (Optional)

**Dockerfile:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

**Build and Run:**
```bash
docker build -t emotion-detection-api .
docker run -p 5000:5000 emotion-detection-api
```

---

## Project Structure

```
emotion-detection-app/
│
├── backend/                    # Flask Backend
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── model/                 # Trained ML models
│   │   ├── emotion_model.pkl
│   │   ├── tfidf_vectorizer.pkl
│   │   └── model_info.pkl
│   └── data/                  # Backend data storage
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── App.tsx           # Main React component
│   │   ├── App.css           # Custom styles
│   │   ├── main.tsx          # Entry point
│   │   └── components/       # UI components
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── ml_model/                   # ML Training Pipeline
│   ├── train_emotion_model.py
│   └── evaluate_model.py
│
├── data/                       # Datasets
│   └── emotion_dataset.csv
│
├── docs/                       # Documentation
│   ├── architecture.md
│   └── api-reference.md
│
└── README.md                   # This file
```

---

## Future Improvements

### Model Enhancements

1. **Deep Learning Models**
   - Implement LSTM/Bi-LSTM for sequential text processing
   - Use BERT/RoBERTa for contextual embeddings
   - Explore transformer-based architectures

2. **Larger Datasets**
   - Integrate GoEmotions (58K samples)
   - Add CARER dataset
   - Include domain-specific datasets

3. **Feature Engineering**
   - Word2Vec/GloVe embeddings
   - Sentiment lexicons (VADER, AFINN)
   - Part-of-speech features
   - N-gram analysis

### System Improvements

1. **Database Integration**
   - PostgreSQL/MongoDB for persistent storage
   - User authentication and profiles
   - Long-term history retention

2. **Advanced Features**
   - Real-time chat analysis
   - Emotion trend visualization
   - Export reports (PDF, CSV)
   - Multi-language support

3. **Performance Optimization**
   - Redis caching for frequent queries
   - Model quantization for faster inference
   - CDN for static assets

4. **Monitoring & Analytics**
   - Prometheus metrics
   - Grafana dashboards
   - Error tracking (Sentry)
   - Usage analytics

### UI/UX Enhancements

1. **Interactive Visualizations**
   - Emotion trend charts
   - Word clouds for each emotion
   - Confidence distribution graphs

2. **Accessibility**
   - WCAG 2.1 compliance
   - Screen reader support
   - Keyboard navigation

---

## License

This project is licensed under the MIT License.

---

## Contributors

- **Senior Data Scientist & ML Engineer** - Model development and training
- **Full-Stack Developer** - Backend and frontend implementation

---

## Acknowledgments

- scikit-learn team for the excellent ML library
- Flask team for the lightweight web framework
- React team for the frontend library
- shadcn/ui for beautiful UI components

---

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ using Python, Flask, React, and scikit-learn**

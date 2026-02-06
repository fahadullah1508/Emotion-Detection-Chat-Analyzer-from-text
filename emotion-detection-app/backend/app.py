"""
Emotion Detection API - Flask Backend
======================================
REST API for emotion detection from text using a trained ML model.

Endpoints:
- POST /predict: Detect emotion from text
- GET /health: Server health check
- GET /emotions: List supported emotions

Author: Senior ML Engineer
Date: 2026-02-06
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from datetime import datetime
import uuid
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'prediction_history.csv')

# Emotion configuration with emojis and colors
EMOTION_CONFIG = {
    'happiness': {
        'emoji': '😊',
        'color': '#FFD700',
        'description': 'Joyful, content, or pleased feeling',
        'intensity': 'positive'
    },
    'anger': {
        'emoji': '😠',
        'color': '#DC143C',
        'description': 'Irritated, frustrated, or furious feeling',
        'intensity': 'negative'
    },
    'sadness': {
        'emoji': '😢',
        'color': '#4169E1',
        'description': 'Unhappy, sorrowful, or depressed feeling',
        'intensity': 'negative'
    },
    'stress': {
        'emoji': '😰',
        'color': '#FF8C00',
        'description': 'Anxious, overwhelmed, or tense feeling',
        'intensity': 'negative'
    },
    'neutral': {
        'emoji': '😐',
        'color': '#808080',
        'description': 'No strong emotion detected',
        'intensity': 'neutral'
    }
}

# Initialize NLP tools
try:
    lemmatizer = WordNetLemmatizer()
    stop_words = set(stopwords.words('english'))
    # Keep emotion-important words
    EMOTION_WORDS = {'not', 'no', 'never', 'neither', 'nobody', 'nothing', 'nowhere',
                     'hardly', 'barely', 'scarcely', 'rarely', 'seldom'}
    stop_words = stop_words - EMOTION_WORDS
except:
    # Download if not present
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    lemmatizer = WordNetLemmatizer()
    stop_words = set(stopwords.words('english'))


class EmotionPredictor:
    """Emotion prediction class that loads and uses the trained model."""
    
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.model_info = None
        self.load_model()
    
    def load_model(self):
        """Load the trained model and vectorizer."""
        try:
            model_path = os.path.join(MODEL_DIR, 'emotion_model.pkl')
            vectorizer_path = os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl')
            info_path = os.path.join(MODEL_DIR, 'model_info.pkl')
            
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            with open(vectorizer_path, 'rb') as f:
                self.vectorizer = pickle.load(f)
            
            with open(info_path, 'rb') as f:
                self.model_info = pickle.load(f)
            
            logger.info("Model loaded successfully")
            logger.info(f"Model type: {self.model_info['model_name']}")
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def preprocess_text(self, text):
        """
        Preprocess input text for prediction.
        
        Args:
            text (str): Raw input text
            
        Returns:
            str: Preprocessed text
        """
        if not isinstance(text, str):
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove mentions and hashtags
        text = re.sub(r'@\w+|#\w+', '', text)
        
        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Tokenization
        tokens = word_tokenize(text)
        
        # Remove stopwords and lemmatize
        processed_tokens = [
            lemmatizer.lemmatize(token) 
            for token in tokens 
            if token not in stop_words and len(token) > 2
        ]
        
        return ' '.join(processed_tokens)
    
    def predict(self, text):
        """
        Predict emotion from text.
        
        Args:
            text (str): Input text
            
        Returns:
            dict: Prediction results
        """
        try:
            # Preprocess text
            processed_text = self.preprocess_text(text)
            
            if not processed_text:
                return {
                    'success': False,
                    'error': 'Text is empty after preprocessing'
                }
            
            # Vectorize
            text_vector = self.vectorizer.transform([processed_text])
            
            # Predict
            emotion = self.model.predict(text_vector)[0]
            
            # Get probabilities if available
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(text_vector)[0]
                confidence = float(max(probabilities))
                all_probabilities = {
                    label: float(prob) 
                    for label, prob in zip(self.model.classes_, probabilities)
                }
                # Sort by probability
                all_probabilities = dict(sorted(
                    all_probabilities.items(), 
                    key=lambda x: x[1], 
                    reverse=True
                ))
            else:
                confidence = 1.0
                all_probabilities = {emotion: 1.0}
            
            # Get emotion details
            emotion_details = EMOTION_CONFIG.get(emotion, {
                'emoji': '❓',
                'color': '#000000',
                'description': 'Unknown emotion',
                'intensity': 'unknown'
            })
            
            return {
                'success': True,
                'emotion': emotion,
                'confidence': round(confidence * 100, 2),
                'emoji': emotion_details['emoji'],
                'color': emotion_details['color'],
                'description': emotion_details['description'],
                'intensity': emotion_details['intensity'],
                'all_probabilities': {
                    k: round(v * 100, 2) 
                    for k, v in list(all_probabilities.items())[:5]
                },
                'processed_text': processed_text,
                'original_text': text
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


# Initialize predictor
predictor = EmotionPredictor()

# In-memory history storage (use database in production)
prediction_history = []


# ==================== API ENDPOINTS ====================

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    
    Returns:
        JSON with server status and model information.
    """
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'Emotion Detection API',
        'version': '1.0.0',
        'model_loaded': predictor.model is not None,
        'model_type': predictor.model_info['model_name'] if predictor.model_info else None,
        'supported_emotions': list(EMOTION_CONFIG.keys())
    })


@app.route('/emotions', methods=['GET'])
def get_emotions():
    """
    Get list of supported emotions.
    
    Returns:
        JSON with emotion details.
    """
    return jsonify({
        'success': True,
        'emotions': EMOTION_CONFIG,
        'count': len(EMOTION_CONFIG)
    })


@app.route('/predict', methods=['POST'])
def predict_emotion():
    """
    Predict emotion from text.
    
    Request Body:
        {
            "text": "string (required) - text to analyze",
            "save_history": "boolean (optional) - save to history"
        }
    
    Returns:
        JSON with prediction results.
    """
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        text = data.get('text', '').strip()
        save_history = data.get('save_history', True)
        
        # Validate input
        if not text:
            return jsonify({
                'success': False,
                'error': 'Text is required'
            }), 400
        
        if len(text) > 1000:
            return jsonify({
                'success': False,
                'error': 'Text exceeds maximum length of 1000 characters'
            }), 400
        
        # Make prediction
        result = predictor.predict(text)
        
        if result['success'] and save_history:
            # Add to history
            history_entry = {
                'id': str(uuid.uuid4()),
                'timestamp': datetime.utcnow().isoformat(),
                'original_text': text,
                'emotion': result['emotion'],
                'confidence': result['confidence'],
                'emoji': result['emoji']
            }
            prediction_history.insert(0, history_entry)
            
            # Keep only last 100 entries
            if len(prediction_history) > 100:
                prediction_history.pop()
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"API error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Predict emotions for multiple texts.
    
    Request Body:
        {
            "texts": ["string1", "string2", ...]
        }
    
    Returns:
        JSON with batch prediction results.
    """
    try:
        data = request.get_json()
        
        if not data or 'texts' not in data:
            return jsonify({
                'success': False,
                'error': 'Texts array is required'
            }), 400
        
        texts = data['texts']
        
        if not isinstance(texts, list):
            return jsonify({
                'success': False,
                'error': 'Texts must be an array'
            }), 400
        
        if len(texts) > 50:
            return jsonify({
                'success': False,
                'error': 'Maximum 50 texts allowed per batch'
            }), 400
        
        results = []
        for text in texts:
            result = predictor.predict(text)
            results.append(result)
        
        return jsonify({
            'success': True,
            'count': len(results),
            'results': results
        })
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@app.route('/history', methods=['GET'])
def get_history():
    """
    Get prediction history.
    
    Query Parameters:
        limit (int): Maximum number of entries to return (default: 20)
        
    Returns:
        JSON with prediction history.
    """
    try:
        limit = request.args.get('limit', 20, type=int)
        limit = min(limit, 100)  # Max 100
        
        return jsonify({
            'success': True,
            'count': len(prediction_history[:limit]),
            'history': prediction_history[:limit]
        })
        
    except Exception as e:
        logger.error(f"History error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/history/clear', methods=['POST'])
def clear_history():
    """
    Clear prediction history.
    
    Returns:
        JSON with success status.
    """
    global prediction_history
    prediction_history = []
    
    return jsonify({
        'success': True,
        'message': 'History cleared successfully'
    })


@app.route('/analyze', methods=['POST'])
def analyze_conversation():
    """
    Analyze a conversation with multiple messages.
    
    Request Body:
        {
            "messages": [
                {"sender": "user1", "text": "hello"},
                {"sender": "user2", "text": "hi there"}
            ]
        }
    
    Returns:
        JSON with conversation analysis including overall sentiment.
    """
    try:
        data = request.get_json()
        
        if not data or 'messages' not in data:
            return jsonify({
                'success': False,
                'error': 'Messages array is required'
            }), 400
        
        messages = data['messages']
        
        if not isinstance(messages, list):
            return jsonify({
                'success': False,
                'error': 'Messages must be an array'
            }), 400
        
        analyzed_messages = []
        emotion_counts = {}
        total_confidence = 0
        
        for msg in messages:
            if 'text' in msg:
                result = predictor.predict(msg['text'])
                if result['success']:
                    analyzed_msg = {
                        **msg,
                        'emotion': result['emotion'],
                        'confidence': result['confidence'],
                        'emoji': result['emoji']
                    }
                    analyzed_messages.append(analyzed_msg)
                    
                    # Count emotions
                    emotion = result['emotion']
                    emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
                    total_confidence += result['confidence']
        
        # Determine dominant emotion
        dominant_emotion = max(emotion_counts, key=emotion_counts.get) if emotion_counts else 'neutral'
        avg_confidence = total_confidence / len(analyzed_messages) if analyzed_messages else 0
        
        # Calculate sentiment distribution
        positive_emotions = ['happiness']
        negative_emotions = ['anger', 'sadness', 'stress']
        
        positive_count = sum(emotion_counts.get(e, 0) for e in positive_emotions)
        negative_count = sum(emotion_counts.get(e, 0) for e in negative_emotions)
        neutral_count = emotion_counts.get('neutral', 0)
        
        total = len(analyzed_messages)
        
        return jsonify({
            'success': True,
            'total_messages': total,
            'dominant_emotion': dominant_emotion,
            'dominant_emoji': EMOTION_CONFIG.get(dominant_emotion, {}).get('emoji', '😐'),
            'average_confidence': round(avg_confidence, 2),
            'emotion_distribution': emotion_counts,
            'sentiment_summary': {
                'positive': {
                    'count': positive_count,
                    'percentage': round(positive_count / total * 100, 2) if total > 0 else 0
                },
                'negative': {
                    'count': negative_count,
                    'percentage': round(negative_count / total * 100, 2) if total > 0 else 0
                },
                'neutral': {
                    'count': neutral_count,
                    'percentage': round(neutral_count / total * 100, 2) if total > 0 else 0
                }
            },
            'analyzed_messages': analyzed_messages
        })
        
    except Exception as e:
        logger.error(f"Conversation analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    # Create data directory if not exists
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )

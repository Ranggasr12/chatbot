from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import json
import random
import numpy as np
from datetime import datetime
import os
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load model dan dataset
try:
    # Cek file model di beberapa lokasi
    model_paths = [
        'models/trained/model.joblib',
        'models/model.joblib',
        'trained/model.joblib'
    ]
    
    model_loaded = False
    for model_path in model_paths:
        if os.path.exists(model_path):
            print(f"🔍 Found model at: {model_path}")
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            vectorizer = model_data['vectorizer']
            label_encoder = model_data['label_encoder']
            model = model_data['model']
            model_loaded = True
            print("✅ Model loaded successfully")
            break
    
    if not model_loaded:
        print("⚠️  No ML model found, using rule-based fallback only")
        vectorizer = None
        label_encoder = None
        model = None
        
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("⚠️  Using rule-based fallback")
    traceback.print_exc()
    vectorizer = None
    label_encoder = None
    model = None

# Load dataset untuk responses
try:
    # Cek intents di beberapa lokasi
    intents_paths = [
        'models/intents.json',
        'intents.json',
        'models/intents_simplified.json'
    ]
    
    intents_data = None
    for intents_path in intents_paths:
        if os.path.exists(intents_path):
            print(f"🔍 Found intents at: {intents_path}")
            with open(intents_path, 'r', encoding='utf-8') as f:
                intents_data = json.load(f)
            print(f"✅ Loaded {len(intents_data.get('intents', []))} intents")
            break
    
    if intents_data is None:
        print("❌ No intents file found")
        intents_data = {"intents": []}
        
except Exception as e:
    print(f"❌ Error loading intents: {e}")
    traceback.print_exc()
    intents_data = {"intents": []}

# Create intent lookup
intent_responses = {}
intent_patterns = {}
for intent in intents_data.get('intents', []):
    intent_responses[intent['tag']] = intent['responses']
    intent_patterns[intent['tag']] = intent['patterns']

class ChatbotEngine:
    def __init__(self):
        self.conversation_history = []
        self.context = {}
    
    def preprocess_text(self, text):
        """Preprocess user input"""
        return text.lower().strip()
    
    def rule_based_matching(self, user_input):
        """Rule-based intent matching jika model tidak ada"""
        user_input_lower = user_input.lower()
        best_intent = None
        best_score = 0
        
        for intent_tag, patterns in intent_patterns.items():
            score = 0
            for pattern in patterns:
                pattern_lower = pattern.lower()
                if pattern_lower in user_input_lower:
                    score += 1
                # Cek individual words
                for word in pattern_lower.split():
                    if word in user_input_lower and len(word) > 2:
                        score += 0.5
            
            if score > best_score:
                best_score = score
                best_intent = intent_tag
        
        # Minimum threshold untuk rule-based
        if best_score >= 1:
            return best_intent, 0.5 + (best_score * 0.1)  # Confidence 0.5-0.9
        
        return "tidak_mengerti", 0.2
    
    def get_response(self, user_input):
        """Get chatbot response"""
        
        # Preprocess input
        processed_input = self.preprocess_text(user_input)
        
        intent = "tidak_mengerti"
        probability = 0.0
        method = "unknown"
        
        # Coba ML model jika tersedia
        if model is not None and vectorizer is not None:
            try:
                # Vectorize
                X = vectorizer.transform([processed_input])
                
                # Predict intent
                prediction = model.predict(X)[0]
                probability = model.predict_proba(X).max()
                
                intent = label_encoder.inverse_transform([prediction])[0]
                method = "ml_model"
                
                # Jika confidence rendah, coba rule-based
                if probability < 0.3:
                    print(f"⚠️ Low ML confidence ({probability:.2f}), trying rule-based")
                    rule_intent, rule_confidence = self.rule_based_matching(user_input)
                    if rule_intent != "tidak_mengerti":
                        intent = rule_intent
                        probability = rule_confidence
                        method = "rule_based_fallback"
                        
            except Exception as e:
                print(f"⚠️ ML prediction error: {e}")
                # Fallback ke rule-based
                intent, probability = self.rule_based_matching(user_input)
                method = "rule_based_error"
        else:
            # Gunakan rule-based saja
            intent, probability = self.rule_based_matching(user_input)
            method = "rule_based_only"
        
        # Get response based on intent
        if intent in intent_responses:
            response = random.choice(intent_responses[intent])
        else:
            # Fallback response
            fallbacks = [
                "Maaf, saya belum memahami pertanyaan Anda.",
                "Bisa tolong diperjelas?",
                "Saya bisa membantu dengan informasi akademik kampus. Coba tanya tentang jurusan, beasiswa, atau fasilitas kampus.",
                "Pertanyaan Anda di luar pengetahuan saya. Coba tanya hal lain."
            ]
            response = random.choice(fallbacks)
        
        # Simpan ke history
        self.conversation_history.append({
            'timestamp': datetime.now().isoformat(),
            'user': user_input,
            'intent': intent,
            'confidence': float(probability),
            'bot': response,
            'method': method
        })
        
        # Update context
        self.context['last_intent'] = intent
        
        # Keep history manageable
        if len(self.conversation_history) > 100:
            self.conversation_history = self.conversation_history[-50:]
        
        return {
            'response': response,
            'intent': intent,
            'confidence': float(probability),
            'method': method,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_suggestions(self, last_intent=None):
        """Get suggested questions"""
        if last_intent and last_intent in intent_patterns:
            # Berikan saran berdasarkan intent terakhir
            patterns = intent_patterns[last_intent][:3]  # Ambil 3 pola pertama
            return patterns
        
        # Default suggestions
        suggestions = [
            "Apa saja jurusan yang ada?",
            "Bagaimana cara daftar beasiswa?",
            "Kapan jadwal kuliah semester depan?",
            "Berapa biaya asrama?",
            "Jam buka perpustakaan?"
        ]
        return suggestions

# Initialize chatbot
chatbot = ChatbotEngine()

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    """Handle chat requests"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json(silent=True)
        
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'error': 'Message is required',
                'response': 'Mohon kirim pesan yang valid.'
            }), 400
        
        user_message = data['message'].strip()
        
        if not user_message:
            return jsonify({
                'success': False,
                'error': 'Message cannot be empty',
                'response': 'Pesan tidak boleh kosong.'
            }), 400
        
        # Validate message length
        if len(user_message) > 500:
            return jsonify({
                'success': False,
                'error': 'Message too long',
                'response': 'Pesan terlalu panjang. Maksimal 500 karakter.'
            }), 400
        
        # Get response
        result = chatbot.get_response(user_message)
        
        # Add suggestions for fallback responses
        if result['confidence'] < 0.4:
            result['suggestions'] = chatbot.get_suggestions(result['intent'])
        
        return jsonify({
            'success': True,
            'intent': result['intent'],
            'confidence': result['confidence'],
            'response': result['response'],
            'method': result['method'],
            'model_available': model is not None,
            'intents_count': len(intent_responses),
            'timestamp': result['timestamp']
        })
    
    except Exception as e:
        print(f"❌ API Error: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'response': 'Terjadi kesalahan pada server. Silakan coba lagi.'
        }), 500

@app.route('/api/chat/history', methods=['GET'])
def get_history():
    """Get conversation history"""
    return jsonify({
        'success': True,
        'history': chatbot.conversation_history[-20:],  # Last 20 messages
        'total_messages': len(chatbot.conversation_history),
        'context': chatbot.context
    })

@app.route('/api/chat/reset', methods=['POST'])
def reset_chat():
    """Reset conversation"""
    chatbot.conversation_history = []
    chatbot.context = {}
    
    return jsonify({
        'success': True,
        'message': 'Chat history berhasil direset.'
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'service': 'Chatbot Akademik API',
        'model_loaded': model is not None,
        'intents_loaded': len(intent_responses),
        'last_trained': 'N/A',  # Tambahkan timestamp training jika ada
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/info', methods=['GET'])
def get_info():
    """Get system information"""
    intents_list = []
    for intent in intents_data.get('intents', []):
        intents_list.append({
            'tag': intent['tag'],
            'patterns': len(intent.get('patterns', [])),
            'responses': len(intent.get('responses', []))
        })
    
    return jsonify({
        'success': True,
        'info': {
            'model': 'ML Model' if model is not None else 'Rule-based Only',
            'total_intents': len(intents_list),
            'intents': intents_list,
            'memory_usage': len(chatbot.conversation_history),
            'uptime': datetime.now().isoformat()
        }
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🤖 CHATBOT AKADEMIK API - FLASK SERVER")
    print("="*60)
    print(f"📊 Model Status: {'✅ Loaded' if model is not None else '⚠️  Rule-based Only'}")
    print(f"📚 Intents Loaded: {len(intent_responses)}")
    print(f"🌐 CORS Enabled: Yes")
    print("="*60)
    print("🚀 Starting Flask server...")
    print("📡 API URL: http://localhost:5000")
    print("\n🔗 Available Endpoints:")
    print("   POST   /api/chat          - Send message")
    print("   GET    /api/chat/history  - Get chat history")
    print("   POST   /api/chat/reset    - Reset chat")
    print("   GET    /api/health        - Health check")
    print("   GET    /api/info          - System info")
    print("="*60)
    print("\n💡 Press Ctrl+C to stop the server\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
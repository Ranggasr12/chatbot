# train_ml_model.py
import json
import pickle
import numpy as np
import pandas as pd
from datetime import datetime
from collections import Counter
import os

# ML Libraries
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

# NLTK for Indonesian text processing (optional)
try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    NLTK_AVAILABLE = True
except:
    print("⚠️ NLTK not available, using basic preprocessing")
    NLTK_AVAILABLE = False

print("="*60)
print("🤖 TRAINING ML MODEL FOR CAMPUS CHATBOT")
print("="*60)

# 1. Load dataset
def load_dataset():
    """Load intents.json dataset"""
    dataset_paths = [
        'models/intents.json',
        'intents.json',
        'models/intents_simplified.json'
    ]
    
    for path in dataset_paths:
        if os.path.exists(path):
            print(f"📂 Loading dataset from: {path}")
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Validate structure
            if 'intents' in data and len(data['intents']) > 0:
                print(f"✅ Dataset loaded: {len(data['intents'])} intents")
                return data
    
    raise FileNotFoundError("No valid intents.json file found")

# 2. Preprocess text (Indonesian specific)
def preprocess_text(text, use_stopwords=True):
    """Basic text preprocessing for Indonesian"""
    text = text.lower().strip()
    
    # Simple cleaning
    text = text.replace('\n', ' ').replace('\t', ' ')
    
    # Remove special characters but keep Indonesian letters
    import re
    text = re.sub(r'[^\w\s]', ' ', text)  # Keep words and spaces
    text = re.sub(r'\s+', ' ', text)  # Remove extra spaces
    
    # Indonesian stopwords removal (optional)
    if NLTK_AVAILABLE and use_stopwords:
        try:
            indonesian_stopwords = set(stopwords.words('indonesian'))
            words = text.split()
            words = [w for w in words if w not in indonesian_stopwords]
            text = ' '.join(words)
        except:
            pass
    
    return text

# 3. Prepare training data
def prepare_training_data(data):
    """Convert intents.json to training data"""
    patterns = []
    labels = []
    intent_stats = {}
    
    print("\n📊 Preparing training data...")
    
    for intent in data['intents']:
        tag = intent['tag']
        intent_patterns = intent['patterns']
        
        # Statistics
        intent_stats[tag] = len(intent_patterns)
        
        # Add each pattern
        for pattern in intent_patterns:
            processed_pattern = preprocess_text(pattern)
            patterns.append(processed_pattern)
            labels.append(tag)
    
    # Display statistics
    print(f"✅ Total samples: {len(patterns)}")
    print(f"✅ Total intents: {len(intent_stats)}")
    print(f"✅ Samples per intent:")
    for tag, count in sorted(intent_stats.items(), key=lambda x: x[1], reverse=True):
        print(f"   • {tag}: {count} samples")
    
    return patterns, labels, intent_stats

# 4. Train different models and compare
def train_and_compare_models(X_train, X_test, y_train, y_test, vectorizer, label_encoder):
    """Train multiple models and select the best one"""
    
    print("\n" + "="*60)
    print("🧪 TRAINING MULTIPLE MODELS")
    print("="*60)
    
    models = {
        'NaiveBayes': MultinomialNB(alpha=0.1),
        'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42),
        'LogisticRegression': LogisticRegression(max_iter=1000, random_state=42),
        'SVM': SVC(probability=True, random_state=42)
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"\n📈 Training {name}...")
        
        # Train
        model.fit(X_train, y_train)
        
        # Predict
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        cv_scores = cross_val_score(model, X_train, y_train, cv=5)
        
        # Store results
        results[name] = {
            'model': model,
            'accuracy': accuracy,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std()
        }
        
        print(f"   ✅ Accuracy: {accuracy:.4f}")
        print(f"   📊 CV Score: {cv_scores.mean():.4f} (±{cv_scores.std():.4f})")
    
    # Select best model
    best_model_name = max(results, key=lambda x: results[x]['accuracy'])
    best_model = results[best_model_name]
    
    print("\n" + "="*60)
    print(f"🏆 BEST MODEL: {best_model_name}")
    print("="*60)
    print(f"📈 Test Accuracy: {best_model['accuracy']:.4f}")
    print(f"📊 Cross-Validation: {best_model['cv_mean']:.4f} (±{best_model['cv_std']:.4f})")
    
    # Detailed report for best model
    print("\n📋 Classification Report:")
    y_pred_best = best_model['model'].predict(X_test)
    print(classification_report(y_test, y_pred_best, target_names=label_encoder.classes_))
    
    return best_model_name, results

# 5. Save model
def save_model(best_model_name, results, vectorizer, label_encoder, data, intent_stats):
    """Save the trained model"""
    
    # Create models/trained directory if not exists
    os.makedirs('models/trained', exist_ok=True)
    
    # Prepare model data
    model_data = {
        'vectorizer': vectorizer,
        'label_encoder': label_encoder,
        'model': results[best_model_name]['model'],
        'metadata': {
            'training_date': datetime.now().isoformat(),
            'model_type': best_model_name,
            'accuracy': float(results[best_model_name]['accuracy']),
            'cv_score': float(results[best_model_name]['cv_mean']),
            'total_samples': sum(intent_stats.values()),
            'total_intents': len(intent_stats),
            'intent_distribution': intent_stats,
            'feature_count': len(vectorizer.get_feature_names_out()),
            'classes': list(label_encoder.classes_)
        }
    }
    
    # Save model
    model_path = 'models/trained/model.joblib'
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f, protocol=pickle.HIGHEST_PROTOCOL)
    
    print(f"\n💾 Model saved to: {model_path}")
    print(f"📦 Model size: {os.path.getsize(model_path) / 1024:.2f} KB")
    
    # Save metadata separately
    metadata_path = 'models/trained/model_metadata.json'
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(model_data['metadata'], f, indent=2, ensure_ascii=False)
    
    print(f"📄 Metadata saved to: {metadata_path}")
    
    return model_path

# 6. Test the trained model
def test_model(model_path, test_samples=None):
    """Test the trained model with sample queries"""
    
    print("\n" + "="*60)
    print("🧪 TESTING TRAINED MODEL")
    print("="*60)
    
    # Load model
    with open(model_path, 'rb') as f:
        model_data = pickle.load(f)
    
    vectorizer = model_data['vectorizer']
    label_encoder = model_data['label_encoder']
    model = model_data['model']
    
    # Default test samples
    if test_samples is None:
        test_samples = [
            ("jurusan apa yang ada", "informasi_jurusan"),
            ("beasiswa untuk mahasiswa baru", "beasiswa"),
            ("biaya asrama per semester", "asrama_mahasiswa"),
            ("jam buka perpustakaan", "facility_hours"),
            ("halo apa kabar", "greeting"),
            ("jadwal shuttle bus kampus", "bus_schedule"),
            ("cara booking lab komputer", "lab_booking"),
            ("tarif parkir mobil", "parking_info")
        ]
    
    print("\n🔍 Prediction Results:")
    print("-" * 50)
    
    correct = 0
    total = len(test_samples)
    
    for query, expected_intent in test_samples:
        # Preprocess
        processed_query = preprocess_text(query)
        
        # Vectorize
        X = vectorizer.transform([processed_query])
        
        # Predict
        prediction = model.predict(X)[0]
        probability = model.predict_proba(X).max()
        
        # Decode label
        intent = label_encoder.inverse_transform([prediction])[0]
        
        # Check if correct
        is_correct = intent == expected_intent
        if is_correct:
            correct += 1
        
        # Display result
        status = "✅" if is_correct else "❌"
        print(f"{status} Query: '{query}'")
        print(f"   Predicted: {intent} ({probability:.4f})")
        print(f"   Expected: {expected_intent}")
        print()
    
    accuracy = correct / total * 100
    print(f"📊 Test Accuracy: {accuracy:.1f}% ({correct}/{total})")
    
    return accuracy

# Main function
def main():
    try:
        # Load dataset
        data = load_dataset()
        
        # Prepare data
        patterns, labels, intent_stats = prepare_training_data(data)
        
        # Check if we have enough data
        if len(patterns) < 10:
            print("❌ Not enough training data. Need at least 10 samples.")
            return
        
        # 1. Vectorize text
        print("\n🔤 Creating TF-IDF Vectorizer...")
        vectorizer = TfidfVectorizer(
            max_features=1500,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.95,
            sublinear_tf=True
        )
        
        X = vectorizer.fit_transform(patterns)
        print(f"✅ Vectorizer created: {X.shape[1]} features")
        
        # 2. Encode labels
        label_encoder = LabelEncoder()
        y = label_encoder.fit_transform(labels)
        print(f"✅ Labels encoded: {len(label_encoder.classes_)} classes")
        
        # 3. Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        print(f"✅ Data split: {X_train.shape[0]} train, {X_test.shape[0]} test")
        
        # 4. Train and compare models
        best_model_name, results = train_and_compare_models(
            X_train, X_test, y_train, y_test, vectorizer, label_encoder
        )
        
        # 5. Save model
        model_path = save_model(
            best_model_name, results, vectorizer, label_encoder, data, intent_stats
        )
        
        # 6. Test model
        test_accuracy = test_model(model_path)
        
        # 7. Create training report
        report = {
            'training_date': datetime.now().isoformat(),
            'best_model': best_model_name,
            'test_accuracy': test_accuracy,
            'training_samples': len(patterns),
            'intents_count': len(intent_stats),
            'feature_count': X.shape[1],
            'model_size_kb': os.path.getsize(model_path) / 1024,
            'intent_distribution': intent_stats,
            'model_performance': {
                name: {
                    'accuracy': float(results[name]['accuracy']),
                    'cv_mean': float(results[name]['cv_mean']),
                    'cv_std': float(results[name]['cv_std'])
                }
                for name in results
            }
        }
        
        # Save report
        report_path = 'models/trained/training_report.json'
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n📊 Training report saved to: {report_path}")
        
        print("\n" + "="*60)
        print("🎉 TRAINING COMPLETE!")
        print("="*60)
        print(f"✨ Best Model: {best_model_name}")
        print(f"✨ Accuracy: {test_accuracy:.1f}%")
        print(f"✨ Model saved: {model_path}")
        print(f"✨ Next steps: Restart Flask server to use ML model")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Error during training: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
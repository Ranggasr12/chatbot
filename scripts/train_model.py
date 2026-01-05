# train_model.py - FIXED VERSION
import json
import numpy as np
import pandas as pd
import re
import os
import time
import pickle
import warnings
warnings.filterwarnings('ignore')

# Machine Learning Libraries
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score, precision_recall_fscore_support
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

# Deep Learning Libraries (opsional)
try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Dense, Dropout, Embedding, LSTM, Bidirectional
    from tensorflow.keras.preprocessing.text import Tokenizer
    from tensorflow.keras.preprocessing.sequence import pad_sequences
    from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("WARNING: TensorFlow not available. Deep learning models disabled.")

# Visualization (opsional)
try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    VISUALIZATION_AVAILABLE = True
except ImportError:
    VISUALIZATION_AVAILABLE = False
    print("WARNING: Visualization libraries not available.")

# Utilitas
import joblib
import logging
import sys
import io
from datetime import datetime
from collections import Counter
from typing import Dict, List, Tuple, Any, Optional

# Fix Unicode encoding for Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Setup logging (TANPA EMOJI untuk Windows)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/model_training.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AdvancedChatbotTrainer:
    """Advanced chatbot trainer dengan multiple model options"""
    
    def __init__(self, model_type='mlp'):
        self.model_type = model_type.lower()
        self.models = {}
        self.vectorizers = {}
        self.label_encoders = {}
        self.responses = {}
        
        # Training configuration
        self.config = {
            'test_size': 0.15,
            'validation_size': 0.15,
            'random_state': 42,
            'cv_folds': 5,
            'max_features': 2000,
            'ngram_range': (1, 2),
            'min_df': 1,
            'max_df': 0.95,
            'use_stemming': False,
            'use_stopwords': True,
            'save_best_model': True,
            'early_stopping_patience': 10
        }
        
        # Create directories
        os.makedirs('models/trained', exist_ok=True)
        os.makedirs('reports/plots', exist_ok=True)
        os.makedirs('reports/metrics', exist_ok=True)
        os.makedirs('logs', exist_ok=True)
        
        logger.info(f"Initialized AdvancedChatbotTrainer with model type: {model_type}")
    
    def load_and_prepare_data(self, data_path: str = None):
        """Load dan prepare data dari processed dataset"""
        # Cari file jika path tidak diberikan
        if not data_path or not os.path.exists(data_path):
            possible_paths = [
                'models/processed/intents_processed.json',
                '../models/processed/intents_processed.json',
                'data/intents.json',
                '../data/intents.json',
                'intents.json',
                '../intents.json',
                'models/trained/intents.json',
                '../models/trained/intents.json'
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    data_path = path
                    break
        
        if not data_path or not os.path.exists(data_path):
            logger.error("ERROR: Could not find data file")
            return self._load_legacy_data()
        
        try:
            logger.info(f"Loading data from {data_path}")
            
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Extract intents
            patterns = []
            tags = []
            
            if 'intents' in data:
                for intent in data['intents']:
                    tag = intent['tag']
                    # Check for cleaned or original patterns
                    if 'patterns_cleaned' in intent:
                        patterns.extend(intent['patterns_cleaned'])
                    elif 'patterns' in intent:
                        patterns.extend(intent['patterns'])
                    else:
                        continue
                    
                    tags.extend([tag] * len(intent.get('patterns_cleaned', intent.get('patterns', []))))
                    
                    # Store responses
                    if tag not in self.responses:
                        self.responses[tag] = intent.get('responses', [])
            
            logger.info(f"Loaded {len(patterns)} patterns for {len(set(tags))} intents")
            
            return patterns, tags
            
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            # Fallback ke simplified dataset
            return self._load_legacy_data()
    
    def _load_legacy_data(self):
        """Fallback untuk loading data lama"""
        possible_paths = [
            'models/intents_simplified.json',
            '../models/intents_simplified.json',
            'intents.json',
            '../intents.json',
            'data/intents.json',
            '../data/intents.json'
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    patterns = []
                    tags = []
                    
                    for intent in data['intents']:
                        tag = intent['tag']
                        patterns.extend(intent['patterns'])
                        tags.extend([tag] * len(intent['patterns']))
                        self.responses[tag] = intent['responses']
                    
                    logger.info(f"Loaded {len(patterns)} patterns from legacy dataset: {path}")
                    return patterns, tags
                    
                except Exception as e:
                    logger.error(f"Error loading {path}: {e}")
                    continue
        
        logger.error("No dataset found!")
        return [], []
    
    def advanced_preprocessing(self, texts: List[str]) -> List[str]:
        """Advanced text preprocessing untuk Bahasa Indonesia"""
        processed_texts = []
        
        # Indonesian stopwords
        indonesian_stopwords = set([
            'yang', 'di', 'dan', 'itu', 'dengan', 'untuk', 'dari', 'dalam', 'pada', 
            'juga', 'akan', 'atau', 'ini', 'tidak', 'ada', 'saya', 'kamu', 'kami',
            'mereka', 'dia', 'kita', 'adalah', 'yaitu', 'sebagai', 'oleh', 'karena',
            'jika', 'agar', 'supaya', 'ketika', 'sebelum', 'sesudah', 'setelah',
            'sehingga', 'namun', 'tetapi', 'melainkan', 'sambil', 'seraya', 'agar',
            'sebaiknya', 'seharusnya', 'mungkin', 'bisa', 'dapat', 'harus', 'perlu',
            'ingin', 'mau', 'akan', 'sedang', 'telah', 'sudah', 'belum', 'pernah',
            'selalu', 'sering', 'kadang', 'jarang', 'tidak', 'bukan', 'jangan',
            'janganlah', 'tolong', 'silahkan', 'mohon', 'coba', 'ayo', 'mari'
        ])
        
        for text in texts:
            # Lowercase
            text = text.lower()
            
            # Remove URLs
            text = re.sub(r'https?://\S+|www\.\S+', '', text)
            
            # Remove mentions and hashtags
            text = re.sub(r'[@#]\w+', '', text)
            
            # Remove special characters (keep Indonesian letters)
            text = re.sub(r'[^\w\s\u00C0-\u00FF\u0100-\u017F\u0180-\u024F.,?!]', ' ', text)
            
            # Remove extra whitespace
            text = re.sub(r'\s+', ' ', text).strip()
            
            # Remove stopwords jika diaktifkan
            if self.config['use_stopwords']:
                words = text.split()
                words = [w for w in words if w not in indonesian_stopwords]
                text = ' '.join(words)
            
            processed_texts.append(text)
        
        return processed_texts
    
    def create_vectorizers(self):
        """Create multiple vectorizers untuk comparison"""
        logger.info("Creating vectorizers...")
        
        # 1. TF-IDF Vectorizer (default)
        self.vectorizers['tfidf'] = TfidfVectorizer(
            max_features=self.config['max_features'],
            ngram_range=self.config['ngram_range'],
            min_df=self.config['min_df'],
            max_df=self.config['max_df'],
            lowercase=True,
            analyzer='word'
        )
        
        # 2. Count Vectorizer
        self.vectorizers['count'] = CountVectorizer(
            max_features=self.config['max_features'],
            ngram_range=self.config['ngram_range'],
            min_df=self.config['min_df'],
            max_df=self.config['max_df'],
            lowercase=True,
            analyzer='word'
        )
        
        logger.info(f"Created {len(self.vectorizers)} vectorizers")
    
    def create_models(self):
        """Create multiple machine learning models"""
        logger.info("Creating machine learning models...")
        
        # 1. Neural Network (MLP) - simplified
        self.models['mlp'] = MLPClassifier(
            hidden_layer_sizes=(100, 50),
            activation='relu',
            solver='adam',
            max_iter=300,
            random_state=self.config['random_state']
        )
        
        # 2. Random Forest
        self.models['random_forest'] = RandomForestClassifier(
            n_estimators=100,
            max_depth=15,
            random_state=self.config['random_state'],
            n_jobs=-1
        )
        
        # 3. Support Vector Machine
        self.models['svm'] = SVC(
            C=1.0,
            kernel='linear',
            probability=True,
            random_state=self.config['random_state'],
            max_iter=500
        )
        
        # 4. Logistic Regression
        self.models['logistic'] = LogisticRegression(
            C=1.0,
            solver='lbfgs',
            max_iter=500,
            random_state=self.config['random_state']
        )
        
        # 5. Naive Bayes
        self.models['naive_bayes'] = MultinomialNB(alpha=1.0)
        
        logger.info(f"Created {len(self.models)} models")
    
    def train_model(self, model_name: str, X_train, y_train, X_val=None, y_val=None):
        """Train individual model"""
        logger.info(f"Training {model_name}...")
        
        start_time = time.time()
        
        # Pilih vectorizer (default: tfidf untuk semua kecuali Naive Bayes)
        vectorizer_name = 'tfidf'
        if model_name == 'naive_bayes':
            vectorizer_name = 'count'  # Naive Bayes works better with CountVectorizer
        
        # Transform data
        X_train_vec = self.vectorizers[vectorizer_name].fit_transform(X_train)
        if X_val is not None:
            X_val_vec = self.vectorizers[vectorizer_name].transform(X_val)
        
        # Train model
        self.models[model_name].fit(X_train_vec, y_train)
        
        training_time = time.time() - start_time
        
        # Calculate accuracy
        train_accuracy = self.models[model_name].score(X_train_vec, y_train)
        
        if X_val is not None:
            val_accuracy = self.models[model_name].score(X_val_vec, y_val)
        else:
            val_accuracy = None
        
        # FIX: Format string yang benar
        val_accuracy_str = f"{val_accuracy:.3f}" if val_accuracy is not None else "N/A"
        logger.info(f"   {model_name}: Train Accuracy = {train_accuracy:.3f}, "
                   f"Val Accuracy = {val_accuracy_str}, "
                   f"Time = {training_time:.2f}s")
        
        return {
            'model': self.models[model_name],
            'vectorizer': self.vectorizers[vectorizer_name],
            'train_accuracy': train_accuracy,
            'val_accuracy': val_accuracy,
            'training_time': training_time,
            'vectorizer_name': vectorizer_name
        }
    
    def evaluate_model(self, model_name: str, X_test, y_test, vectorizer_name='tfidf'):
        """Evaluate model dengan metrics lengkap"""
        logger.info(f"Evaluating {model_name}...")
        
        # Transform test data
        X_test_vec = self.vectorizers[vectorizer_name].transform(X_test)
        
        # Predict
        y_pred_encoded = self.models[model_name].predict(X_test_vec)
        
        # Decode predictions jika y_test adalah string dan y_pred adalah encoded
        if isinstance(y_test[0], str) and isinstance(y_pred_encoded[0], (int, np.integer)):
            y_pred = self.label_encoders['main'].inverse_transform(y_pred_encoded)
            y_test_for_metrics = y_test
            y_pred_for_metrics = y_pred
        else:
            y_test_for_metrics = y_test
            y_pred_for_metrics = y_pred_encoded
        
        # Calculate metrics
        accuracy = accuracy_score(y_test_for_metrics, y_pred_for_metrics)
        
        # Use try-except untuk menghindari error jika ada label yang tidak ada di predictions
        try:
            precision, recall, f1, _ = precision_recall_fscore_support(
                y_test_for_metrics, y_pred_for_metrics, average='weighted', zero_division=0
            )
        except:
            # Fallback jika ada masalah dengan labels
            precision, recall, f1 = accuracy, accuracy, accuracy
        
        # Classification report
        report = classification_report(y_test_for_metrics, y_pred_for_metrics, output_dict=True, zero_division=0)
        
        # Confusion matrix
        cm = confusion_matrix(y_test_for_metrics, y_pred_for_metrics)
        
        results = {
            'model_name': model_name,
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'classification_report': report,
            'confusion_matrix': cm.tolist()
        }
        
        # Print summary
        logger.info(f"   {model_name} Evaluation:")
        logger.info(f"      Accuracy:  {accuracy:.3f}")
        logger.info(f"      Precision: {precision:.3f}")
        logger.info(f"      Recall:    {recall:.3f}")
        logger.info(f"      F1-Score:  {f1:.3f}")
        
        return results
    
    def train_all_models(self, data_path: str = None):
        """Train semua models dan pilih yang terbaik"""
        logger.info("=" * 60)
        logger.info("STARTING COMPREHENSIVE MODEL TRAINING")
        logger.info("=" * 60)
        
        start_time = time.time()
        
        # 1. Load dan preprocess data
        patterns, tags = self.load_and_prepare_data(data_path)
        
        if not patterns or not tags:
            logger.error("ERROR: No data available for training!")
            return None
        
        # 2. Advanced preprocessing
        logger.info("Advanced preprocessing...")
        processed_patterns = self.advanced_preprocessing(patterns)
        
        # 3. Encode labels
        logger.info("Encoding labels...")
        label_encoder = LabelEncoder()
        y_encoded = label_encoder.fit_transform(tags)
        self.label_encoders['main'] = label_encoder
        
        logger.info(f"   Encoded {len(label_encoder.classes_)} classes")
        
        # 4. Split data
        logger.info("Splitting data...")
        X_train, X_temp, y_train, y_temp = train_test_split(
            processed_patterns, y_encoded,
            test_size=self.config['test_size'] + self.config['validation_size'],
            random_state=self.config['random_state'],
            stratify=y_encoded
        )
        
        # Split temp into validation and test
        val_ratio = self.config['validation_size'] / (self.config['test_size'] + self.config['validation_size'])
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp,
            test_size=1 - val_ratio,
            random_state=self.config['random_state'],
            stratify=y_temp
        )
        
        logger.info(f"   Training set:   {len(X_train)} samples")
        logger.info(f"   Validation set: {len(X_val)} samples")
        logger.info(f"   Test set:       {len(X_test)} samples")
        
        # 5. Create vectorizers dan models
        self.create_vectorizers()
        self.create_models()
        
        # 6. Train models
        results = {}
        successful_models = []
        
        for model_name in self.models.keys():
            try:
                # Train model
                model_result = self.train_model(model_name, X_train, y_train, X_val, y_val)
                results[model_name] = model_result
                successful_models.append(model_name)
                
            except Exception as e:
                logger.error(f"ERROR training {model_name}: {e}")
        
        # 7. Pilih model terbaik berdasarkan validation accuracy
        best_model_name = None
        best_val_accuracy = 0
        
        for model_name, result in results.items():
            if result['val_accuracy'] and result['val_accuracy'] > best_val_accuracy:
                best_val_accuracy = result['val_accuracy']
                best_model_name = model_name
        
        if best_model_name:
            logger.info(f"\nBEST MODEL: {best_model_name} (Val Accuracy: {best_val_accuracy:.3f})")
            
            # 8. Evaluate best model pada test set
            best_result = results[best_model_name]
            
            # Decode y_test untuk evaluation
            y_test_decoded = label_encoder.inverse_transform(y_test)
            
            test_results = self.evaluate_model(
                best_model_name, 
                X_test, 
                y_test_decoded,
                best_result['vectorizer_name']
            )
            
            # Simpan best model
            self.save_best_model(
                best_model_name, 
                best_result['model'], 
                best_result['vectorizer'],
                label_encoder,
                test_results
            )
        else:
            logger.info("\nWARNING: No model trained successfully!")
            # Pilih model pertama yang berhasil
            if successful_models:
                best_model_name = successful_models[0]
                best_result = results[best_model_name]
                logger.info(f"Using first successful model: {best_model_name}")
                
                # Decode y_test untuk evaluation
                y_test_decoded = label_encoder.inverse_transform(y_test)
                
                # Evaluate model
                test_results = self.evaluate_model(
                    best_model_name, 
                    X_test, 
                    y_test_decoded,
                    best_result['vectorizer_name']
                )
                
                # Simpan model
                self.save_best_model(
                    best_model_name, 
                    best_result['model'], 
                    best_result['vectorizer'],
                    label_encoder,
                    test_results
                )
        
        # 9. Buat comparison report jika ada model yang berhasil
        if results:
            y_test_decoded = label_encoder.inverse_transform(y_test)
            self.create_model_comparison_report(results, X_test, y_test_decoded)
        else:
            logger.info("Skipping comparison report - no models trained successfully")
        
        # 10. Visualisasi results (jika library tersedia)
        if VISUALIZATION_AVAILABLE and results and best_model_name:
            try:
                self.visualize_results(results, test_results if 'test_results' in locals() else None)
            except Exception as e:
                logger.error(f"ERROR in visualization: {e}")
        
        total_time = time.time() - start_time
        logger.info(f"\nTraining completed in {total_time:.2f} seconds")
        
        return {
            'best_model': best_model_name,
            'best_val_accuracy': best_val_accuracy,
            'all_results': results,
            'total_time': total_time,
            'successful_models': successful_models
        }
    
    def save_best_model(self, model_name: str, model, vectorizer, label_encoder, test_results):
        """Save best model dengan semua komponen"""
        logger.info(f"Saving best model: {model_name}")
        
        # Save components
        model_data = {
            'model': model,
            'vectorizer': vectorizer,
            'label_encoder': label_encoder,
            'responses': self.responses,
            'model_name': model_name,
            'test_results': test_results,
            'config': self.config,
            'saved_at': datetime.now().isoformat()
        }
        
        # Save menggunakan joblib
        joblib.dump(model_data, 'models/trained/model_joblib')
        
        # Save metadata
        metadata = {
            'model_type': model_name,
            'classes': label_encoder.classes_.tolist(),
            'num_classes': len(label_encoder.classes_),
            'accuracy': test_results['accuracy'] if test_results else 0.0,
            'precision': test_results['precision'] if test_results else 0.0,
            'recall': test_results['recall'] if test_results else 0.0,
            'f1_score': test_results['f1_score'] if test_results else 0.0,
            'training_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'vectorizer_type': type(vectorizer).__name__
        }
        
        with open('models/trained/model_metadata.json', 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        
        # Save classification report jika ada
        if test_results and 'classification_report' in test_results:
            with open('reports/metrics/classification_report.json', 'w', encoding='utf-8') as f:
                json.dump(test_results['classification_report'], f, indent=2)
        
        # Save intents.json untuk Flask
        intents_data = {"intents": []}
        for tag in label_encoder.classes_:
            intents_data["intents"].append({
                "tag": tag,
                "patterns": [],  # Tidak menyimpan patterns untuk size kecil
                "responses": self.responses.get(tag, [f"Response for {tag}"])
            })
        
        with open('models/trained/intents.json', 'w', encoding='utf-8') as f:
            json.dump(intents_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"   Saved to: models/trained/model_joblib")
        if test_results:
            logger.info(f"   Model accuracy: {test_results['accuracy']:.3f}")
    
    def create_model_comparison_report(self, results: Dict, X_test, y_test):
        """Buat comparison report untuk semua models"""
        logger.info("Creating model comparison report...")
        
        comparison_data = []
        
        for model_name, result in results.items():
            try:
                # Evaluate pada test set
                test_result = self.evaluate_model(
                    model_name, 
                    X_test, 
                    y_test,
                    result['vectorizer_name']
                )
                
                comparison_data.append({
                    'Model': model_name,
                    'Train_Accuracy': result['train_accuracy'],
                    'Val_Accuracy': result['val_accuracy'] if result['val_accuracy'] else 0.0,
                    'Test_Accuracy': test_result['accuracy'],
                    'Test_Precision': test_result['precision'],
                    'Test_Recall': test_result['recall'],
                    'Test_F1_Score': test_result['f1_score'],
                    'Training_Time_s': result['training_time'],
                    'Vectorizer': result['vectorizer_name']
                })
                
            except Exception as e:
                logger.error(f"Error evaluating {model_name} for comparison: {e}")
        
        if not comparison_data:
            logger.error("No data for comparison report")
            return None
        
        # Create DataFrame
        df_comparison = pd.DataFrame(comparison_data)
        
        # Sort by Test Accuracy
        if 'Test_Accuracy' in df_comparison.columns:
            df_comparison = df_comparison.sort_values('Test_Accuracy', ascending=False)
        
        # Save to CSV
        df_comparison.to_csv('reports/metrics/model_comparison.csv', index=False)
        
        # Print comparison table
        print("\n" + "=" * 80)
        print("MODEL COMPARISON")
        print("=" * 80)
        print(df_comparison.to_string(index=False))
        
        return df_comparison
    
    def visualize_results(self, results: Dict, test_results: Dict = None):
        """Create visualizations untuk training results"""
        if not VISUALIZATION_AVAILABLE:
            logger.info("Visualization libraries not available, skipping plots.")
            return
        
        logger.info("Creating visualizations...")
        
        try:
            # 1. Model Comparison Bar Chart
            models = list(results.keys())
            val_accuracies = []
            
            for model_name in models:
                if results[model_name]['val_accuracy'] is not None:
                    val_accuracies.append(results[model_name]['val_accuracy'])
                else:
                    val_accuracies.append(0.0)
            
            # Sort by accuracy
            sorted_indices = np.argsort(val_accuracies)[::-1]
            models = [models[i] for i in sorted_indices]
            val_accuracies = [val_accuracies[i] for i in sorted_indices]
            
            plt.figure(figsize=(10, 6))
            plt.bar(models, val_accuracies, color='skyblue')
            plt.xlabel('Model')
            plt.ylabel('Validation Accuracy')
            plt.title('Model Comparison - Validation Accuracy')
            plt.xticks(rotation=45, ha='right')
            plt.ylim(0, 1)
            
            # Add value labels
            for i, v in enumerate(val_accuracies):
                plt.text(i, v + 0.01, f'{v:.3f}', ha='center')
            
            plt.tight_layout()
            plt.savefig('reports/plots/model_comparison.png', dpi=150, bbox_inches='tight')
            plt.close()
            
            logger.info("   Visualizations saved to reports/plots/")
            
        except Exception as e:
            logger.error(f"ERROR creating visualizations: {e}")

def main():
    """Main execution function"""
    print("\n" + "=" * 60)
    print("CHATBOT MODEL TRAINER - SIMPLIFIED")
    print("=" * 60)
    
    # Cari file intents.json
    possible_paths = [
        'models/processed/intents_processed.json',
        '../models/processed/intents_processed.json',
        'data/intents.json',
        '../data/intents.json',
        'intents.json',
        '../intents.json',
        'models/trained/intents.json',
        '../models/trained/intents.json'
    ]
    
    data_path = None
    for path in possible_paths:
        if os.path.exists(path):
            data_path = path
            print(f"Found dataset: {path}")
            break
    
    if not data_path:
        print("ERROR: Could not find any dataset")
        print("Please run dataset_processor.py first or place intents.json in project root")
        return
    
    print(f"\nTraining with dataset: {data_path}")
    print("Starting training...")
    
    # Initialize trainer
    trainer = AdvancedChatbotTrainer(model_type='mlp')
    
    # Set konfigurasi untuk lebih stabil
    trainer.config['max_features'] = 2000
    trainer.config['min_df'] = 1
    trainer.config['max_iter'] = 300
    
    # Train models
    results = trainer.train_all_models(data_path)
    
    if results and results['successful_models']:
        print("\n" + "=" * 60)
        print("TRAINING SUMMARY")
        print("=" * 60)
        print(f"Successful models: {len(results['successful_models'])}")
        print(f"Best model: {results['best_model']}")
        print(f"Validation accuracy: {results['best_val_accuracy']:.3f}")
        print(f"Total training time: {results['total_time']:.2f}s")
        print(f"\nModel saved to: models/trained/model_joblib")
        print("You can now run the Flask app with: python backend/app.py")
    elif results:
        print("\nWARNING: Training partially successful")
        print(f"Models attempted: {list(trainer.models.keys())}")
        print(f"Models successful: {results['successful_models']}")
    else:
        print("\nTraining failed completely!")
        print("Troubleshooting steps:")
        print("1. Check if intents.json has valid structure")
        print("2. Try reducing max_features in config")
        print("3. Check logs/model_training.log for details")

if __name__ == "__main__":
    main()
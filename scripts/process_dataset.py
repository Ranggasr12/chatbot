import json
import random
import re
import string
from collections import Counter, defaultdict
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import unicodedata
from typing import Dict, List, Tuple, Any
import logging
from datetime import datetime
import os
import sys

# BUAT DIREKTORI SEBELUM IMPORT APA PUN
os.makedirs('logs', exist_ok=True)
os.makedirs('models/processed', exist_ok=True)
os.makedirs('reports', exist_ok=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/dataset_processing.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Indonesian stopwords manual (tanpa NLTK)
indonesian_stopwords = set([
    'yang', 'di', 'dan', 'itu', 'dengan', 'untuk', 'dari', 'dalam', 'pada', 
    'juga', 'akan', 'atau', 'ini', 'tidak', 'ada', 'saya', 'kamu', 'kami',
    'mereka', 'dia', 'kita', 'adalah', 'yaitu', 'sebagai', 'oleh', 'karena',
    'jika', 'agar', 'supaya', 'ketika', 'sebelum', 'sesudah', 'setelah',
    'sehingga', 'namun', 'tetapi', 'melainkan', 'sambil', 'seraya', 'agar',
    'sebaiknya', 'seharusnya', 'mungkin', 'bisa', 'dapat', 'harus', 'perlu',
    'ingin', 'mau', 'akan', 'sedang', 'telah', 'sudah', 'belum', 'pernah',
    'selalu', 'sering', 'kadang', 'jarang', 'tidak', 'bukan', 'jangan',
    'janganlah', 'tolong', 'silahkan', 'mohon', 'coba', 'ayo', 'mari',
    'saja', 'hanya', 'lagi', 'oleh', 'pada', 'saat', 'sambil', 'sampai',
    'se', 'sebab', 'sebagaimana', 'sebelum', 'sebuah', 'secara', 'sehingga',
    'sekali', 'sekarang', 'sekitar', 'selama', 'seluruh', 'semua', 'semula',
    'sendiri', 'seorang', 'seperti', 'sering', 'serta', 'siapa', 'sudah',
    'supaya', 'tadi', 'tadinya', 'tahu', 'tahun', 'tanpa', 'tapi', 'telah',
    'tempat', 'tentang', 'tepat', 'terhadap', 'terlalu', 'ternyata', 'tersebut',
    'tetap', 'tetapi', 'tiap', 'tidak', 'tiga', 'tinggi', 'toh', 'tujuh',
    'untuk', 'usah', 'usai', 'waduh', 'wah', 'wahai', 'waktu', 'waktunya',
    'walau', 'walaupun', 'wong', 'yaitu', 'yakin', 'yang', 'zat'
])

class DatasetProcessor:
    """Advanced dataset processor dengan preprocessing dan augmentation"""
    
    def __init__(self, json_path: str):
        self.json_path = json_path
        self.data = None
        self.intents = []
        self.all_patterns = []
        self.all_tags = []
        self.all_responses = []
        
        # Data quality metrics
        self.quality_metrics = {
            'total_intents': 0,
            'total_patterns': 0,
            'total_responses': 0,
            'avg_patterns_per_intent': 0,
            'avg_responses_per_intent': 0,
            'class_balance_score': 0,
            'data_quality_score': 0
        }
        
        logger.info(f"Initialized DatasetProcessor with file: {json_path}")
    
    def load_and_validate(self) -> bool:
        """Load dan validasi dataset dengan comprehensive checks"""
        try:
            logger.info(f"Loading dataset from {self.json_path}")
            
            with open(self.json_path, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            
            # Validasi struktur data
            if not self._validate_structure():
                return False
            
            logger.info("Dataset loaded and validated successfully")
            logger.info(f"Metadata: {self.data.get('metadata', {})}")
            
            return True
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            return False
        except Exception as e:
            logger.error(f"Error loading dataset: {e}")
            return False
    
    def _validate_structure(self) -> bool:
        """Validasi struktur dataset"""
        if 'intents' not in self.data:
            logger.error("Dataset must contain 'intents' key")
            return False
        
        intents = self.data['intents']
        issues = []
        
        for i, intent in enumerate(intents):
            if 'tag' not in intent:
                issues.append(f"Intent {i} missing 'tag'")
            if 'patterns' not in intent:
                issues.append(f"Intent {intent.get('tag', f'index_{i}')} missing 'patterns'")
            elif not intent['patterns']:
                issues.append(f"Intent {intent.get('tag', f'index_{i}')} has empty patterns")
            if 'responses' not in intent:
                issues.append(f"Intent {intent.get('tag', f'index_{i}')} missing 'responses'")
            elif not intent['responses']:
                issues.append(f"Intent {intent.get('tag', f'index_{i}')} has empty responses")
        
        if issues:
            for issue in issues:
                logger.warning(f"Warning: {issue}")
            
            # Bisa tetap lanjut dengan warning
            logger.warning("Proceeding with detected issues...")
        
        return True
    
    def _clean_text(self, text: str) -> str:
        """Cleaning teks dengan multiple strategies"""
        if not isinstance(text, str):
            return ""
        
        # 1. Normalize unicode
        text = unicodedata.normalize('NFKC', text)
        
        # 2. Lowercase
        text = text.lower()
        
        # 3. Remove URLs
        text = re.sub(r'https?://\S+|www\.\S+', '', text)
        
        # 4. Remove emails
        text = re.sub(r'\S*@\S*\s?', '', text)
        
        # 5. Remove HTML tags
        text = re.sub(r'<.*?>', '', text)
        
        # 6. Remove special characters (keep Indonesian characters)
        text = re.sub(r'[^\w\s\u00C0-\u00FF\u0100-\u017F\u0180-\u024F.,?!]', ' ', text)
        
        # 7. Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _tokenize_simple(self, text: str) -> List[str]:
        """Tokenize sederhana tanpa NLTK"""
        # Simple split by whitespace and punctuation
        tokens = re.findall(r'\b\w+\b', text.lower())
        
        # Remove stopwords
        tokens = [token for token in tokens if token not in indonesian_stopwords and len(token) > 1]
        
        return tokens
    
    def _augment_pattern(self, pattern: str, augmentation_factor: int = 3) -> List[str]:
        """Augment pattern dengan teknik sederhana"""
        augmented = [pattern]
        
        # Skip augmentation jika pattern pendek
        if len(pattern.split()) < 3:
            return augmented
        
        # Common variations untuk bahasa Indonesia
        variations = [
            # Tambah question words
            lambda p: f"apakah {p}",
            lambda p: f"bagaimana {p}",
            lambda p: f"kapan {p}",
            lambda p: f"dimana {p}",
            lambda p: f"siapa {p}",
            lambda p: f"mengapa {p}",
            
            # Tambah polite forms
            lambda p: f"tolong {p}",
            lambda p: f"bisa tolong {p}",
            lambda p: f"mohon {p}",
            lambda p: f"permisi {p}",
            
            # Tambah context
            lambda p: f"saya ingin tahu {p}",
            lambda p: f"bisa saya tanya {p}",
            lambda p: f"mau tanya dong {p}",
        ]
        
        # Pilih random variations
        available_variations = min(augmentation_factor, len(variations))
        selected_variations = random.sample(variations, available_variations)
        
        for variation_func in selected_variations:
            try:
                augmented_pattern = variation_func(pattern)
                if augmented_pattern not in augmented:
                    augmented.append(augmented_pattern)
            except:
                continue
        
        return augmented
    
    def extract_intents(self, 
                       max_patterns_per_intent: int = 50,
                       min_patterns_per_intent: int = 5,
                       augment_rare_intents: bool = True,
                       augmentation_threshold: int = 10) -> List[Dict]:
        """Ekstrak dan preprocess intents dengan augmentation"""
        if not self.data:
            logger.error("Data belum diload!")
            return []
        
        self.intents = self.data['intents']
        processed_intents = []
        
        logger.info(f"Processing {len(self.intents)} intents...")
        
        # Hitung distribusi awal
        pattern_counts = Counter()
        for intent in self.intents:
            pattern_counts[intent['tag']] = len(intent['patterns'])
        
        # Process each intent
        for intent in self.intents:
            tag = intent['tag']
            patterns = intent['patterns']
            responses = intent['responses']
            
            # Clean patterns
            cleaned_patterns = []
            for pattern in patterns:
                cleaned = self._clean_text(pattern)
                if cleaned and len(cleaned) >= 3:  # Minimum 3 karakter
                    cleaned_patterns.append(cleaned)
            
            # Apply min/max limits
            if len(cleaned_patterns) > max_patterns_per_intent:
                cleaned_patterns = random.sample(cleaned_patterns, max_patterns_per_intent)
            
            # Augment jika pattern terlalu sedikit
            if augment_rare_intents and len(cleaned_patterns) < augmentation_threshold:
                augmented_patterns = []
                for pattern in cleaned_patterns:
                    augmented = self._augment_pattern(pattern, augmentation_factor=2)
                    augmented_patterns.extend(augmented)
                cleaned_patterns = list(set(augmented_patterns))[:max_patterns_per_intent]
            
            # Ensure minimum patterns
            if len(cleaned_patterns) < min_patterns_per_intent:
                logger.warning(f"Intent '{tag}' hanya punya {len(cleaned_patterns)} patterns setelah cleaning")
            
            # Clean responses (tidak perlu di-augment)
            cleaned_responses = []
            for response in responses:
                cleaned = self._clean_text(response)
                if cleaned:
                    cleaned_responses.append(cleaned)
            
            processed_intent = {
                'tag': tag,
                'original_patterns_count': pattern_counts[tag],
                'processed_patterns_count': len(cleaned_patterns),
                'patterns_cleaned': cleaned_patterns,
                'responses': cleaned_responses,
                'context': intent.get('context', []),
                'entities': intent.get('entities', []),
                'follow_up': intent.get('follow_up', [])
            }
            
            processed_intents.append(processed_intent)
            
            # Tambah ke list global
            self.all_patterns.extend(cleaned_patterns)
            self.all_tags.extend([tag] * len(cleaned_patterns))
            self.all_responses.extend(cleaned_responses)
            
            logger.debug(f"   Processed '{tag}': {len(cleaned_patterns)} patterns")
        
        # Hitung metrics
        self._calculate_metrics(processed_intents)
        
        # Simpan processed dataset
        self._save_processed_intents(processed_intents)
        
        return processed_intents
    
    def _calculate_metrics(self, processed_intents: List[Dict]):
        """Hitung metrics kualitas data"""
        total_patterns = sum(len(i['patterns_cleaned']) for i in processed_intents)
        total_responses = sum(len(i['responses']) for i in processed_intents)
        
        # Hitung class balance
        tag_counts = Counter()
        for intent in processed_intents:
            tag_counts[intent['tag']] = len(intent['patterns_cleaned'])
        
        max_count = max(tag_counts.values()) if tag_counts else 1
        min_count = min(tag_counts.values()) if tag_counts else 0
        class_balance = min_count / max_count if max_count > 0 else 0
        
        # Hitung quality score
        pattern_lengths = [len(p) for p in self.all_patterns]
        avg_pattern_length = np.mean(pattern_lengths) if pattern_lengths else 0
        
        response_lengths = [len(r) for r in self.all_responses]
        avg_response_length = np.mean(response_lengths) if response_lengths else 0
        
        # Quality metrics
        self.quality_metrics.update({
            'total_intents': len(processed_intents),
            'total_patterns': total_patterns,
            'total_responses': total_responses,
            'avg_patterns_per_intent': total_patterns / len(processed_intents) if processed_intents else 0,
            'avg_responses_per_intent': total_responses / len(processed_intents) if processed_intents else 0,
            'class_balance_score': class_balance,
            'avg_pattern_length': avg_pattern_length,
            'avg_response_length': avg_response_length,
            'unique_words': len(set(' '.join(self.all_patterns).split())),
            'processing_timestamp': datetime.now().isoformat()
        })
    
    def _save_processed_intents(self, processed_intents: List[Dict]):
        """Simpan processed intents ke berbagai format"""
        # 1. Save as JSON untuk training
        simplified_data = {
            'metadata': {
                'processed_date': datetime.now().isoformat(),
                'total_intents': len(processed_intents),
                'total_patterns': sum(len(i['patterns_cleaned']) for i in processed_intents),
                'total_responses': sum(len(i['responses']) for i in processed_intents),
                'quality_metrics': self.quality_metrics
            },
            'intents': processed_intents
        }
        
        with open('models/processed/intents_processed.json', 'w', encoding='utf-8') as f:
            json.dump(simplified_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Saved processed intents: models/processed/intents_processed.json")
        
        # 2. Save untuk quick lookup (tanpa context)
        training_data = []
        for intent in processed_intents:
            for pattern in intent['patterns_cleaned']:
                training_data.append({
                    'text': pattern,
                    'intent': intent['tag']
                })
        
        df_training = pd.DataFrame(training_data)
        df_training.to_csv('models/processed/training_data.csv', index=False, encoding='utf-8')
        
        # 3. Save responses lookup
        responses_lookup = {}
        for intent in processed_intents:
            responses_lookup[intent['tag']] = intent['responses']
        
        with open('models/processed/responses_lookup.json', 'w', encoding='utf-8') as f:
            json.dump(responses_lookup, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Multiple formats saved in models/processed/")
    
    def analyze_distribution(self) -> Dict:
        """Analisis distribusi data yang mendalam"""
        if not self.all_tags:
            logger.warning("No data to analyze")
            return {}
        
        tag_counter = Counter(self.all_tags)
        
        # Hitung statistics
        total_patterns = len(self.all_tags)
        tag_stats = {}
        
        logger.info("\nAdvanced Distribution Analysis:")
        logger.info("=" * 60)
        
        for tag, count in tag_counter.most_common():
            percentage = (count / total_patterns) * 100
            intent_data = next((i for i in self.intents if i['tag'] == tag), {})
            responses_count = len(intent_data.get('responses', []))
            
            tag_stats[tag] = {
                'patterns_count': count,
                'percentage': percentage,
                'responses_count': responses_count,
                'contexts': intent_data.get('context', []),
                'entities': intent_data.get('entities', [])
            }
            
            logger.info(f"  {tag:25} {count:4} patterns ({percentage:5.1f}%) | {responses_count:2} responses")
        
        logger.info("=" * 60)
        logger.info(f"  Total: {total_patterns} patterns across {len(tag_counter)} intents")
        
        # Visualisasi data imbalance
        imbalance_ratio = max(tag_counter.values()) / min(tag_counter.values()) if min(tag_counter.values()) > 0 else float('inf')
        logger.info(f"  Imbalance Ratio: {imbalance_ratio:.2f}")
        
        # Save detailed analysis
        df_stats = pd.DataFrame([
            {
                'tag': tag,
                'patterns': stats['patterns_count'],
                'percentage': stats['percentage'],
                'responses': stats['responses_count']
            }
            for tag, stats in tag_stats.items()
        ])
        
        df_stats.to_csv('models/processed/tag_distribution_detailed.csv', index=False)
        
        # Generate report
        self._generate_analysis_report(tag_stats, tag_counter)
        
        return tag_stats
    
    def _generate_analysis_report(self, tag_stats: Dict, tag_counter: Counter):
        """Generate comprehensive analysis report"""
        report = {
            'summary': {
                'total_intents': len(tag_stats),
                'total_patterns': sum(tag_counter.values()),
                'total_unique_words': len(set(' '.join(self.all_patterns).split())),
                'average_patterns_per_intent': np.mean(list(tag_counter.values())),
                'median_patterns_per_intent': np.median(list(tag_counter.values())),
                'std_patterns_per_intent': np.std(list(tag_counter.values())),
                'date_generated': datetime.now().isoformat()
            },
            'intent_ranking': [
                {
                    'rank': i + 1,
                    'tag': tag,
                    'patterns': count,
                    'percentage': (count / sum(tag_counter.values())) * 100
                }
                for i, (tag, count) in enumerate(tag_counter.most_common())
            ],
            'quality_metrics': self.quality_metrics,
            'potential_issues': self._identify_issues(tag_stats)
        }
        
        with open('reports/dataset_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        # Juga save sebagai readable text
        with open('reports/dataset_analysis.txt', 'w', encoding='utf-8') as f:
            f.write("=" * 60 + "\n")
            f.write("DATASET ANALYSIS REPORT\n")
            f.write("=" * 60 + "\n\n")
            
            f.write("SUMMARY:\n")
            f.write(f"  Total Intents: {report['summary']['total_intents']}\n")
            f.write(f"  Total Patterns: {report['summary']['total_patterns']}\n")
            f.write(f"  Unique Words: {report['summary']['total_unique_words']}\n")
            f.write(f"  Avg Patterns/Intent: {report['summary']['average_patterns_per_intent']:.1f}\n")
            f.write(f"  Std Patterns/Intent: {report['summary']['std_patterns_per_intent']:.1f}\n\n")
            
            f.write("TOP 10 INTENTS:\n")
            for item in report['intent_ranking'][:10]:
                f.write(f"  {item['rank']:2}. {item['tag']:25} {item['patterns']:4} ({item['percentage']:.1f}%)\n")
            
            f.write("\nBOTTOM 10 INTENTS:\n")
            for item in report['intent_ranking'][-10:]:
                f.write(f"  {item['rank']:2}. {item['tag']:25} {item['patterns']:4} ({item['percentage']:.1f}%)\n")
            
            if report['potential_issues']:
                f.write("\nPOTENTIAL ISSUES:\n")
                for issue in report['potential_issues']:
                    f.write(f"  • {issue}\n")
        
        logger.info(f"Analysis report saved to reports/dataset_analysis.json")
    
    def _identify_issues(self, tag_stats: Dict) -> List[str]:
        """Identifikasi potential issues dalam dataset"""
        issues = []
        
        for tag, stats in tag_stats.items():
            # Issue: Terlalu sedikit patterns
            if stats['patterns_count'] < 5:
                issues.append(f"Intent '{tag}' hanya punya {stats['patterns_count']} patterns (minimum 5 disarankan)")
            
            # Issue: Terlalu sedikit responses
            if stats['responses_count'] < 2:
                issues.append(f"Intent '{tag}' hanya punya {stats['responses_count']} response (minimum 2 disarankan)")
        
        # Issue: Class imbalance parah
        pattern_counts = [stats['patterns_count'] for stats in tag_stats.values()]
        if pattern_counts:
            imbalance = max(pattern_counts) / min(pattern_counts)
            if imbalance > 10:
                issues.append(f"Class imbalance tinggi: ratio {imbalance:.1f}:1 (disarankan < 10:1)")
        
        return issues
    
    def create_train_test_split(self, 
                               test_size: float = 0.15,
                               val_size: float = 0.15,
                               random_state: int = 42,
                               stratify: bool = True) -> Tuple:
        """Create train/validation/test split dengan stratifikasi"""
        if not self.all_patterns:
            logger.error("No patterns available for splitting")
            return None
        
        logger.info(f"\nCreating data splits (test={test_size}, val={val_size})...")
        
        # Split: Train + (Validation + Test)
        if stratify:
            X_temp, X_test, y_temp, y_test = train_test_split(
                self.all_patterns, 
                self.all_tags,
                test_size=test_size,
                random_state=random_state,
                stratify=self.all_tags
            )
            
            # Split temp menjadi train dan validation
            val_ratio = val_size / (1 - test_size)
            X_train, X_val, y_train, y_val = train_test_split(
                X_temp, y_temp,
                test_size=val_ratio,
                random_state=random_state,
                stratify=y_temp
            )
        else:
            # Non-stratified split
            X_temp, X_test, y_temp, y_test = train_test_split(
                self.all_patterns, 
                self.all_tags,
                test_size=test_size,
                random_state=random_state
            )
            
            val_ratio = val_size / (1 - test_size)
            X_train, X_val, y_train, y_val = train_test_split(
                X_temp, y_temp,
                test_size=val_ratio,
                random_state=random_state
            )
        
        logger.info(f"   Training set:   {len(X_train)} samples ({len(X_train)/len(self.all_patterns)*100:.1f}%)")
        logger.info(f"   Validation set: {len(X_val)} samples ({len(X_val)/len(self.all_patterns)*100:.1f}%)")
        logger.info(f"   Test set:       {len(X_test)} samples ({len(X_test)/len(self.all_patterns)*100:.1f}%)")
        
        # Simpan splits
        splits = {
            'train': {'patterns': X_train, 'tags': y_train},
            'val': {'patterns': X_val, 'tags': y_val},
            'test': {'patterns': X_test, 'tags': y_test}
        }
        
        for split_name, split_data in splits.items():
            filepath = f'models/processed/{split_name}_data.json'
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(split_data, f, ensure_ascii=False, indent=2)
            
            # Juga save sebagai CSV
            df_split = pd.DataFrame({
                'text': split_data['patterns'],
                'intent': split_data['tags']
            })
            df_split.to_csv(f'models/processed/{split_name}_data.csv', index=False, encoding='utf-8')
        
        logger.info("All splits saved to models/processed/")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def run_full_pipeline(self):
        """Jalankan full processing pipeline"""
        logger.info("Starting full dataset processing pipeline...")
        logger.info("=" * 60)
        
        start_time = datetime.now()
        
        # Step 1: Load data
        if not self.load_and_validate():
            return None
        
        # Step 2: Extract dan preprocess intents
        processed_intents = self.extract_intents(
            max_patterns_per_intent=100,
            min_patterns_per_intent=5,
            augment_rare_intents=True,
            augmentation_threshold=8
        )
        
        if not processed_intents:
            logger.error("Failed to process intents")
            return None
        
        # Step 3: Analisis
        tag_stats = self.analyze_distribution()
        
        # Step 4: Split data
        splits = self.create_train_test_split(
            test_size=0.15,
            val_size=0.15,
            stratify=True
        )
        
        # Calculate processing time
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        
        logger.info("\n" + "=" * 60)
        logger.info("PROCESSING COMPLETE!")
        logger.info("=" * 60)
        logger.info(f"Total processing time: {processing_time:.2f} seconds")
        logger.info(f"Output saved in: models/processed/")
        logger.info(f"Reports saved in: reports/")
        logger.info("\nNext steps:")
        logger.info("   1. Check quality metrics in reports/dataset_analysis.json")
        logger.info("   2. Review potential issues in the analysis")
        logger.info("   3. Run: python scripts/train_model.py")
        logger.info("   4. Deploy your model!")
        
        return {
            'success': True,
            'processing_time': processing_time,
            'metrics': self.quality_metrics,
            'output_files': [
                'models/processed/intents_processed.json',
                'models/processed/training_data.csv',
                'models/processed/responses_lookup.json',
                'reports/dataset_analysis.json'
            ]
        }

def main():
    """Main execution function"""
    print("\n" + "=" * 60)
    print("SIMPLIFIED DATASET PROCESSOR")
    print("=" * 60)
    
    # Cari file intents.json di beberapa lokasi
    possible_paths = [
        'models/intents.json',
        '../models/intents.json',
        '../../models/intents.json',
        'models/trained/intents.json',
        '../models/trained/intents.json',
        '../../models/trained/intents.json',
        'intents.json',
        '../intents.json',
        '../../intents.json',
        'data/intents.json',
        '../data/intents.json'
    ]
    
    input_file = None
    for path in possible_paths:
        if os.path.exists(path):
            input_file = path
            print(f"Found dataset: {path}")
            break
    
    if not input_file:
        print("ERROR: Could not find intents.json in any location")
        print("Please place intents.json in one of these locations:")
        for path in possible_paths:
            print(f"  - {path}")
        return
    
    # Tanya user apakah ingin pakai file yang ditemukan
    print(f"\nUsing dataset: {input_file}")
    
    # Initialize processor
    processor = DatasetProcessor(input_file)
    
    # Run pipeline
    result = processor.run_full_pipeline()
    
    if result and result.get('success'):
        print("\nAll tasks completed successfully!")
        print(f"Check logs/dataset_processing.log for detailed logs")
        
        # Show summary
        print(f"\nDataset Summary:")
        print(f"   Intents: {result['metrics']['total_intents']}")
        print(f"   Patterns: {result['metrics']['total_patterns']}")
        print(f"   Responses: {result['metrics']['total_responses']}")
        print(f"   Processing time: {result['processing_time']:.2f}s")
    else:
        print("\nProcessing failed. Check logs for details.")

if __name__ == "__main__":
    main()
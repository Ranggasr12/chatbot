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
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3001"}})

# Inisialisasi variabel global
model = None
vectorizer = None
label_encoder = None
intents_data = {"intents": []}
intent_responses = {}
intent_patterns = {}

# Load model dan dataset
try:
    # Cek file model di beberapa lokasi
    model_paths = [
        'scripts/models/trained/model_joblib',
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
        print("⚠️  No ML model found, using rule-based only")
        
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("⚠️  Using rule-based fallback")

# Load dataset untuk responses
try:
    # Cek intents di beberapa lokasi
    intents_paths = [
        'models/intents.json',
        'intents.json'
    ]
    
    for intents_path in intents_paths:
        if os.path.exists(intents_path):
            print(f"🔍 Found intents at: {intents_path}")
            with open(intents_path, 'r', encoding='utf-8') as f:
                intents_data = json.load(f)
            print(f"✅ Loaded {len(intents_data.get('intents', []))} intents")
            break
    
    # Create intent lookup
    for intent in intents_data.get('intents', []):
        intent_responses[intent['tag']] = intent['responses']
        intent_patterns[intent['tag']] = [p.lower() for p in intent['patterns']]
        
except Exception as e:
    print(f"❌ Error loading intents: {e}")

class ChatbotEngine:
    def __init__(self):
        self.conversation_history = []
        self.context = {
            'current_topic': None,
            'last_intent': None,
            'expecting_followup': False,
            'followup_step': 0,
            'user_data': {}
        }
        self.conversation_flows = self._init_conversation_flows()
    
    def _init_conversation_flows(self):
        """Define conversation flows untuk jawaban berlanjut"""
        return {
            'asrama_mahasiswa': {
                'steps': [
                    {
                        'question': 'Apakah Anda ingin tahu tentang biaya asrama atau fasilitas?',
                        'options': ['biaya', 'fasilitas', 'pendaftaran', 'semua'],
                        'responses': {
                            'biaya': '🏠 **Biaya Asrama (per semester):**\n1. Standard: Rp 1.5-2.5 juta\n2. Premium: Rp 2.5-3.5 juta\n3. VIP: Rp 3.5-4.5 juta\n\nIngin tahu fasilitas masing-masing tipe?',
                            'fasilitas': '🛏️ **Fasilitas Asrama:**\n• Standard: Kamar 3x3m, AC, WiFi area umum\n• Premium: Kamar 4x4m, kamar mandi dalam, water heater\n• VIP: Kitchenette kecil, cleaning service 2x/minggu\n\nIngin tahu biaya atau cara pendaftaran?',
                            'pendaftaran': '📝 **Pendaftaran Asrama:**\n• Waktu: 2 minggu sebelum semester\n• Portal: portal.kampus.ac.id/asrama\n• Kuota: 200 kamar/semester\n• Prioritas: Mahasiswa baru & IPK ≥ 3.0\n\nAda yang ingin ditanyakan lagi tentang asrama?',
                            'semua': '🏠 **Informasi Lengkap Asrama:**\n\n**Biaya (per semester):**\n1. Standard: Rp 1.5-2.5 juta\n2. Premium: Rp 2.5-3.5 juta\n3. VIP: Rp 3.5-4.5 juta\n\n**Fasilitas:**\n• Standard: Kamar 3x3m, AC, WiFi\n• Premium: Kamar mandi dalam, water heater\n• VIP: Kitchenette, cleaning service\n\n**Pendaftaran:** portal.kampus.ac.id/asrama\n\nAda pertanyaan lain?'
                        }
                    }
                ],
                'default_response': '🏠 **Informasi Asrama Mahasiswa**\n\nAda yang spesifik ingin Anda tanyakan?\n1. Biaya asrama\n2. Fasilitas kamar\n3. Cara pendaftaran\n4. Syarat & kuota'
            },
            
            'informasi_jurusan': {
                'steps': [
                    {
                        'question': 'Fakultas apa yang ingin Anda ketahui?',
                        'options': ['teknik', 'kedokteran', 'ekonomi', 'hukum', 'semua'],
                        'responses': {
                            'teknik': '🎓 **Fakultas Teknik:**\n• Teknik Informatika\n• Teknik Sipil\n• Teknik Elektro\n• Teknik Mesin\n• Teknik Industri\n\nIngin tahu jurusan lain atau detail perkuliahan?',
                            'kedokteran': '🏥 **Fakultas Kedokteran:**\n• Pendidikan Dokter\n• Ilmu Keperawatan\n• Farmasi\n• Gizi Klinik\n\nAda yang spesifik tentang kedokteran?',
                            'ekonomi': '💰 **Fakultas Ekonomi:**\n• Manajemen\n• Akuntansi\n• Ekonomi Pembangunan\n• Bisnis Digital\n\nIngin tahu prospek kerja atau kurikulum?',
                            'hukum': '⚖️ **Fakultas Hukum:**\n• Ilmu Hukum\n• Hukum Internasional\n• Hukum Bisnis\n\nAda pertanyaan tentang fakultas hukum?',
                            'semua': '🏛️ **12 Fakultas dengan 50+ Program Studi:**\n\n1. Teknik (Informatika, Sipil, Elektro, Mesin)\n2. Kedokteran (Dokter, Keperawatan, Farmasi)\n3. Ekonomi (Manajemen, Akuntansi, Bisnis)\n4. Hukum (Ilmu Hukum, Hukum Internasional)\n5. Psikologi\n6. Arsitektur\n7. Pertanian\n8. Ilmu Sosial & Politik\n9. Sastra & Budaya\n10. Matematika & IPA\n11. Teknologi Pertanian\n12. Ilmu Komputer\n\nFakultas mana yang ingin didetailkan?'
                        }
                    }
                ],
                'default_response': '🎓 **Informasi Jurusan & Fakultas**\n\nKami memiliki 12 fakultas. Fakultas apa yang ingin Anda ketahui?\n(contoh: teknik, kedokteran, ekonomi, hukum)'
            },
            
            'beasiswa': {
                'steps': [
                    {
                        'question': 'Jenis beasiswa apa yang ingin Anda ketahui?',
                        'options': ['prestasi', 'kip-kuliah', 'perusahaan', 'semua', 'syarat'],
                        'responses': {
                            'prestasi': '🏆 **Beasiswa Prestasi:**\n• IPK min 3.5\n• Tidak ada nilai D/E\n• Aktif organisasi (nilai tambah)\n• Pendaftaran: awal semester\n• Benefit: Bebas UKT + tunjangan\n\nIngin tahu beasiswa lain?',
                            'kip-kuliah': '💙 **Beasiswa KIP-Kuliah:**\n• Untuk ekonomi kurang mampu\n• SKTM dari kelurahan\n• Pendaftaran via portal KIP-Kuliah\n• Benefit: Full tuition + living allowance\n\nAda pertanyaan tentang KIP?',
                            'perusahaan': '🏢 **Beasiswa Perusahaan:**\n• Dari mitra: Telkom, Bank Mandiri, Astra\n• Syarat: IPK min 3.0, tes wawancara\n• Benefit: Tuition + magang di perusahaan\n• Ikatan dinas: 1-2 tahun\n\nIngin tahu syarat lengkap?',
                            'semua': '💰 **Semua Beasiswa Tersedia:**\n\n1. **Prestasi** (IPK ≥ 3.5) - Bebas UKT\n2. **KIP-Kuliah** (Ekonomi kurang mampu) - Full support\n3. **Perusahaan** (Telkom, Mandiri, Astra) - Tuition + magang\n4. **Pemerintah Daerah** (Sesuai asal) - Beragam\n\nBeasiswa mana yang ingin didetailkan?',
                            'syarat': '📋 **Syarat Umum Beasiswa:**\n1. Mengisi formulir online\n2. Transkrip nilai terakhir\n3. Surat rekomendasi dosen\n4. Essay motivasi\n5. Fotokopi KTM & KTP\n6. Pas foto 4x6\n\nPendaftaran: beasiswa.kampus.ac.id'
                        }
                    }
                ],
                'default_response': '💰 **Informasi Beasiswa**\n\nBeasiswa apa yang ingin Anda ketahui?\n1. Beasiswa Prestasi\n2. KIP-Kuliah\n3. Beasiswa Perusahaan\n4. Syarat umum'
            },
            
            'bus_schedule': {
                'steps': [
                    {
                        'question': 'Informasi shuttle bus apa yang Anda butuhkan?',
                        'options': ['jadwal', 'rute', 'aplikasi', 'semua'],
                        'responses': {
                            'jadwal': '⏰ **Jam Operasional Shuttle:**\n• Senin-Jumat: 06.30 - 21.00\n• Sabtu: 07.00 - 18.00\n• Minggu: 08.00 - 16.00\n• Frekuensi: 15-20 menit sekali\n\nIngin tahu rute atau aplikasi tracking?',
                            'rute': '🗺️ **3 Rute Utama:**\n\n1. **Merah:** Gerbang Utama → Teknik → Perpustakaan\n2. **Biru:** Gerbang Timur → Kedokteran → Student Center\n3. **Hijau:** Gerbang Barat → Ekonomi → Asrama\n\nAda rute spesifik yang ingin ditanyakan?',
                            'aplikasi': '📱 **Aplikasi Campus Transport:**\n• Live tracking bus\n• Notifikasi kedatangan\n• Info delay & gangguan\n• Download: Play Store/App Store\n\nFitur: real-time location, estimated time arrival',
                            'semua': '🚌 **Info Lengkap Shuttle Bus:**\n\n**Jam:** 06.30-21.00 (Weekdays)\n**Rute:** 3 jalur (Merah, Biru, Hijau)\n**App:** Campus Transport (live tracking)\n**Kontak:** (021) 1234-5678 ext. 901\n\nAda yang spesifik?'
                        }
                    }
                ],
                'default_response': '🚌 **Informasi Shuttle Bus**\n\nApa yang ingin Anda ketahui?\n1. Jadwal operasional\n2. Rute perjalanan\n3. Aplikasi tracking\n4. Kontak & informasi'
            }
        }
    
    def preprocess_text(self, text):
        """Preprocess user input"""
        return text.lower().strip()
    
    def handle_conversation_flow(self, user_input, current_intent):
        """Handle multi-step conversation"""
        user_input_lower = user_input.lower()
        
        # Jika dalam conversation flow
        if self.context['expecting_followup'] and self.context['current_topic']:
            flow = self.conversation_flows.get(self.context['current_topic'])
            if flow and self.context['followup_step'] < len(flow['steps']):
                current_step = flow['steps'][self.context['followup_step']]
                
                # Cek apakah user merespons opsi
                for option in current_step['options']:
                    if option in user_input_lower:
                        response = current_step['responses'].get(option, 
                            "Terima kasih informasinya. Ada lagi yang bisa saya bantu?")
                        
                        # Tanyakan followup lagi
                        self.context['followup_step'] += 1
                        if self.context['followup_step'] < len(flow['steps']):
                            next_step = flow['steps'][self.context['followup_step']]
                            response += f"\n\n{next_step['question']}"
                        else:
                            # End of flow
                            self.context['expecting_followup'] = False
                            self.context['followup_step'] = 0
                            response += "\n\nAda pertanyaan lain tentang topik ini?"
                        
                        return response
                
                # Jika tidak merespons opsi, tanyakan ulang
                return f"{current_step['question']}\n\nOpsi: {', '.join(current_step['options'])}"
        
        # Jika intent memiliki conversation flow
        if current_intent in self.conversation_flows:
            flow = self.conversation_flows[current_intent]
            self.context['current_topic'] = current_intent
            self.context['expecting_followup'] = True
            self.context['followup_step'] = 0
            self.context['last_intent'] = current_intent
            
            # Return pertanyaan pertama dari flow
            first_step = flow['steps'][0]
            return f"{flow['default_response']}\n\n{first_step['question']}\n(Opsi: {', '.join(first_step['options'])})"
        
        return None
    
    def rule_based_matching(self, user_input):
        """Improved rule-based intent matching"""
        user_input_lower = user_input.lower()
        
        # Cek keyword langsung di intent_responses
        best_intent = 'tidak_mengerti'
        best_score = 0
        
        for intent_tag, patterns in intent_patterns.items():
            score = 0
            for pattern in patterns:
                if pattern in user_input_lower:
                    score += 2.0  # Exact match bonus
                else:
                    # Check individual words
                    pattern_words = pattern.split()
                    for word in pattern_words:
                        if len(word) > 3 and word in user_input_lower:
                            score += 0.5
            
            if score > best_score:
                best_score = score
                best_intent = intent_tag
        
        # Minimum threshold
        if best_score >= 1.0:
            return best_intent, min(0.6 + (best_score * 0.1), 0.9)
        
        # Fallback keyword matching
        keyword_mapping = {
            'jurusan': 'informasi_jurusan',
            'prodi': 'informasi_jurusan', 
            'fakultas': 'informasi_jurusan',
            'beasiswa': 'beasiswa',
            'scholarship': 'beasiswa',
            'dana': 'beasiswa',
            'biaya': 'beasiswa',
            'asrama': 'asrama_mahasiswa',
            'dorm': 'asrama_mahasiswa',
            'kost': 'asrama_mahasiswa',
            'kamar': 'asrama_mahasiswa',
            'shuttle': 'bus_schedule',
            'bus': 'bus_schedule',
            'angkutan': 'bus_schedule',
            'transport': 'bus_schedule',
            'jadwal': 'jadwal_kuliah',
            'kuliah': 'jadwal_kuliah',
            'timetable': 'jadwal_kuliah',
            'jam': 'facility_hours',
            'buka': 'facility_hours',
            'tutup': 'facility_hours',
            'perpustakaan': 'facility_hours',
            'library': 'facility_hours',
            'parkir': 'parking_info',
            'parking': 'parking_info',
            'kantin': 'canteen_food',
            'makan': 'canteen_food',
            'food': 'canteen_food',
            'olahraga': 'sport_facilities',
            'sport': 'sport_facilities',
            'gym': 'sport_facilities',
            'kesehatan': 'health_services',
            'klinik': 'health_services',
            'dokter': 'health_services',
            'lab': 'lab_booking',
            'komputer': 'lab_booking',
            'booking': 'lab_booking',
            'sks': 'sks_dan_ipk',
            'ipk': 'sks_dan_ipk',
            'nilai': 'sks_dan_ipk',
            'krs': 'krs_dan_kartu_rencana_studi',
            'rencana studi': 'krs_dan_kartu_rencana_studi',
            'kalender': 'kalender_akademik',
            'akademik': 'kalender_akademik',
            'jurnal': 'layanan_perpustakaan_digital',
            'e-journal': 'layanan_perpustakaan_digital',
            'online': 'layanan_perpustakaan_digital',
            'halo': 'greeting',
            'hai': 'greeting',
            'hello': 'greeting',
            'selamat': 'greeting'
        }
        
        for keyword, intent_tag in keyword_mapping.items():
            if keyword in user_input_lower:
                return intent_tag, 0.8
        
        return "tidak_mengerti", 0.2
    
    def get_response(self, user_input):
        """Get chatbot response dengan conversation flow"""
        user_input_lower = user_input.lower().strip()
        
        if not user_input_lower:
            return {
                'response': 'Silakan ketik pesan Anda.',
                'intent': 'empty',
                'confidence': 0.0,
                'method': 'rule_based',
                'expecting_followup': False
            }
        
        # Cek jika user ingin keluar dari conversation
        exit_keywords = ['lain', 'tidak', 'gak', 'stop', 'keluar', 'selesai', 'cukup', 'sudah']
        if any(keyword in user_input_lower for keyword in exit_keywords) and self.context['expecting_followup']:
            self.context['expecting_followup'] = False
            self.context['followup_step'] = 0
            return {
                'response': 'Baik, ada yang bisa saya bantu lagi?',
                'intent': 'greeting',
                'confidence': 0.9,
                'method': 'conversation_exit',
                'expecting_followup': False
            }
        
        # Cek greeting sederhana
        greetings = ['halo', 'hai', 'hello', 'hi', 'selamat']
        if any(greeting in user_input_lower for greeting in greetings) and len(user_input_lower) < 20:
            response = random.choice(intent_responses.get('greeting', ['Halo! Ada yang bisa saya bantu?']))
            return {
                'response': response,
                'intent': 'greeting',
                'confidence': 0.9,
                'method': 'greeting_detection',
                'expecting_followup': False
            }
        
        intent = "tidak_mengerti"
        confidence = 0.0
        method = "rule_based"
        
        # 1. Coba ML model jika tersedia
        if model is not None and vectorizer is not None:
            try:
                X = vectorizer.transform([user_input_lower])
                prediction = model.predict(X)[0]
                probability = model.predict_proba(X).max()
                
                if probability >= 0.3:
                    intent = label_encoder.inverse_transform([prediction])[0]
                    confidence = float(probability)
                    method = "ml_model"
            except Exception as e:
                print(f"⚠️ ML error: {e}")
        
        # 2. Jika ML tidak yakin/tidak ada, gunakan rule-based
        if intent == "tidak_mengerti" or confidence < 0.4:
            rule_intent, rule_confidence = self.rule_based_matching(user_input)
            if rule_intent != "tidak_mengerti":
                intent = rule_intent
                confidence = rule_confidence
                method = "rule_based"
        
        # 3. Handle conversation flow
        flow_response = None
        if self.context['expecting_followup']:
            # Jika dalam flow, gunakan intent terakhir
            intent = self.context.get('last_intent', intent)
            flow_response = self.handle_conversation_flow(user_input, intent)
        
        # 4. Jika tidak dalam flow, coba mulai conversation flow
        if not flow_response and intent in self.conversation_flows:
            flow_response = self.handle_conversation_flow(user_input, intent)
        
        # 5. Get response
        if flow_response:
            response = flow_response
        elif intent in intent_responses:
            response = random.choice(intent_responses[intent])
        else:
            # Fallback responses
            fallbacks = [
                "Maaf, saya belum memahami. Bisa tolong diperjelas?",
                "Saya bisa membantu dengan informasi tentang: jurusan, beasiswa, asrama, shuttle bus, dll.",
                "Coba tanyakan hal spesifik seperti: 'beasiswa untuk mahasiswa baru' atau 'jadwal shuttle bus'"
            ]
            response = random.choice(fallbacks)
            intent = "tidak_mengerti"
            confidence = 0.3
        
        # Save history
        self.conversation_history.append({
            'timestamp': datetime.now().isoformat(),
            'user': user_input,
            'bot': response,
            'intent': intent,
            'confidence': confidence,
            'method': method,
            'context': self.context.copy()
        })
        
        # Keep history manageable
        if len(self.conversation_history) > 50:
            self.conversation_history = self.conversation_history[-50:]
        
        return {
            'response': response,
            'intent': intent,
            'confidence': float(confidence),
            'method': method,
            'expecting_followup': self.context['expecting_followup'],
            'current_topic': self.context['current_topic'],
            'timestamp': datetime.now().isoformat()
        }

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
        
        if len(user_message) > 500:
            return jsonify({
                'success': False,
                'error': 'Message too long',
                'response': 'Pesan terlalu panjang. Maksimal 500 karakter.'
            }), 400
        
        print(f"📥 Received: {user_message}")
        result = chatbot.get_response(user_message)
        
        return jsonify({
            'success': True,
            'intent': result['intent'],
            'confidence': result['confidence'],
            'response': result['response'],
            'method': result['method'],
            'model_available': model is not None,
            'intents_count': len(intent_responses),
            'expecting_followup': result['expecting_followup'],
            'current_topic': result['current_topic'],
            'timestamp': result['timestamp']
        })
    
    except Exception as e:
        print(f"❌ API Error: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'response': 'Terjadi kesalahan pada server.'
        }), 500

@app.route('/api/chat/history', methods=['GET'])
def get_history():
    """Get conversation history"""
    return jsonify({
        'success': True,
        'history': chatbot.conversation_history[-20:],
        'total_messages': len(chatbot.conversation_history)
    })

@app.route('/api/chat/reset', methods=['POST'])
def reset_chat():
    """Reset conversation"""
    chatbot.conversation_history = []
    chatbot.context = {
        'current_topic': None,
        'last_intent': None,
        'expecting_followup': False,
        'followup_step': 0,
        'user_data': {}
    }
    
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
        'conversation_flows': len(chatbot.conversation_flows),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/intents', methods=['GET'])
def get_intents():
    """Get available intents"""
    intents_list = []
    for intent in intents_data.get('intents', []):
        intents_list.append({
            'tag': intent.get('tag'),
            'patterns': len(intent.get('patterns', [])),
            'responses': len(intent.get('responses', []))
        })
    
    return jsonify({
        'success': True,
        'total_intents': len(intents_list),
        'intents': intents_list
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🤖 CHATBOT AKADEMIK API - WITH CONVERSATION FLOW")
    print("="*60)
    print(f"📊 Model Status: {'✅ Loaded' if model is not None else '⚠️  Rule-based Only'}")
    print(f"📚 Intents Loaded: {len(intent_responses)}")
    print(f"🔄 Conversation Flows: {len(chatbot.conversation_flows)} topics")
    print("="*60)
    print("🚀 Starting Flask server...")
    print("📡 API URL: http://localhost:5000")
    print("\n💡 Conversation topics available:")
    print("   • asrama_mahasiswa (multi-step)")
    print("   • informasi_jurusan (multi-step)")
    print("   • beasiswa (multi-step)")
    print("   • bus_schedule (multi-step)")
    print("="*60)
    print("\n💡 Press Ctrl+C to stop\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
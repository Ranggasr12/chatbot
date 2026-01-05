from http.server import BaseHTTPRequestHandler
import json
import random
from datetime import datetime
import os

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Health check endpoint"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'success': True,
            'status': 'healthy',
            'service': 'Chatbot API (Edge Function)',
            'model_loaded': False,
            'intents_loaded': 4,
            'conversation_flows': 4,
            'timestamp': datetime.now().isoformat(),
            'environment': os.environ.get('VERCEL_ENV', 'development')
        }
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        """Handle chat messages"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = json.loads(self.rfile.read(content_length))
            message = post_data.get('message', '').strip()
            
            if not message:
                self.send_error_response('Message is required', 400)
                return
            
            if len(message) > 500:
                self.send_error_response('Message too long (max 500 chars)', 400)
                return
            
            print(f"📥 Received: {message}")
            result = self.get_chatbot_response(message)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps(result).encode())
            
        except json.JSONDecodeError:
            self.send_error_response('Invalid JSON', 400)
        except Exception as e:
            print(f"❌ Error: {e}")
            self.send_error_response(str(e), 500)
    
    def send_error_response(self, error, status_code):
        """Send error response"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'success': False,
            'error': error,
            'response': 'Terjadi kesalahan pada sistem.'
        }
        
        self.wfile.write(json.dumps(response).encode())
    
    def get_chatbot_response(self, user_input):
        """Rule-based chatbot logic (tanpa ML)"""
        user_input_lower = user_input.lower()
        
        # Conversation flows (simplified)
        conversation_flows = {
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
            }
        }
        
        # Simple intent detection
        intent = "tidak_mengerti"
        confidence = 0.0
        
        keyword_mapping = {
            'jurusan': ('informasi_jurusan', 0.9),
            'prodi': ('informasi_jurusan', 0.9),
            'fakultas': ('informasi_jurusan', 0.8),
            'beasiswa': ('beasiswa', 0.9),
            'dana': ('beasiswa', 0.8),
            'asrama': ('asrama_mahasiswa', 0.9),
            'kost': ('asrama_mahasiswa', 0.8),
            'shuttle': ('bus_schedule', 0.9),
            'bus': ('bus_schedule', 0.8),
            'halo': ('greeting', 0.95),
            'hai': ('greeting', 0.95),
            'hello': ('greeting', 0.95)
        }
        
        # Check for keywords
        for keyword, (intent_tag, conf) in keyword_mapping.items():
            if keyword in user_input_lower:
                intent = intent_tag
                confidence = conf
                break
        
        # Get response based on intent
        responses = {
            'informasi_jurusan': [
                "🎓 **Fakultas & Jurusan:**\n• Teknik: Informatika, Sipil, Elektro, Mesin\n• Kedokteran: Dokter, Keperawatan, Farmasi\n• Ekonomi: Manajemen, Akuntansi, Bisnis Digital\n• Hukum: Ilmu Hukum, Hukum Internasional\n• Dan 8 fakultas lainnya!",
                "📚 **Program Studi Tersedia:**\n1. Teknik Informatika (S1)\n2. Kedokteran (S1)\n3. Manajemen (S1)\n4. Ilmu Hukum (S1)\n5. Psikologi (S1)\n6. Arsitektur (S1)\n7. Akuntansi (S1)\n8. Farmasi (S1)"
            ],
            'beasiswa': [
                "💰 **Jenis Beasiswa:**\n1. Prestasi (IPK ≥ 3.5) - Bebas UKT\n2. KIP-Kuliah - Untuk ekonomi kurang mampu\n3. Perusahaan (Telkom, Mandiri) - Tuition + magang\n4. Pemerintah Daerah - Beragam program",
                "🏆 **Beasiswa Prestasi:**\n• Syarat: IPK min 3.5\n• Benefit: Bebas UKT + tunjangan\n• Pendaftaran: Portal beasiswa kampus"
            ],
            'asrama_mahasiswa': [
                "🏠 **Asrama Mahasiswa:**\n• Biaya: Rp 1.5-4.5 juta/semester\n• Tipe: Standard, Premium, VIP\n• Fasilitas: AC, WiFi, kamar mandi dalam\n• Pendaftaran: portal.kampus.ac.id/asrama",
                "🛏️ **Tipe Kamar:**\n1. Standard (3x3m): Rp 1.5-2.5 juta\n2. Premium (4x4m): Rp 2.5-3.5 juta\n3. VIP (4x4m + kitchenette): Rp 3.5-4.5 juta"
            ],
            'bus_schedule': [
                "🚌 **Shuttle Bus Kampus:**\n• Jam: 06.30-21.00 (Senin-Jumat)\n• Rute: 3 jalur (Merah, Biru, Hijau)\n• Frekuensi: 15-20 menit sekali\n• Gratis untuk mahasiswa aktif",
                "⏰ **Jadwal Operasional:**\n• Weekdays: 06.30 - 21.00\n• Sabtu: 07.00 - 18.00\n• Minggu: 08.00 - 16.00\n• Aplikasi: Campus Transport"
            ],
            'greeting': [
                "🤖 **Halo! Saya Chatbot Akademik**\n\nSaya bisa membantu dengan:\n• Informasi jurusan & fakultas\n• Beasiswa & pendanaan\n• Asrama mahasiswa\n• Jadwal shuttle bus\n\nApa yang ingin Anda tanyakan?",
                "👋 **Selamat datang!**\n\nTanyakan tentang:\n🎓 Jurusan & program studi\n💰 Beasiswa & biaya kuliah\n🏠 Asrama & tempat tinggal\n🚌 Transportasi kampus"
            ],
            'tidak_mengerti': [
                "Maaf, saya belum memahami. Bisa tolong diperjelas?",
                "Saya bisa membantu dengan informasi tentang: jurusan, beasiswa, asrama, shuttle bus, dll.",
                "Coba tanyakan hal spesifik seperti: 'beasiswa untuk mahasiswa baru' atau 'jadwal shuttle bus'"
            ]
        }
        
        response_list = responses.get(intent, responses['tidak_mengerti'])
        response = random.choice(response_list)
        
        return {
            'success': True,
            'intent': intent,
            'confidence': confidence,
            'response': response,
            'method': 'rule_based',
            'model_available': False,
            'intents_count': len(responses),
            'expecting_followup': False,
            'current_topic': None,
            'timestamp': datetime.now().isoformat()
        }
# python_server.py
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import re
import time

class SimpleChatbotHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'status': 'ok',
            'message': 'Python Chatbot API is running',
            'metadata': {
                'classes': 25,
                'features': 1250,
                'model_type': 'Python Simple Server',
                'training_date': '2024-01-15'
            }
        }
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        
        message = data.get('message', '').lower()
        
        # Simple response logic
        if 'halo' in message or 'hai' in message:
            intent = 'sapaan'
            response_text = 'Halo dari Python API! Ada yang bisa saya bantu?'
        elif 'jurusan' in message:
            intent = 'informasi_jurusan'
            response_text = 'Python API: Informasi jurusan tersedia di website kampus.'
        elif 'beasiswa' in message:
            intent = 'beasiswa'
            response_text = 'Python API: Info beasiswa bisa dicek di portal kemahasiswaan.'
        elif 'terima kasih' in message:
            intent = 'terima_kasih'
            response_text = 'Python API: Sama-sama!'
        else:
            intent = 'tidak_mengerti'
            response_text = 'Python API: Maaf, saya belum paham. Coba tanya hal lain.'
        
        result = {
            'success': True,
            'intent': intent,
            'confidence': 0.9,
            'response': response_text,
            'processing_time': f'0.1s',
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

def run_server():
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, SimpleChatbotHandler)
    print('🚀 Python Chatbot API running on http://localhost:8000')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
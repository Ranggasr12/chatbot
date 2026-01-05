from http.server import BaseHTTPRequestHandler
import json
import subprocess
import sys

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Retrain model endpoint"""
        try:
            # Run training script
            result = subprocess.run(
                [sys.executable, "scripts/train_model.py"],
                capture_output=True,
                text=True,
                cwd="./"  # Pastikan di root directory
            )
            
            if result.returncode == 0:
                response = {
                    "success": True,
                    "message": "Model trained successfully",
                    "output": result.stdout[:500]  # Batasi output
                }
                status = 200
            else:
                response = {
                    "success": False,
                    "message": "Training failed",
                    "error": result.stderr[:500]
                }
                status = 500
                
        except Exception as e:
            response = {
                "success": False,
                "message": "Server error",
                "error": str(e)
            }
            status = 500
        
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())
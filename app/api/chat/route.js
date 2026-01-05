// app/api/chat/route.js
import { promises as fs } from 'fs';
import path from 'path';

// Konfigurasi
const FLASK_API_URL = 'http://localhost:5000/api/chat';
const FLASK_TIMEOUT = 5000;
const USE_FALLBACK = true;

// Helper untuk timeout fetch
async function fetchWithTimeout(url, options, timeout = FLASK_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Load intents untuk fallback
async function loadIntents() {
  try {
    const intentsPath = path.join(process.cwd(), 'models', 'intents.json');
    const fileContent = await fs.readFile(intentsPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.log('⚠️ Cannot load intents:', error.message);
    return { intents: [] };
  }
}

// Simple keyword matching untuk fallback
function getKeywordResponse(userMessage) {
  const messageLower = userMessage.toLowerCase();
  
  const keywordMap = {
    'jurusan': {
      intent: 'informasi_jurusan',
      responses: [
        "Kami memiliki 12 fakultas dengan 50+ program studi: Teknik Informatika, Kedokteran, Manajemen, Hukum, Psikologi, Arsitektur, dan lainnya.",
        "Program studi tersedia di berbagai fakultas termasuk Teknik, Kedokteran, Ekonomi, Hukum, dan Psikologi."
      ]
    },
    'beasiswa': {
      intent: 'beasiswa',
      responses: [
        "Tersedia beasiswa: Prestasi (IPK min 3.5), KIP-Kuliah (untuk ekonomi kurang mampu), dan Beasiswa Perusahaan. Pendaftaran setiap semester.",
        "Beasiswa yang tersedia antara lain: Beasiswa Prestasi Akademik, Beasiswa KIP-Kuliah, dan Beasiswa dari mitra perusahaan."
      ]
    },
    'jadwal': {
      intent: 'jadwal_kuliah',
      responses: [
        "Jadwal kuliah dapat diakses melalui SIAKAD. Semester depan dimulai 2 September 2024.",
        "Jadwal perkuliahan tersedia di portal akademik. Untuk info lengkap, cek SIAKAD kampus."
      ]
    },
    'asrama': {
      intent: 'asrama_mahasiswa',
      responses: [
        "Asrama mahasiswa tersedia dengan berbagai tipe kamar. Biaya mulai dari Rp 1.5 juta per semester.",
        "Tersedia asrama dengan fasilitas lengkap. Pendaftaran dibuka 2 minggu sebelum semester dimulai."
      ]
    },
    'perpustakaan': {
      intent: 'facility_hours',
      responses: [
        "Perpustakaan buka Senin-Jumat 08.00-21.00, Sabtu 08.00-17.00, Minggu 09.00-15.00.",
        "Jam operasional perpustakaan: Senin-Jumat 08.00-21.00, Sabtu 08.00-17.00, Minggu 09.00-15.00."
      ]
    },
    'halo': {
      intent: 'greeting',
      responses: [
        "Halo! 🤖 Saya chatbot akademik. Silakan tanyakan tentang jurusan, beasiswa, jadwal kuliah, atau informasi kampus lainnya.",
        "Selamat datang! Saya siap membantu dengan informasi akademik dan fasilitas kampus."
      ]
    }
  };
  
  for (const [keyword, data] of Object.entries(keywordMap)) {
    if (messageLower.includes(keyword)) {
      return {
        intent: data.intent,
        response: data.responses[Math.floor(Math.random() * data.responses.length)],
        confidence: 0.7
      };
    }
  }
  
  return null;
}

// GET endpoint untuk info
export async function GET() {
  try {
    // Cek koneksi ke Flask
    let flaskStatus = 'unknown';
    let flaskInfo = null;
    
    try {
      const response = await fetchWithTimeout(
        'http://localhost:5000/api/health',
        { method: 'GET' },
        3000
      );
      
      if (response.ok) {
        flaskInfo = await response.json();
        flaskStatus = flaskInfo.success ? 'connected' : 'error';
      } else {
        flaskStatus = 'error';
      }
    } catch (error) {
      flaskStatus = 'disconnected';
    }
    
    // Load intents info
    const intentsData = await loadIntents();
    
    return Response.json({
      success: true,
      service: 'Next.js Chatbot Proxy',
      flask: {
        url: FLASK_API_URL,
        status: flaskStatus,
        info: flaskInfo
      },
      intents: {
        count: intentsData.intents?.length || 0,
        loaded: intentsData.intents?.length > 0
      },
      endpoints: {
        'POST /api/chat': 'Send message (proxies to Flask)',
        'GET /api/chat': 'This info endpoint'
      }
    });
    
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST endpoint untuk chat
export async function POST(request) {
  try {
    // Parse request
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return Response.json({
        success: false,
        error: 'Invalid JSON',
        response: 'Format pesan tidak valid.'
      }, { status: 400 });
    }
    
    const { message } = body;
    
    // Validasi
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return Response.json({
        success: false,
        error: 'Message required',
        response: 'Mohon ketik pesan Anda.'
      }, { status: 400 });
    }
    
    const userMessage = message.trim();
    console.log(`📤 Next.js received: "${userMessage}"`);
    
    // 1. Coba hubungi Flask API
    let flaskResponse = null;
    let flaskError = null;
    
    try {
      console.log(`🔄 Proxying to Flask: ${FLASK_API_URL}`);
      
      const response = await fetchWithTimeout(
        FLASK_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ message: userMessage })
        }
      );
      
      if (response.ok) {
        flaskResponse = await response.json();
        console.log(`✅ Flask response success:`, flaskResponse.success);
      } else {
        flaskError = `HTTP ${response.status}`;
      }
    } catch (error) {
      flaskError = error.name === 'AbortError' 
        ? 'Flask timeout' 
        : error.message;
      console.log(`❌ Flask error: ${flaskError}`);
    }
    
    // 2. Jika Flask merespons dengan sukses
    if (flaskResponse && flaskResponse.success) {
      return Response.json({
        ...flaskResponse,
        source: 'flask_api',
        proxied: true
      });
    }
    
    // 3. Fallback ke keyword matching
    if (USE_FALLBACK) {
      console.log(`🔄 Using Next.js keyword fallback`);
      
      // Coba keyword matching sederhana
      const keywordResponse = getKeywordResponse(userMessage);
      
      if (keywordResponse) {
        return Response.json({
          success: true,
          intent: keywordResponse.intent,
          confidence: keywordResponse.confidence,
          response: keywordResponse.response,
          source: 'nextjs_keyword_fallback',
          flask_error: flaskError
        });
      }
      
      // Default fallback response
      const defaultResponses = [
        "Halo! Saya chatbot akademik. Silakan tanyakan tentang jurusan, beasiswa, atau fasilitas kampus.",
        "Saya bisa membantu dengan informasi akademik. Coba tanyakan tentang jadwal kuliah atau asrama mahasiswa.",
        "Maaf, saya belum memahami pertanyaan Anda. Coba tanyakan tentang: jurusan, beasiswa, jadwal kuliah, atau fasilitas kampus."
      ];
      
      const randomDefault = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      
      return Response.json({
        success: true,
        intent: 'greeting',
        confidence: 0.3,
        response: randomDefault,
        source: 'nextjs_default_fallback',
        flask_error: flaskError
      });
    }
    
    // 4. Jika fallback tidak aktif, return error
    return Response.json({
      success: false,
      error: flaskError || 'Flask API tidak tersedia',
      response: 'Maaf, layanan chatbot sedang dalam pemeliharaan.',
      source: 'nextjs_error'
    }, { status: 503 });
    
  } catch (error) {
    console.error('❌ Next.js API error:', error);
    
    return Response.json({
      success: false,
      error: error.message,
      response: 'Terjadi kesalahan pada sistem.',
      source: 'error'
    }, { status: 500 });
  }
}

// OPTIONS untuk CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
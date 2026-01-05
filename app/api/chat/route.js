// app/api/chat/route.js - IMPROVED VERSION
export async function POST(request) {
  try {
    const { message } = await request.json();
    
    if (!message || message.trim() === '') {
      return Response.json({
        success: false,
        error: 'Message required',
        response: 'Mohon ketik pesan Anda.'
      }, { status: 400 });
    }
    
    const userMessage = message.toLowerCase().trim();
    console.log('Chat received:', userMessage);
    
    // SIMPLE RULE-BASED RESPONSES WITH CONVERSATION FLOW
    const responses = {
      'informasi_jurusan': [
        "🎓 **Fakultas & Jurusan:**\n• Teknik: Informatika, Sipil, Elektro, Mesin\n• Kedokteran: Dokter, Keperawatan, Farmasi\n• Ekonomi: Manajemen, Akuntansi, Bisnis Digital\n• Hukum: Ilmu Hukum, Hukum Internasional\n• Dan 8 fakultas lainnya dengan 50+ program studi!",
        "📚 **Program Studi Tersedia:**\n1. Teknik Informatika (S1)\n2. Kedokteran (S1)\n3. Manajemen (S1)\n4. Ilmu Hukum (S1)\n5. Psikologi (S1)\n6. Arsitektur (S1)\n7. Akuntansi (S1)\n8. Farmasi (S1)\n\nInfo lengkap: akademik.kampus.ac.id"
      ],
      
      'beasiswa': [
        "💰 **Jenis Beasiswa:**\n1. Prestasi (IPK ≥ 3.5) - Bebas UKT\n2. KIP-Kuliah - Untuk ekonomi kurang mampu\n3. Perusahaan (Telkom, Mandiri) - Tuition + magang\n4. Pemerintah Daerah - Beragam program\n\nPendaftaran: beasiswa.kampus.ac.id",
        "🏆 **Beasiswa Prestasi:**\n• Syarat: IPK min 3.5, aktif organisasi\n• Benefit: Bebas UKT + tunjangan bulanan\n• Periode: Setiap semester\n• Pendaftaran: Portal beasiswa kampus"
      ],
      
      'asrama_mahasiswa': [
        "🏠 **Asrama Mahasiswa:**\n• Biaya: Rp 1.5-4.5 juta/semester\n• Tipe: Standard, Premium, VIP\n• Fasilitas: AC, WiFi, kamar mandi dalam\n• Lokasi: Dalam kampus, 24/7 security\n• Pendaftaran: portal.kampus.ac.id/asrama",
        "🛏️ **Tipe Kamar:**\n1. Standard (3x3m): Rp 1.5-2.5 juta\n2. Premium (4x4m): Rp 2.5-3.5 juta\n3. VIP (4x4m + kitchenette): Rp 3.5-4.5 juta\n\nFasilitas: laundry, wifi, ruang belajar, kantin"
      ],
      
      'bus_schedule': [
        "🚌 **Shuttle Bus Kampus:**\n• Jam: 06.30-21.00 (Senin-Jumat)\n• Rute: 3 jalur (Merah, Biru, Hijau)\n• Frekuensi: 15-20 menit sekali\n• Gratis untuk mahasiswa aktif\n• Aplikasi: Campus Transport (live tracking)",
        "⏰ **Jadwal Operasional:**\n• Weekdays: 06.30 - 21.00\n• Sabtu: 07.00 - 18.00\n• Minggu: 08.00 - 16.00\n• Titik pemberhentian: 15 titik strategis"
      ],
      
      'greeting': [
        "🤖 **Halo! Saya Chatbot Akademik**\n\nSaya bisa membantu dengan:\n• Informasi jurusan & fakultas\n• Beasiswa & pendanaan\n• Asrama mahasiswa\n• Jadwal shuttle bus\n\nApa yang ingin Anda tanyakan?",
        "👋 **Selamat datang!**\n\nTanyakan tentang:\n🎓 Jurusan & program studi\n💰 Beasiswa & biaya kuliah\n🏠 Asrama & tempat tinggal\n🚌 Transportasi kampus\n\nSaya siap membantu!"
      ],
      
      'tidak_mengerti': [
        "Maaf, saya belum memahami. Bisa tolong diperjelas?",
        "Saya bisa membantu dengan informasi tentang: jurusan, beasiswa, asrama, shuttle bus, dll.",
        "Coba tanyakan hal spesifik seperti: 'beasiswa untuk mahasiswa baru' atau 'jadwal shuttle bus'"
      ]
    };
    
    // Check for conversation flow keywords
    let expecting_followup = false;
    let current_topic = null;
    
    // Conversation flow detection
    if (userMessage.includes('biaya') || userMessage.includes('harga')) {
      return Response.json({
        success: true,
        intent: 'asrama_mahasiswa',
        confidence: 0.95,
        response: "💰 **Detail Biaya Asrama (per semester):**\n\n1. **Standard Room** (3x3m)\n   • Biaya: Rp 1.5-2 juta\n   • Fasilitas: AC, WiFi area umum, shared bathroom\n\n2. **Premium Room** (4x4m)\n   • Biaya: Rp 2.5-3 juta\n   • Fasilitas: AC, WiFi pribadi, bathroom dalam, water heater\n\n3. **VIP Room** (4x4m + kitchenette)\n   • Biaya: Rp 3.5-4.5 juta\n   • Fasilitas: Semua fasilitas premium + cleaning service 2x/minggu\n\nIngin tahu tentang fasilitas lengkap atau cara pendaftaran?",
        method: 'conversation_flow',
        model_available: false,
        intents_count: Object.keys(responses).length,
        expecting_followup: true,
        current_topic: 'asrama_mahasiswa',
        timestamp: new Date().toISOString()
      });
    }
    
    if (userMessage.includes('fasilitas') || userMessage.includes('fasiliti')) {
      return Response.json({
        success: true,
        intent: 'asrama_mahasiswa',
        confidence: 0.95,
        response: "🛏️ **Fasilitas Lengkap Asrama:**\n\n✅ **Semua Kamar:**\n• AC\n• Kasur, bantal, guling\n• Meja belajar dan kursi\n• Lemari pakaian\n• Lampu belajar\n\n✅ **Fasilitas Umum:**\n• WiFi high-speed\n• Laundry service\n• Dapur bersama\n• Ruang belajar 24 jam\n• Kantin\n• Security 24/7\n• CCTV area umum\n\n✅ **Premium & VIP Tambahan:**\n• Bathroom dalam\n• Water heater\n• Cleaning service\n• Mini refrigerator (VIP)\n\nIngin tahu biaya atau cara pendaftaran?",
        method: 'conversation_flow',
        model_available: false,
        intents_count: Object.keys(responses).length,
        expecting_followup: true,
        current_topic: 'asrama_mahasiswa',
        timestamp: new Date().toISOString()
      });
    }
    
    // Simple intent detection
    let intent = 'tidak_mengerti';
    let confidence = 0.3;
    
    if (userMessage.includes('jurusan') || userMessage.includes('prodi') || userMessage.includes('fakultas')) {
      intent = 'informasi_jurusan';
      confidence = 0.9;
      expecting_followup = true;
      current_topic = 'informasi_jurusan';
    } else if (userMessage.includes('beasiswa') || userMessage.includes('dana') || userMessage.includes('biaya kuliah')) {
      intent = 'beasiswa';
      confidence = 0.9;
      expecting_followup = true;
      current_topic = 'beasiswa';
    } else if (userMessage.includes('asrama') || userMessage.includes('kost') || userMessage.includes('kamar')) {
      intent = 'asrama_mahasiswa';
      confidence = 0.9;
      expecting_followup = true;
      current_topic = 'asrama_mahasiswa';
    } else if (userMessage.includes('shuttle') || userMessage.includes('bus') || userMessage.includes('angkutan')) {
      intent = 'bus_schedule';
      confidence = 0.9;
      expecting_followup = true;
      current_topic = 'bus_schedule';
    } else if (userMessage.includes('halo') || userMessage.includes('hai') || userMessage.includes('hello')) {
      intent = 'greeting';
      confidence = 0.95;
    }
    
    // Check for exit keywords
    if (userMessage.includes('keluar') || userMessage.includes('selesai') || userMessage.includes('cukup')) {
      expecting_followup = false;
      current_topic = null;
    }
    
    const responseList = responses[intent];
    const response = responseList[Math.floor(Math.random() * responseList.length)];
    
    return Response.json({
      success: true,
      intent: intent,
      confidence: confidence,
      response: response,
      method: 'rule_based',
      model_available: false,
      intents_count: Object.keys(responses).length,
      expecting_followup: expecting_followup,
      current_topic: current_topic,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({
      success: false,
      error: error.message,
      response: 'Terjadi kesalahan pada sistem.'
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return Response.json({
    success: true,
    service: 'Chatbot Akademik API',
    status: 'healthy',
    model_loaded: false,
    intents_loaded: 6,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    features: ['rule-based', 'conversation-flow', 'multi-topic']
  });
}

// Handle OPTIONS for CORS
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
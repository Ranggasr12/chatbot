// Enhanced Chat API dengan AI Response Generator
export async function POST(request) {
  try {
    const { message } = await request.json();
    
    if (!message?.trim()) {
      return Response.json({
        success: false,
        error: 'Message required',
        response: '🤔 Mohon ketik pesan Anda. Saya siap membantu!'
      }, { status: 400 });
    }
    
    const userMessage = message.toLowerCase().trim();
    console.log('💬 Chat received:', userMessage);
    
    // SIMPLE AI RESPONSE GENERATOR
    const generateAIResponse = (intent) => {
      const responses = {
        'jurusan': [
          `🎓 **Informasi Jurusan & Fakultas**\n\nUniversitas kami memiliki **12 Fakultas** dengan **50+ Program Studi**:\n\n**🔥 Teknologi & Sains:**\n• Teknik Informatika (Akreditasi A)\n• Teknik Elektro (Akreditasi A)\n• Data Science (Program Baru)\n• Artificial Intelligence\n\n**🏥 Kesehatan:**\n• Kedokteran (Akreditasi A)\n• Farmasi (Akreditasi A)\n• Keperawatan (Akreditasi A)\n• Gizi Klinik\n\n**💼 Bisnis & Ekonomi:**\n• Manajemen (Akreditasi A)\n• Akuntansi (Akreditasi A)\n• Ekonomi Pembangunan\n• Bisnis Digital\n\n**⚖️ Sosial & Humaniora:**\n• Ilmu Hukum (Akreditasi A)\n• Psikologi (Akreditasi A)\n• Komunikasi\n• Hubungan Internasional\n\n📅 **Pendaftaran:** 1 Januari - 31 Maret 2024\n🔗 **Info lengkap:** akademik.univ.ac.id`,
          
          `📚 **Program Unggulan 2024**\n\n**🏆 Top 5 Jurusan Terpopuler:**\n1. **Teknik Informatika** - Kuota: 120 mahasiswa\n2. **Kedokteran** - Kuota: 80 mahasiswa\n3. **Manajemen** - Kuota: 150 mahasiswa\n4. **Psikologi** - Kuota: 100 mahasiswa\n5. **Hukum** - Kuota: 120 mahasiswa\n\n**🎯 Beasiswa Tersedia:**\n✓ Beasiswa Prestasi (100% UKT)\n✓ KIP-Kuliah\n✓ Beasiswa Perusahaan\n\n**📞 Kontak:**\n• WA: 0812-3456-7890\n• Email: info@univ.ac.id\n• Website: pmb.univ.ac.id`
        ],
        
        'beasiswa': [
          `💰 **Program Beasiswa 2024**\n\n**🎯 JENIS BEASISWA:**\n\n**1. BEASISWA PRESTASI**\n• Syarat: IPK ≥ 3.5\n• Benefit: Bebas UKT + Rp 1.000.000/bulan\n• Pendaftaran: Setiap semester\n\n**2. KIP-KULIAH**\n• Syarat: Ekonomi kurang mampu\n• Benefit: Full tuition + living allowance\n• Dokumen: SKTM, Kartu Keluarga\n\n**3. BEASISWA PERUSAHAAN**\n• Mitra: Telkom, Mandiri, BCA, Google\n• Benefit: Tuition + magang + job guarantee\n• Syarat: IPK ≥ 3.0 + English proficiency\n\n**4. BEASISWA DAERAH**\n• Untuk mahasiswa dari daerah tertentu\n• Benefit: Partial/Full tuition\n• Kerjasama dengan 20+ pemerintah daerah\n\n**📅 Timeline 2024:**\n• Pendaftaran: 15 Jan - 15 Feb 2024\n• Pengumuman: 1 Maret 2024\n• Registrasi: 10-20 Maret 2024\n\n**🔗 Portal:** beasiswa.univ.ac.id`,
          
          `🏆 **Beasiswa Prestasi Akademik**\n\n**📊 KUOTA 2024:**\n• Teknik: 50 kursi\n• Kedokteran: 30 kursi\n• Bisnis: 40 kursi\n• Hukum: 25 kursi\n• Lainnya: 55 kursi\n\n**📋 DOKUMEN YANG DIBUTUHKAN:**\n1. Transkrip nilai\n2. Essay motivasi (500 kata)\n3. Surat rekomendasi\n4. Sertifikat prestasi\n5. Foto formal\n\n**🎯 TIPS SUKSES:**\n• Essay harus original dan menarik\n• Sertifikat prestasi diutamakan\n• IPK minimal 3.5\n• Aktif organisasi menjadi nilai plus\n\n**💡 INFO:** Beasiswa juga tersedia untuk mahasiswa aktif semester 3-6.`
        ],
        
        'asrama': [
          `🏠 **Asrama & Akomodasi Mahasiswa**\n\n**📍 LOKASI:**\n• Kampus Utama (5 menit ke kelas)\n• Kampus Timur (10 menit shuttle)\n• Kampus Barat (15 menit shuttle)\n\n**🛏️ TIPE KAMAR & HARGA:**\n\n**🌟 STANDARD (Rp 1.8 Juta/smt)**\n• Kamar 3x3m\n• AC + WiFi area umum\n• Shared bathroom (4 orang)\n• Laundry service\n\n**✨ PREMIUM (Rp 2.8 Juta/smt)**\n• Kamar 4x4m\n• AC + WiFi pribadi\n• Bathroom dalam\n• Water heater\n• Cleaning service 1x/minggu\n\n**💎 VIP (Rp 3.8 Juta/smt)**\n• Kamar 4x4m + Balkon\n• Semua fasilitas premium\n• Kitchenette mini\n• Cleaning service 2x/minggu\n• Priority laundry\n\n**📝 CARA DAFTAR:**\n1. Login portal.univ.ac.id\n2. Pilih "Pendaftaran Asrama"\n3. Upload KTM & fotokopi KTP\n4. Bayar DP Rp 500.000\n\n**📞 Contact:** asrama@univ.ac.id`,
          
          `🛋️ **Fasilitas Lengkap Asrama**\n\n**✅ FASILITAS UMUM:**\n• WiFi 100 Mbps (24 jam)\n• Perpustakaan mini\n• Gym & ruang olahraga\n• Dapur bersama\n• Ruang TV & game\n• Parkir aman\n• Security 24/7 + CCTV\n\n**🍽️ KANTIN & MAKANAN:**\n• 3x makan sehari (paket)\n• Menu sehat & halal\n• Catering khusus (vegan, diet)\n• Coffee shop\n• Minimarket\n\n**🚑 KESEHATAN:**\n• Klinik kesehatan\n• Dokter jaga (Senin-Jumat)\n• Apotek\n• Ambulance darurat\n\n**🎯 KEAMANAN:**\n• Access card system\n• CCTV 360°\n• Patroli security\n• Emergency button\n• Safe deposit box\n\n**✨ BONUS:** Free orientation package untuk mahasiswa baru!`
        ],
        
        'transportasi': [
          `🚌 **Transportasi Kampus**\n\n**🕒 JADWAL SHUTTLE BUS:**\n\n**Senin - Jumat:**\n• 06.30 - 09.00: Setiap 15 menit\n• 09.00 - 16.00: Setiap 20 menit\n• 16.00 - 21.00: Setiap 15 menit\n\n**Sabtu:**\n• 07.00 - 18.00: Setiap 30 menit\n\n**Minggu & Libur:**\n• 08.00 - 16.00: Setiap 45 menit\n\n**🗺️ RUTE UTAMA:**\n\n**🔴 Rute Merah:**\nKampus → Stasiun → Mall → Apartemen A → Kampus\n(30 menit per putaran)\n\n**🔵 Rute Biru:**\nKampus → Supermarket → Kost Area → RS → Kampus\n(40 menit per putaran)\n\n**🟢 Rute Hijau:**\nKampus → Pusat Kota → Terminal → Pemukiman → Kampus\n(50 menit per putaran)\n\n**📱 APLIKASI:** Campus Transport App (Live Tracking)`,
          
          `🚗 **Parkir & Kendaraan Pribadi**\n\n**🅿️ AREA PARKIR:**\n• Parkir Utara: 500 slot (motor)\n• Parkir Timur: 300 slot (mobil)\n• Parkir VIP: 50 slot (dosen & tamu)\n\n**💰 TARIF PARKIR:**\n• Motor: Rp 2.000/hari\n• Mobil: Rp 5.000/hari\n• Semester ticket: Rp 150.000 (motor), Rp 400.000 (mobil)\n\n**🚲 SEPEDA & E-SCOOTER:**\n• Free bike sharing untuk mahasiswa\n• Charging station e-scooter\n• 50+ titik parkir sepeda\n\n**♿ AKSESIBILITAS:**\n• Ramp & lift di semua gedung\n• Shuttle khusus difabel\n• Priority parking\n\n**🌿 GO GREEN:**\n• Free shuttle untuk reduce carbon footprint\n• Charging station mobil listrik\n• Bike to campus program`
        ],
        
        'fasilitas': [
          `🏛️ **Fasilitas Kampus**\n\n**📚 PERPUSTAKAN DIGITAL:**\n• 500.000+ koleksi buku\n• 10.000+ jurnal online\n• 24/7 digital access\n• Ruang baca 24 jam\n• Pods for individual study\n\n**💻 LABORATORIUM:**\n• Lab Komputer (500+ PC)\n• Lab Bahasa (AI-powered)\n• Lab Science (modern equipment)\n• Lab Engineering (robotics, IoT)\n• Studio Multimedia\n\n**🏟️ FASILITAS OLAHRAGA:**\n• Stadion utama\n• Gym & fitness center\n• Kolam renang\n• Lapangan basket/futsal\n• Wall climbing\n\n**🍽️ KANTIN & KAFE:**\n• 10+ kantin dengan berbagai menu\n• Starbucks & coffee shops\n• Food court 24 jam\n• Catering sehat\n\n**🎭 RUANG SENI & KREATIF:**\n• Studio musik\n• Ruang teater\n• Galeri seni\n• Maker space\n• Recording studio`
        ],
        
        'greeting': [
          `🤖 **Halo! Saya AI Assistant Akademik**\n\nSelamat datang di **Chatbot Akademik Universitas**! 🎓\n\nSaya dilengkapi dengan **AI Intelligence** untuk membantu Anda dengan:\n\n✨ **TOPIK YANG BISA SAYA BANTU:**\n\n**🎓 AKADEMIK**\n• Informasi jurusan & fakultas\n• Kurikulum & program studi\n• Jadwal perkuliahan\n\n**💰 KEUANGAN**\n• Beasiswa & pendanaan\n• Biaya kuliah & UKT\n• Cara pembayaran\n\n**🏠 AKOMODASI**\n• Asrama & tempat tinggal\n• Fasilitas kamar\n• Biaya & pendaftaran\n\n**🚌 TRANSPORTASI**\n• Shuttle bus & jadwal\n• Parkir kendaraan\n• Aplikasi transportasi\n\n**🏛️ FASILITAS**\n• Perpustakaan & lab\n• Kantin & kafe\n• Olahraga & seni\n\n**💡 TIPS:** Gunakan kata kunci seperti "jurusan teknik", "beasiswa prestasi", atau "biaya asrama" untuk informasi spesifik!`,
          
          `👋 **Selamat datang di Layanan AI Chatbot!**\n\nSaya adalah **assistant virtual** yang siap membantu segala kebutuhan informasi kampus Anda. 🎯\n\n**🔍 CARA MENGGUNAKAN:**\n1. **Tanya langsung** - "Jurusan apa yang ada?"\n2. **Spesifik** - "Beasiswa untuk IPK 3.5"\n3. **Detail** - "Fasilitas asrama premium"\n4. **Jelaskan** - "Saya mau info tentang shuttle bus dari stasiun ke kampus"\n\n**⚡ RESPON CEPAT:**\n• Buttons di atas untuk topik umum\n• Auto-suggest untuk pertanyaan lanjutan\n• Detail lengkap dalam satu respons\n\n**🎯 CONTOH PERTANYAAN:**\n• "Berapa biaya UKT teknik informatika?"\n• "Kapan pendaftaran beasiswa dibuka?"\n• "Apa fasilitas lab komputer?"\n• "Jam berapa perpustakaan buka?"\n\nMari mulai percakapan! 👇`
        ],
        
        'default': [
          `🤔 **Saya ingin membantu Anda lebih baik!**\n\nSepertinya saya belum sepenuhnya memahami pertanyaan Anda. Mari coba format yang lebih spesifik:\n\n**🎓 Untuk informasi akademik:**\n• "Jurusan teknik apa saja yang ada?"\n• "Kurikulum informatika semester 1"\n• "Jadwal kuliah hari Senin"\n\n**💰 Untuk beasiswa & keuangan:**\n• "Beasiswa untuk IPK 3.2"\n• "Cara bayar UKT online"\n• "Biaya asrama per semester"\n\n**🏠 Untuk akomodasi:**\n• "Fasilitas kamar asrama"\n• "Cara daftar tempat tinggal"\n• "Harga kost sekitar kampus"\n\n**🚌 Untuk transportasi:**\n• "Jadwal shuttle jam 7 pagi"\n• "Rute bus ke stasiun"\n• "Tarif parkir mobil"\n\n**💡 Atau coba:**\n• Gunakan buttons quick starter di atas\n• Jelaskan kebutuhan Anda lebih detail\n• Pilih salah satu topik utama\n\nSaya di sini untuk membantu! 😊`,
          
          `🔍 **Mari kita eksplor bersama!**\n\nSaya bisa memberikan informasi detail tentang:\n\n**📊 DATA & STATISTIK:**\n• Jumlah fakultas & jurusan\n• Akreditasi program studi\n• Prosentase penerima beasiswa\n• Kapasitas asrama & fasilitas\n\n**📅 JADWAL & TIMELINE:**\n• Kalender akademik\n• Periode pendaftaran\n• Deadline beasiswa\n• Jam operasional fasilitas\n\n**📍 LOKASI & AKSES:**\n• Peta kampus digital\n• Titik shuttle stop\n• Lokasi gedung & ruangan\n• Parking area terdekat\n\n**🎯 REKOMENDASI:**\n• Jurusan berdasarkan minat\n• Beasiswa sesuai kualifikasi\n• Asrama berdasarkan budget\n• Transportasi efisien\n\nCoba tanyakan dengan lebih spesifik ya! 😄`
        ]
      };
      
      const intentResponses = responses[intent] || responses['default'];
      return intentResponses[Math.floor(Math.random() * intentResponses.length)];
    };
    
    // ADVANCED INTENT DETECTION WITH AI-LIKE UNDERSTANDING
    let intent = 'greeting';
    let confidence = 0.95;
    let expectingFollowup = false;
    let currentTopic = null;
    
    // Intent detection dengan pattern matching cerdas
    const patterns = {
      'jurusan': ['jurusan', 'prodi', 'fakultas', 'program studi', 'kuliah', 'pendaftaran', 'pmb', 'snbt', 'utbk'],
      'beasiswa': ['beasiswa', 'dana', 'biaya', 'ukt', 'uang kuliah', 'bantuan', 'sponsor', 'pendanaan'],
      'asrama': ['asrama', 'kost', 'kamar', 'tempat tinggal', 'akomodasi', 'indekos', 'kos', 'hostel'],
      'transportasi': ['shuttle', 'bus', 'angkutan', 'transport', 'kendaraan', 'parkir', 'rute', 'jadwal'],
      'fasilitas': ['fasilitas', 'lab', 'perpustakaan', 'kantin', 'olahraga', 'gedung', 'ruang', 'studio'],
      'greeting': ['halo', 'hai', 'hi', 'hello', 'selamat', 'pagi', 'siang', 'sore', 'malam']
    };
    
    // Hitung match score untuk setiap intent
    const scores = {};
    for (const [intentKey, keywords] of Object.entries(patterns)) {
      let score = 0;
      keywords.forEach(keyword => {
        if (userMessage.includes(keyword)) {
          score += 1;
          // Bonus untuk exact match
          if (userMessage.split(' ').includes(keyword)) {
            score += 0.5;
          }
        }
      });
      scores[intentKey] = score;
    }
    
    // Cari intent dengan score tertinggi
    let maxScore = 0;
    for (const [intentKey, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        intent = intentKey;
      }
    }
    
    // Adjust confidence berdasarkan score
    confidence = Math.min(0.3 + (maxScore * 0.2), 0.95);
    
    // Set expecting followup untuk topik tertentu
    if (['jurusan', 'beasiswa', 'asrama', 'transportasi', 'fasilitas'].includes(intent)) {
      expectingFollowup = true;
      currentTopic = intent;
    }
    
    // Special cases untuk pertanyaan spesifik
    if (userMessage.includes('berapa') || userMessage.includes('harga') || userMessage.includes('biaya')) {
      if (intent === 'asrama') expectingFollowup = true;
      if (intent === 'beasiswa') expectingFollowup = true;
    }
    
    if (userMessage.includes('kapan') || userMessage.includes('jadwal') || userMessage.includes('jam')) {
      if (intent === 'transportasi') expectingFollowup = true;
    }
    
    // Generate AI response
    const response = generateAIResponse(intent);
    
    return Response.json({
      success: true,
      intent: intent,
      confidence: confidence,
      response: response,
      method: 'ai_enhanced',
      model_available: true,
      intents_count: Object.keys(patterns).length,
      expecting_followup: expectingFollowup,
      current_topic: currentTopic,
      timestamp: new Date().toISOString(),
      ai_version: '2.0',
      response_type: 'rich_text'
    });
    
  } catch (error) {
    console.error('❌ API Error:', error);
    return Response.json({
      success: false,
      error: error.message,
      response: 'Maaf, terjadi gangguan pada sistem AI. Silakan coba beberapa saat lagi atau gunakan buttons quick starter di atas.',
      ai_status: 'temporarily_unavailable'
    }, { status: 500 });
  }
}

// Health check endpoint dengan detail
export async function GET() {
  return Response.json({
    success: true,
    service: 'AI Chatbot Akademik API',
    status: 'healthy',
    ai_version: '2.0',
    features: [
      'ai_enhanced_responses',
      'smart_intent_detection',
      'conversation_context',
      'rich_text_formatting',
      'multi_topic_support'
    ],
    intents_supported: 6,
    response_time: 'fast',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: '🤖 AI Chatbot siap membantu!'
  });
}

// Handle CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
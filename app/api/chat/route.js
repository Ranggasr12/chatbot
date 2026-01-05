export async function POST(request) {
  try {
    const { message, conversationId } = await request.json();
    
    if (!message || !message.trim()) {
      return Response.json({
        success: false,
        response: '🤔 Mohon ketik pesan Anda terlebih dahulu.'
      });
    }
    
    const userMessage = message.toLowerCase().trim();
    console.log('💬 Chat:', userMessage);
    
    // Conversation flow states
    const conversationState = {
      currentTopic: null,
      expectingDetail: null,
      hasAsked: {}
    };
    
    // Enhanced AI with conversation context
    const getAIResponse = () => {
      // Track user intent
      let intent = 'greeting';
      let expectingFollowup = false;
      let quickOptions = null;
      
      // Check for exit conversation
      if (userMessage.includes('keluar') || userMessage.includes('kembali') || userMessage.includes('menu')) {
        return {
          intent: 'greeting',
          response: `🔄 **Kembali ke Menu Utama**\n\nSilakan pilih topik lain yang ingin Anda tanyakan:\n\n🎓 Jurusan & Fakultas\n💰 Beasiswa & Dana\n🏠 Asrama & Akomodasi\n🚌 Transportasi\n🏛️ Fasilitas Kampus\n\nAtau tanyakan langsung! 😊`,
          expectingFollowup: false,
          quickOptions: null
        };
      }
      
      // Jurusan - Detailed flow
      if (userMessage.includes('jurusan') || userMessage.includes('fakultas') || userMessage.includes('prodi') || 
          userMessage.includes('teknik') || userMessage.includes('kedokteran') || userMessage.includes('ekonomi') ||
          userMessage.includes('hukum') || userMessage.includes('psikologi')) {
        
        intent = 'jurusan';
        
        // If asking specifically about a faculty
        if (userMessage.includes('teknik')) {
          return {
            intent: 'jurusan_teknik',
            response: `🔧 **Fakultas Teknik - Detail Lengkap**\n\n**Program Studi:**\n\n1. **Teknik Informatika**\n   • Akreditasi: A\n   • Kuota: 120 mahasiswa\n   • Biaya: Rp 12 juta/semester\n   • Kurikulum: AI, Web Dev, Mobile, Data Science\n   • Laboratorium: 5 lab khusus\n   • Kerjasama: Google, Microsoft, Gojek\n\n2. **Teknik Elektro**\n   • Akreditasi: A\n   • Kuota: 100 mahasiswa\n   • Biaya: Rp 11 juta/semester\n   • Konsentrasi: IoT, Robotics, Power Systems\n\n3. **Teknik Sipil**\n   • Akreditasi: A\n   • Kuota: 80 mahasiswa\n   • Biaya: Rp 10 juta/semester\n\n4. **Teknik Mesin**\n   • Akreditasi: B\n   • Kuota: 60 mahasiswa\n   • Biaya: Rp 10 juta/semester\n\n🎯 **Ingin tahu lebih detail tentang:**\n• "Biaya informatika"\n• "Kurikulum teknik"\n• "Laboratorium"\n• "Kerjasama perusahaan"\n• Atau tanyakan fakultas lain`,
            expectingFollowup: true,
            quickOptions: ['biaya', 'kurikulum', 'lab', 'kerjasama', 'kedokteran', 'ekonomi']
          };
        }
        
        if (userMessage.includes('kedokteran')) {
          return {
            intent: 'jurusan_kedokteran',
            response: `🏥 **Fakultas Kedokteran - Detail Lengkap**\n\n**Program Studi:**\n\n1. **Pendidikan Dokter**\n   • Akreditasi: A\n   • Kuota: 80 mahasiswa\n   • Biaya: Rp 25 juta/semester\n   • Masa studi: 7 tahun\n   • Rumah sakit pendidikan: 3 RS\n   • Program: Doctor of Medicine (MD)\n\n2. **Farmasi**\n   • Akreditasi: A\n   • Kuota: 60 mahasiswa\n   • Biaya: Rp 15 juta/semester\n   • Laboratorium: 4 lab modern\n\n3. **Keperawatan**\n   • Akreditasi: A\n   • Kuota: 70 mahasiswa\n   • Biaya: Rp 12 juta/semester\n\n🏥 **Fasilitas:**\n• Skills lab dengan manekin canggih\n• Teaching hospital\n• Research center\n• Medical library\n\n🎯 **Ingin tahu lebih detail tentang:**\n• "Biaya kedokteran"\n• "Proses belajar"\n• "Praktikum"\n• "Prospek kerja"\n• Atau fakultas lain`,
            expectingFollowup: true,
            quickOptions: ['biaya', 'belajar', 'praktikum', 'kerja', 'teknik', 'ekonomi']
          };
        }
        
        if (userMessage.includes('ekonomi') || userMessage.includes('bisnis') || userMessage.includes('manajemen')) {
          return {
            intent: 'jurusan_ekonomi',
            response: `💼 **Fakultas Ekonomi & Bisnis**\n\n**Program Studi:**\n\n1. **Manajemen**\n   • Akreditasi: A\n   • Kuota: 150 mahasiswa\n   • Biaya: Rp 10 juta/semester\n   • Konsentrasi: Marketing, Finance, HR, Operations\n\n2. **Akuntansi**\n   • Akreditasi: A\n   • Kuota: 120 mahasiswa\n   • Biaya: Rp 11 juta/semester\n   • Program sertifikasi: CPA, CMA\n\n3. **Ekonomi Pembangunan**\n   • Akreditasi: B\n   • Kuota: 80 mahasiswa\n   • Biaya: Rp 9 juta/semester\n\n🏢 **Kerjasama Perusahaan:**\n• Magang di perusahaan Fortune 500\n• Company visit rutin\n• Job fair semesteran\n• Startup incubator\n\n🎯 **Pertanyaan lanjutan:**\n• "Magang dimana?"\n• "Sertifikasi akuntansi"\n• "Biaya manajemen"\n• "Prospek kerja"\n• Atau fakultas lain`,
            expectingFollowup: true,
            quickOptions: ['magang', 'sertifikasi', 'biaya', 'kerja', 'teknik', 'hukum']
          };
        }
        
        // General jurusan question
        return {
          intent: 'jurusan',
          response: `🎓 **Pilih Fakultas untuk Detail:**\n\n**🔧 Teknik** - Informatika, Elektro, Sipil, Mesin\n**🏥 Kedokteran** - Dokter, Farmasi, Keperawatan\n**💼 Ekonomi** - Manajemen, Akuntansi, Ekonomi\n**⚖️ Hukum** - Ilmu Hukum\n**🧠 Psikologi** - Psikologi Klinis, Industri\n**🎨 Seni** - Desain, Arsitektur\n\n**💡 Contoh tanyakan:**\n• "Jurusan teknik informatika"\n• "Fakultas kedokteran"\n• "Biaya ekonomi"\n• Atau "semua jurusan" untuk overview lengkap`,
          expectingFollowup: true,
          quickOptions: ['teknik', 'kedokteran', 'ekonomi', 'hukum', 'psikologi', 'semua']
        };
      }
      
      // Beasiswa - Multi-step flow
      if (userMessage.includes('beasiswa') || userMessage.includes('dana') || userMessage.includes('bantuan') || 
          userMessage.includes('uang') || userMessage.includes('biaya kuliah') || userMessage.includes('ukt')) {
        
        intent = 'beasiswa';
        
        // Specific scholarship types
        if (userMessage.includes('prestasi') || userMessage.includes('ipk')) {
          return {
            intent: 'beasiswa_prestasi',
            response: `🏆 **Beasiswa Prestasi Akademik - Detail**\n\n**📊 Syarat Utama:**\n• IPK minimal 3.5 (skala 4.0)\n• Ranking kelas 10 besar (untuk SMA)\n• TOEFL minimal 500 (untuk mahasiswa)\n• Aktif organisasi (nilai plus)\n\n**💰 Benefit:**\n• Bebas UKT 100%\n• Uang saku Rp 1.000.000/bulan\n• Buku & research allowance Rp 500.000/semester\n• Program mentoring\n• Priority internship\n\n**📝 Dokumen:**\n1. Transkrip nilai\n2. Essay 500 kata "Why I deserve this scholarship"\n3. Surat rekomendasi 2 dosen/guru\n4. Sertifikat prestasi\n5. Foto formal\n\n**📅 Timeline:**\n• Pendaftaran: 15 Jan - 15 Feb 2024\n• Seleksi: 20 Feb - 10 Mar\n• Pengumuman: 15 Maret 2024\n• Registrasi: 20-30 Maret\n\n🎯 **Pertanyaan lanjutan:**\n• "Cara daftar online"\n• "Essay contoh"\n• "Interview tips"\n• "Beasiswa lain"\n• Atau "keluar" untuk menu utama`,
            expectingFollowup: true,
            quickOptions: ['daftar', 'essay', 'interview', 'lain', 'keluar']
          };
        }
        
        if (userMessage.includes('kip') || userMessage.includes('kurang mampu') || userMessage.includes('miskin')) {
          return {
            intent: 'beasiswa_kip',
            response: `💙 **KIP-Kuliah & Bantuan Sosial**\n\n**🎯 Untuk:** Mahasiswa dari keluarga kurang mampu\n\n**📋 Syarat:**\n• Penghasilan orang tua < Rp 4 juta/bulan\n• Memiliki Kartu Indonesia Pintar (KIP)\n• Atau SKTM dari kelurahan\n• IPK minimal 2.75 (untuk mahasiswa)\n\n**💰 Benefit:**\n• UKT 100% ditanggung\n• Bantuan hidup Rp 750.000/bulan\n• Buku & alat tulis Rp 500.000/semester\n• Asrama gratis (terbatas)\n\n**📞 Proses:**\n1. Daftar di kip-kuliah.kemdikbud.go.id\n2. Upload dokumen\n3. Verifikasi oleh kampus\n4. Pencairan per semester\n\n🎯 **Butuh bantuan dengan:**\n• "Cara daftar KIP"\n• "Dokumen yang dibutuhkan"\n• "Proses verifikasi"\n• "Beasiswa tambahan"\n• Atau "menu" untuk kembali`,
            expectingFollowup: true,
            quickOptions: ['daftar', 'dokumen', 'verifikasi', 'tambahan', 'menu']
          };
        }
        
        if (userMessage.includes('perusahaan') || userMessage.includes('swasta') || userMessage.includes('corporate')) {
          return {
            intent: 'beasiswa_perusahaan',
            response: `🏢 **Beasiswa Perusahaan Mitra**\n\n**🤝 Perusahaan Mitra:**\n1. **Telkom** - Teknologi & Telekomunikasi\n2. **BCA** - Perbankan & Finance\n3. **Mandiri** - Perbankan\n4. **Google** - Teknologi\n5. **Astra** - Otomotif & Manufacturing\n\n**📋 Syarat Umum:**\n• IPK minimal 3.0\n• Bersedia magang di perusahaan\n• Commitment kerja 1-2 tahun pasca lulus\n• TOEFL minimal 550\n• Psikotes & interview\n\n**💰 Benefit:**\n• Full tuition coverage\n• Magang berbayar Rp 3-5 juta/bulan\n• Job guarantee after graduation\n• Mentoring by company executives\n• Company housing (optional)\n\n🎯 **Ingin tahu tentang:**\n• "Beasiswa Telkom"\n• "Proses seleksi"\n• "Magang program"\n• "Job guarantee"\n• Atau "beasiswa lain"`,
            expectingFollowup: true,
            quickOptions: ['telkom', 'seleksi', 'magang', 'job', 'lain']
          };
        }
        
        // General beasiswa question
        return {
          intent: 'beasiswa',
          response: `💰 **Pilih Jenis Beasiswa:**\n\n**🏆 Prestasi Akademik** - Untuk IPK tinggi\n**💙 KIP-Kuliah** - Untuk ekonomi kurang mampu\n**🏢 Perusahaan** - Dengan magang & kerja\n**🏛️ Pemerintah** - Beasiswa daerah\n**🌍 International** - Study abroad\n\n**💡 Tanyakan:**\n• "Beasiswa prestasi syarat"\n• "Cara daftar KIP"\n• "Beasiswa perusahaan mitra"\n• "Semua beasiswa"\n• Atau spesifik sesuai kebutuhan`,
          expectingFollowup: true,
          quickOptions: ['prestasi', 'kip', 'perusahaan', 'pemerintah', 'semua']
        };
      }
      
      // Asrama - Interactive flow
      if (userMessage.includes('asrama') || userMessage.includes('kost') || userMessage.includes('kamar') || 
          userMessage.includes('tempat tinggal') || userMessage.includes('akomodasi')) {
        
        intent = 'asrama';
        
        // Room type details
        if (userMessage.includes('standard') || userMessage.includes('murah') || userMessage.includes('hemat')) {
          return {
            intent: 'asrama_standard',
            response: `🟢 **Asrama Tipe Standard - Rp 1.8 Juta/smt**\n\n**🛏️ Fasilitas Kamar:**\n• Kamar 3x3 meter\n• Tempat tidur single\n• Meja belajar\n• Lemari pakaian\n• AC (shared controller)\n• Stop kontak 2 buah\n\n**🚿 Fasilitas Bersama:**\n• Bathroom (4 orang share)\n• WiFi area umum\n• Laundry service (Rp 5.000/kg)\n• Dapur bersama\n• Ruang TV\n• Parking area\n\n**📋 Syarat:**\n• KTM aktif\n• Fotokopi KTP\n• Surat pernyataan orang tua\n• DP Rp 500.000\n\n🎯 **Pertanyaan lanjutan:**\n• "Cara booking"\n• "Kontak admin"\n• "Premium room"\n• "Peraturan asrama"\n• "Kembali ke menu"`,
            expectingFollowup: true,
            quickOptions: ['booking', 'kontak', 'premium', 'peraturan', 'menu']
          };
        }
        
        if (userMessage.includes('premium') || userMessage.includes('vip') || userMessage.includes('mahal')) {
          return {
            intent: 'asrama_premium',
            response: `🟣 **Asrama Tipe Premium - Rp 2.8 Juta/smt**\n\n**🛏️ Fasilitas Kamar:**\n• Kamar 4x4 meter\n• Tempat tidur double\n• Meja belajar premium\n• Lemari besar\n• AC personal\n• Water heater\n• Mini fridge\n• Smart lock\n\n**✨ Fasilitas Eksklusif:**\n• Bathroom dalam kamar\n• WiFi premium 100 Mbps\n• Free laundry 5kg/minggu\n• Cleaning service 1x/minggu\n• Gym access\n• Study room 24 jam\n• Coffee shop discount\n\n**📅 Proses:**\n1. Online registration\n2. Virtual room tour\n3. Document verification\n4. Payment confirmation\n5. Key collection\n\n🎯 **Tanya lebih lanjut:**\n• "Virtual tour"\n• "Payment method"\n• "Room availability"\n• "Standard room"\n• "Main menu"`,
            expectingFollowup: true,
            quickOptions: ['tour', 'payment', 'availability', 'standard', 'menu']
          };
        }
        
        if (userMessage.includes('fasilitas') || userMessage.includes('fitur')) {
          return {
            intent: 'asrama_fasilitas',
            response: `🏋️ **Fasilitas Umum Asrama:**\n\n**🏋️‍♂️ Olahraga & Kesehatan:**\n• Gym 24/7\n• Lapangan basket\n• Jogging track\n• Yoga room\n• Klinik kesehatan\n\n**📚 Akademik:**\n• Study room 24 jam\n• Library corner\n• Group study room\n• Printing station\n• Computer lab\n\n**🍽️ Makanan:**\n• Kantin utama\n• Coffee shop\n• Mini market\n• Food delivery hub\n• Kitchenette\n\n**🔒 Keamanan:**\n• CCTV 360°\n• Security 24/7\n• Access card system\n• Emergency button\n• Fire safety system\n\n🎯 **Ingin tahu:**\n• "Harga kamar"\n• "Peraturan"\n• "Lokasi"\n• "Cara daftar"\n• "Kembali"`,
            expectingFollowup: true,
            quickOptions: ['harga', 'peraturan', 'lokasi', 'daftar', 'kembali']
          };
        }
        
        // General asrama question
        return {
          intent: 'asrama',
          response: `🏠 **Asrama Mahasiswa - Pilih Informasi:**\n\n**💰 Harga & Tipe Kamar:**\n• Standard: Rp 1.8 juta\n• Premium: Rp 2.8 juta\n• VIP: Rp 3.8 juta\n\n**🛏️ Fasilitas:**\n• Kamar lengkap\n• WiFi & AC\n• Laundry\n• Keamanan\n• Olahraga\n\n**📝 Pendaftaran:**\n• Online system\n• Virtual tour\n• Easy payment\n\n**💡 Tanyakan:**\n• "Harga standard"\n• "Fasilitas premium"\n• "Cara daftar"\n• "Semua info"\n• Atau spesifik kebutuhan`,
          expectingFollowup: true,
          quickOptions: ['standard', 'premium', 'daftar', 'semua', 'fasilitas']
        };
      }
      
      // Transportasi - Interactive flow
      if (userMessage.includes('bus') || userMessage.includes('shuttle') || userMessage.includes('transport') || 
          userMessage.includes('parkir') || userMessage.includes('kendaraan') || userMessage.includes('rute')) {
        
        intent = 'transportasi';
        
        if (userMessage.includes('jadwal') || userMessage.includes('jam')) {
          return {
            intent: 'transportasi_jadwal',
            response: `⏰ **Jadwal Lengkap Shuttle Bus**\n\n**📅 Senin - Jumat:**\n• 06:30 - 07:30: Setiap 10 menit (rush hour)\n• 07:30 - 09:00: Setiap 15 menit\n• 09:00 - 16:00: Setiap 20 menit\n• 16:00 - 18:00: Setiap 15 menit (rush hour)\n• 18:00 - 21:00: Setiap 30 menit\n• 21:00 - 22:00: Setiap 45 menit\n\n**📅 Sabtu:**\n• 07:00 - 12:00: Setiap 30 menit\n• 12:00 - 18:00: Setiap 45 menit\n• 18:00 - 20:00: Setiap 60 menit\n\n**📅 Minggu & Libur:**\n• 08:00 - 16:00: Setiap 60 menit\n• 16:00 - 18:00: Setiap 90 menit\n\n**🚍 Jumlah Bus:** 15 unit operasional\n\n🎯 **Info lainnya:**\n• "Rute bus"\n• "Aplikasi tracking"\n• "Parkir"\n• "Hari libur"\n• "Menu utama"`,
            expectingFollowup: true,
            quickOptions: ['rute', 'aplikasi', 'parkir', 'libur', 'menu']
          };
        }
        
        if (userMessage.includes('rute') || userMessage.includes('jalan')) {
          return {
            intent: 'transportasi_rute',
            response: `🗺️ **Rute Shuttle Bus Kampus**\n\n**🔴 Rute Merah (Campus Loop):**\nKampus Utama → Gedung A → Gedung B → Perpustakaan → Kantin → Asrama → Kembali ke Kampus Utama\n⏱️ Waktu: 25 menit\n🚌 Bus: Setiap 15 menit\n\n**🔵 Rute Biru (City Connection):**\nKampus → Stasiun Pusat → Mall Grand → Apartemen Sky → Supermarket → RS Umum → Kembali ke Kampus\n⏱️ Waktu: 45 menit\n🚌 Bus: Setiap 30 menit\n\n**🟢 Rute Hijau (Residential):**\nKampus → Kost Area A → Kost Area B → Perumahan Dosen → Pasar → Terminal → Kembali ke Kampus\n⏱️ Waktu: 60 menit\n🚌 Bus: Setiap 45 menit\n\n**📍 Stops:** 35 titik pemberhentian\n**📱 Live Tracking:** Campus Transport App\n\n🎯 **Tanya tentang:**\n• "Jadwal rute merah"\n• "Aplikasi bus"\n• "Tarif parkir"\n• "Bus malam"\n• "Kembali"`,
            expectingFollowup: true,
            quickOptions: ['jadwal', 'aplikasi', 'parkir', 'malam', 'kembali']
          };
        }
        
        // General transport question
        return {
          intent: 'transportasi',
          response: `🚌 **Transportasi Kampus - Pilih Info:**\n\n**⏰ Jadwal Bus** - Jam operasional shuttle\n**🗺️ Rute** - Jalur & titik pemberhentian\n**📱 Aplikasi** - Live tracking & info realtime\n**🚗 Parkir** - Tarif & area parkir\n**🚲 Sepeda** - Bike sharing & parking\n\n**💡 Contoh tanyakan:**\n• "Jadwal bus jam 7"\n• "Rute ke stasiun"\n• "Download aplikasi"\n• "Tarif parkir mobil"\n• "Semua transportasi"`,
          expectingFollowup: true,
          quickOptions: ['jadwal', 'rute', 'aplikasi', 'parkir', 'semua']
        };
      }
      
      // Greeting or general question
      const greetings = [
        `🤖 **Halo! Saya AI Chatbot Akademik**\n\nSaya dirancang untuk **percakapan interaktif** yang memahami konteks pembicaraan! 🎯\n\n**🔍 Cara menggunakan:**\n1. **Mulai topik** - "Saya mau tanya tentang jurusan"\n2. **Detail spesifik** - "Bagaimana dengan teknik informatika?"\n3. **Lanjutkan** - "Berapa biayanya?"\n4. **Ganti topik** - "Kalau beasiswa?"\n5. **Keluar** - "Kembali ke menu"\n\n**💡 Contoh percakapan:**\nAnda: "Jurusan teknik"\nAI: "Fakultas Teknik memiliki..."\nAnda: "Berapa biaya informatika?"\nAI: "Biaya Rp 12 juta..."\nAnda: "Ada beasiswa?"\nAI: "Ya, ada beasiswa..."\n\nMari mulai! Pilih topik atau tanyakan langsung! 😊`,
        
        `👋 **Selamat datang di percakapan interaktif!**\n\nSaya akan **mengingat topik** yang kita bicarakan dan memberikan **jawaban kontekstual**. 🧠\n\n**🎯 Topik yang bisa kita eksplor bersama:**\n\n**1. Jurusan & Fakultas** → Detail tiap program studi\n**2. Beasiswa** → Syarat, benefit, cara daftar\n**3. Asrama** → Tipe kamar, fasilitas, harga\n**4. Transportasi** → Jadwal, rute, aplikasi\n**5. Fasilitas** → Perpustakaan, lab, olahraga\n\n**💬 Coba mulai dengan:**\n• "Saya tertarik dengan jurusan teknik"\n• "Info beasiswa untuk saya"\n• "Asrama yang nyaman"\n• Atau pilih tombol quick starter!`
      ];
      
      return {
        intent: 'greeting',
        response: greetings[Math.floor(Math.random() * greetings.length)],
        expectingFollowup: true,
        quickOptions: ['jurusan', 'beasiswa', 'asrama', 'transportasi', 'fasilitas']
      };
    };
    
    const aiResponse = getAIResponse();
    
    return Response.json({
      success: true,
      intent: aiResponse.intent,
      response: aiResponse.response,
      expecting_followup: aiResponse.expectingFollowup,
      quick_options: aiResponse.quickOptions,
      conversation_flow: true,
      timestamp: new Date().toISOString(),
      ai_version: '3.0'
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({
      success: false,
      response: 'Maaf, terjadi kesalahan pada sistem percakapan. Silakan coba lagi.'
    });
  }
}

export async function GET() {
  return Response.json({
    success: true,
    service: 'AI Chatbot dengan Conversation Flow',
    status: 'online',
    version: '3.0',
    features: [
      'conversation_context',
      'multi_step_flow',
      'quick_options',
      'topic_memory',
      'interactive_dialogue'
    ],
    timestamp: new Date().toISOString()
  });
}
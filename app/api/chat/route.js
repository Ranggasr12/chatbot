export async function POST(request) {
  try {
    const { message } = await request.json();
    
    if (!message || !message.trim()) {
      return Response.json({
        success: false,
        response: '🤔 Mohon ketik pesan Anda.'
      }, { status: 400 });
    }
    
    const userMessage = message.toLowerCase().trim();
    
    // Simple AI response logic
    const getAIResponse = () => {
      if (userMessage.includes('jurusan') || userMessage.includes('fakultas')) {
        return {
          intent: 'jurusan',
          response: `🎓 **Informasi Jurusan:**\n\n• Teknik Informatika (Akreditasi A)\n• Kedokteran (Akreditasi A)\n• Manajemen (Akreditasi A)\n• Hukum (Akreditasi A)\n• Psikologi (Akreditasi A)\n\n📅 Pendaftaran: Januari-Maret 2024`
        };
      }
      
      if (userMessage.includes('beasiswa') || userMessage.includes('dana')) {
        return {
          intent: 'beasiswa',
          response: `💰 **Program Beasiswa:**\n\n• Beasiswa Prestasi (IPK ≥ 3.5)\n• KIP-Kuliah (ekonomi kurang mampu)\n• Beasiswa Perusahaan (Telkom, BCA, dll.)\n\n📝 Pendaftaran: 15 Jan - 15 Feb 2024`
        };
      }
      
      if (userMessage.includes('asrama') || userMessage.includes('kost')) {
        return {
          intent: 'asrama',
          response: `🏠 **Asrama Mahasiswa:**\n\n• Standard: Rp 1.8 juta/semester\n• Premium: Rp 2.8 juta/semester\n• VIP: Rp 3.8 juta/semester\n\n📍 Lokasi: 5 menit dari kampus`
        };
      }
      
      if (userMessage.includes('bus') || userMessage.includes('shuttle')) {
        return {
          intent: 'transportasi',
          response: `🚌 **Shuttle Bus Kampus:**\n\n⏰ Jadwal: 06.30-21.00\n🚌 Setiap 15-30 menit\n🗺️ Rute: Kampus ↔ Stasiun ↔ Mall`
        };
      }
      
      if (userMessage.includes('halo') || userMessage.includes('hi')) {
        return {
          intent: 'greeting',
          response: `🤖 **Halo! Selamat datang di AI Chatbot**\n\nSaya siap membantu dengan:\n\n🎓 Jurusan & Fakultas\n💰 Beasiswa & Biaya\n🏠 Asrama & Tempat Tinggal\n🚌 Transportasi Kampus\n📚 Fasilitas Kampus\n\nApa yang ingin Anda tanyakan? 😊`
        };
      }
      
      return {
        intent: 'general',
        response: `🤔 **Saya ingin membantu Anda!**\n\nCoba tanyakan tentang:\n\n• "Jurusan apa saja?"\n• "Info beasiswa"\n• "Biaya asrama"\n• "Jadwal shuttle"\n• Atau pilih topik dari buttons! 💡`
      };
    };
    
    const aiResponse = getAIResponse();
    
    return Response.json({
      success: true,
      intent: aiResponse.intent,
      response: aiResponse.response,
      timestamp: new Date().toISOString(),
      ai_version: '1.0'
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({
      success: false,
      response: 'Maaf, terjadi kesalahan. Silakan coba lagi.'
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return Response.json({
    success: true,
    service: 'AI Chatbot API',
    status: 'online',
    version: '1.0',
    timestamp: new Date().toISOString()
  });
}
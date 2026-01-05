export async function POST(request) {
  try {
    const { message } = await request.json();
    
    if (!message?.trim()) {
      return Response.json({
        success: false,
        error: 'Pesan kosong'
      }, { status: 400 });
    }
    
    const msg = message.toLowerCase();
    let response = '';
    let intent = 'unknown';
    
    // Simple response logic
    if (msg.includes('jurusan') || msg.includes('fakultas')) {
      response = "🎓 **Jurusan yang tersedia:**\n• Teknik Informatika\n• Kedokteran\n• Manajemen\n• Hukum\n• Psikologi\n• Arsitektur\n\nInfo lengkap: kampus.ac.id/jurusan";
      intent = 'jurusan';
    } 
    else if (msg.includes('beasiswa')) {
      response = "💰 **Beasiswa:**\n1. Prestasi (IPK ≥ 3.5)\n2. KIP-Kuliah\n3. Beasiswa Perusahaan\n4. Beasiswa Daerah\n\nDaftar: kampus.ac.id/beasiswa";
      intent = 'beasiswa';
    }
    else if (msg.includes('asrama') || msg.includes('kost')) {
      response = "🏠 **Asrama Mahasiswa:**\n• Biaya: Rp 1.5-4 juta/semester\n• Fasilitas: AC, WiFi, laundry\n• Pendaftaran: portal.kampus.ac.id";
      intent = 'asrama';
    }
    else if (msg.includes('shuttle') || msg.includes('bus')) {
      response = "🚌 **Shuttle Bus:**\n• Jam: 06.30-21.00\n• Rute: 3 jalur\n• Frekuensi: 15-20 menit\n• Gratis untuk mahasiswa";
      intent = 'bus';
    }
    else if (msg.includes('halo') || msg.includes('hai')) {
      response = "👋 Halo! Saya chatbot informasi kampus. Tanyakan tentang jurusan, beasiswa, asrama, atau shuttle bus.";
      intent = 'greeting';
    }
    else {
      response = "Saya bisa membantu dengan informasi tentang:\n• Jurusan & program studi\n• Beasiswa & biaya\n• Asrama mahasiswa\n• Shuttle bus kampus\n\nCoba tanyakan salah satu topik di atas!";
      intent = 'help';
    }
    
    return Response.json({
      success: true,
      response: response,
      intent: intent,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Optional: Health check
export async function GET() {
  return Response.json({
    status: 'healthy',
    service: 'Chatbot API',
    timestamp: new Date().toISOString()
  });
}
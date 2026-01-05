'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '🤖 **Selamat Datang di Chatbot Interaktif!**\n\nSaya siap membantu Anda dengan informasi kampus.',
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Quick starters
  const quickStarters = [
    { icon: '🎓', text: 'Jurusan', value: 'Jurusan apa saja yang ada?' },
    { icon: '💰', text: 'Beasiswa', value: 'Info beasiswa untuk mahasiswa baru' },
    { icon: '🏠', text: 'Asrama', value: 'Info asrama dan biayanya' },
    { icon: '🚌', text: 'Transportasi', value: 'Jadwal shuttle bus kampus' },
    { icon: '📚', text: 'Fasilitas', value: 'Fasilitas kampus apa saja?' },
    { icon: '💬', text: 'Bantuan', value: 'Halo, bisa bantu saya?' }
  ]

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Simple AI response generator
  const getAIResponse = (message) => {
    const msg = message.toLowerCase().trim()
    
    if (msg.includes('jurusan') || msg.includes('fakultas') || msg.includes('prodi')) {
      return `🎓 **Informasi Jurusan:**\n\nFakultas Teknik:\n• Teknik Informatika (Akreditasi A)\n• Teknik Elektro (Akreditasi A)\n• Teknik Sipil (Akreditasi A)\n\nFakultas Kedokteran:\n• Pendidikan Dokter (Akreditasi A)\n• Farmasi (Akreditasi A)\n\nFakultas Ekonomi:\n• Manajemen (Akreditasi A)\n• Akuntansi (Akreditasi A)`
    }
    
    if (msg.includes('beasiswa') || msg.includes('dana') || msg.includes('biaya')) {
      return `💰 **Program Beasiswa:**\n\n1. Beasiswa Prestasi (IPK ≥ 3.5)\n• Bebas UKT 100%\n• Rp 1.000.000/bulan\n\n2. KIP-Kuliah\n• Untuk mahasiswa kurang mampu\n• Full tuition + living allowance\n\n3. Beasiswa Perusahaan\n• Telkom, BCA, Mandiri, Google\n• UKT + magang berbayar`
    }
    
    if (msg.includes('asrama') || msg.includes('kost') || msg.includes('kamar')) {
      return `🏠 **Asrama Mahasiswa:**\n\n• Standard: Rp 1.8 juta/semester\n• Premium: Rp 2.8 juta/semester\n• VIP: Rp 3.8 juta/semester\n\nFasilitas: AC, WiFi, laundry, cleaning service`
    }
    
    if (msg.includes('bus') || msg.includes('shuttle') || msg.includes('transportasi')) {
      return `🚌 **Shuttle Bus Kampus:**\n\nJadwal (Senin-Jumat):\n• 06:30 - 09:00: Setiap 15 menit\n• 09:00 - 16:00: Setiap 20 menit\n• 16:00 - 21:00: Setiap 15 menit\n\nRute: Kampus ↔ Stasiun ↔ Mall ↔ Apartemen`
    }
    
    if (msg.includes('fasilitas') || msg.includes('lab') || msg.includes('perpustakaan')) {
      return `🏛️ **Fasilitas Kampus:**\n\n• Perpustakaan Digital 24/7\n• Lab Komputer & Bahasa\n• Gym & Fitness Center\n• Kantin & Coffee Shop\n• Studio Multimedia\n• Klinik Kesehatan`
    }
    
    if (msg.includes('halo') || msg.includes('hi') || msg.includes('hai') || msg.includes('hello')) {
      return `🤖 **Halo! Selamat datang!**\n\nSaya AI Chatbot siap membantu dengan:\n\n🎓 Informasi jurusan\n💰 Beasiswa & biaya\n🏠 Asrama & akomodasi\n🚌 Transportasi kampus\n📚 Fasilitas kampus\n\nApa yang ingin Anda tanyakan? 😊`
    }
    
    return `🤔 **Saya ingin membantu Anda lebih baik!**\n\nCoba tanyakan tentang:\n\n• "Jurusan teknik apa saja?"\n• "Info beasiswa untuk IPK 3.5"\n• "Biaya asrama per semester"\n• "Jadwal shuttle jam 7 pagi"\n• "Fasilitas perpustakaan"\n\nAtau pilih topik dari tombol di atas! 💡`
  }

  // Send message function
  const sendMessage = () => {
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsLoading(true)

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = getAIResponse(userInput)
      
      const botMessage = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, botMessage])
      setIsLoading(false)
    }, 800)
  }

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Clear chat
  const clearChat = () => {
    if (window.confirm('Hapus semua percakapan?')) {
      setMessages([
        {
          id: 1,
          text: '🔄 **Percakapan telah direset!**\n\nSilakan tanyakan apa yang Anda butuhkan.',
          sender: 'bot',
          timestamp: new Date().toISOString()
        }
      ])
    }
  }

  // Handle quick starter click
  const handleQuickStarter = (value) => {
    setInput(value)
    setTimeout(() => {
      sendMessage()
    }, 100)
  }

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Icons as SVG components
  const UserIcon = () => (
    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )

  const BotIcon = () => (
    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                <div className="text-2xl text-white">🤖</div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">AI Chatbot Interaktif</h1>
                <p className="text-gray-600">Percakapan Cerdas • Respons Real-time</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-700">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Online</span>
              </div>
              
              <button
                onClick={clearChat}
                className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition"
                title="Clear chat"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Quick Starters */}
          <div>
            <p className="text-sm text-gray-500 mb-3 font-medium">🚀 Mulai percakapan cepat:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {quickStarters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickStarter(starter.value)}
                  disabled={isLoading}
                  className="flex flex-col items-center p-3 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50 text-center"
                >
                  <div className="text-2xl mb-1">{starter.icon}</div>
                  <div className="text-sm font-medium text-gray-700">{starter.text}</div>
                  <div className="text-xs text-gray-500 mt-1">Click to send</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-4 md:p-6 bg-gray-50">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  }`}>
                    
                    {/* Message Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-full ${msg.sender === 'user' ? 'bg-blue-400' : 'bg-blue-100'}`}>
                        {msg.sender === 'user' ? <UserIcon /> : <BotIcon />}
                      </div>
                      <div className="text-xs opacity-75">
                        {msg.sender === 'user' ? 'Anda' : 'AI Assistant'} • {formatTime(msg.timestamp)}
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    <div className="whitespace-pre-line leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                      </div>
                      <span className="text-sm text-gray-600">AI sedang memproses...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ketik pertanyaan Anda di sini..."
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                  rows="2"
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500">
                    Tekan Enter untuk mengirim, Shift+Enter untuk baris baru
                  </div>
                  <div className={`text-xs ${input.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                    {input.length}/500
                  </div>
                </div>
              </div>
              
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="self-end bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                <span className="hidden md:inline">Kirim</span>
              </button>
            </div>
            
            {/* Tips */}
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>💡 Contoh: "jurusan teknik", "beasiswa IPK 3.5", "biaya asrama", "jadwal shuttle jam 7"</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2024 AI Chatbot Interaktif • v1.0</p>
        </div>
      </div>
    </div>
  )
}
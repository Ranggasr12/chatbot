'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '🤖 **Halo! Saya AI Chatbot Interaktif**\n\nSiap membantu informasi kampus dengan percakapan alami! 🎯\n\nPilih topik di bawah atau tanyakan langsung!',
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentTopic, setCurrentTopic] = useState(null)
  const messagesEndRef = useRef(null)

  // Quick starters
  const quickStarters = [
    { icon: '🎓', text: 'Jurusan', value: 'Saya mau tanya tentang jurusan' },
    { icon: '💰', text: 'Beasiswa', value: 'Info beasiswa untuk mahasiswa' },
    { icon: '🏠', text: 'Asrama', value: 'Asrama dan tempat tinggal' },
    { icon: '🚌', text: 'Transportasi', value: 'Transportasi kampus' },
    { icon: '📚', text: 'Fasilitas', value: 'Fasilitas kampus apa saja?' },
    { icon: '🔄', text: 'Reset', value: 'Kembali ke menu utama' }
  ]

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Client-side AI response
  const getAIResponse = (message, currentTopic) => {
    const msg = message.toLowerCase().trim()
    
    // Handle exit conversation
    if (msg.includes('keluar') || msg.includes('kembali') || msg.includes('menu') || msg.includes('reset')) {
      setCurrentTopic(null)
      return {
        intent: 'greeting',
        response: '🔄 **Kembali ke Menu Utama**\n\nSilakan pilih topik yang ingin Anda tanyakan! 😊',
        quickOptions: ['jurusan', 'beasiswa', 'asrama', 'transportasi', 'fasilitas']
      }
    }
    
    // Jurusan flow
    if (msg.includes('jurusan') || msg.includes('fakultas') || currentTopic === 'jurusan') {
      if (msg.includes('teknik')) {
        return {
          intent: 'jurusan_teknik',
          response: `🔧 **Fakultas Teknik**\n\n• Teknik Informatika (A)\n• Teknik Elektro (A)\n• Teknik Sipil (A)\n• Teknik Mesin (B)\n\n💡 Tanya: "biaya", "kurikulum", atau "fakultas lain"`,
          quickOptions: ['biaya', 'kurikulum', 'kedokteran', 'ekonomi', 'menu']
        }
      }
      return {
        intent: 'jurusan',
        response: `🎓 **Pilih Fakultas:**\n\n🔧 Teknik\n🏥 Kedokteran\n💼 Ekonomi\n⚖️ Hukum\n🧠 Psikologi\n\nTanyakan: "jurusan teknik", "fakultas kedokteran", dll.`,
        quickOptions: ['teknik', 'kedokteran', 'ekonomi', 'hukum', 'semua']
      }
    }
    
    // Beasiswa flow
    if (msg.includes('beasiswa') || msg.includes('dana') || currentTopic === 'beasiswa') {
      if (msg.includes('prestasi') || msg.includes('ipk')) {
        return {
          intent: 'beasiswa_prestasi',
          response: `🏆 **Beasiswa Prestasi**\n\n• IPK ≥ 3.5\n• Bebas UKT 100%\n• Rp 1 juta/bulan\n• Pendaftaran: Jan-Feb\n\n💡 Tanya: "dokumen", "cara daftar", "beasiswa lain"`,
          quickOptions: ['dokumen', 'daftar', 'kip', 'perusahaan', 'menu']
        }
      }
      return {
        intent: 'beasiswa',
        response: `💰 **Jenis Beasiswa:**\n\n🏆 Prestasi Akademik\n💙 KIP-Kuliah\n🏢 Perusahaan\n🏛️ Pemerintah\n\nTanyakan: "beasiswa prestasi", "KIP", dll.`,
        quickOptions: ['prestasi', 'kip', 'perusahaan', 'pemerintah', 'semua']
      }
    }
    
    // Asrama flow
    if (msg.includes('asrama') || msg.includes('kost') || currentTopic === 'asrama') {
      return {
        intent: 'asrama',
        response: `🏠 **Asrama Mahasiswa**\n\n• Standard: Rp 1.8 juta/smt\n• Premium: Rp 2.8 juta/smt\n• VIP: Rp 3.8 juta/smt\n\nFasilitas: AC, WiFi, laundry\n\n💡 Tanya: "standard", "premium", "fasilitas", "daftar"`,
        quickOptions: ['standard', 'premium', 'fasilitas', 'daftar', 'menu']
      }
    }
    
    // Transportasi flow
    if (msg.includes('bus') || msg.includes('shuttle') || currentTopic === 'transportasi') {
      return {
        intent: 'transportasi',
        response: `🚌 **Transportasi Kampus**\n\n⏰ Jadwal: 06.30-21.00\n🚌 Bus: setiap 15-30 menit\n🗺️ Rute: Kampus ↔ Stasiun ↔ Mall\n📱 App: Campus Transport\n\n💡 Tanya: "jadwal", "rute", "aplikasi", "parkir"`,
        quickOptions: ['jadwal', 'rute', 'aplikasi', 'parkir', 'menu']
      }
    }
    
    // Fasilitas
    if (msg.includes('fasilitas') || msg.includes('lab') || msg.includes('perpustakaan')) {
      return {
        intent: 'fasilitas',
        response: `🏛️ **Fasilitas Kampus**\n\n📚 Perpustakaan 24/7\n💻 Lab Komputer\n🏋️‍♂️ Gym & Olahraga\n🍽️ Kantin & Kafe\n🏥 Klinik Kesehatan\n\nTersedia untuk semua mahasiswa!`,
        quickOptions: ['perpustakaan', 'lab', 'olahraga', 'kantin', 'menu']
      }
    }
    
    // Greeting
    if (msg.includes('halo') || msg.includes('hi') || msg.includes('hai')) {
      return {
        intent: 'greeting',
        response: `🤖 **Halo! Selamat datang!**\n\nSaya AI Chatbot siap membantu dengan percakapan interaktif.\n\n💡 Mulai dengan: "jurusan", "beasiswa", "asrama", "transportasi", atau "fasilitas"`,
        quickOptions: ['jurusan', 'beasiswa', 'asrama', 'transportasi', 'fasilitas']
      }
    }
    
    // Default
    return {
      intent: 'general',
      response: `🤔 **Mari eksplor topik berikut:**\n\n1. "Jurusan apa saja?"\n2. "Beasiswa untuk saya"\n3. "Asrama yang nyaman"\n4. "Jadwal shuttle bus"\n5. "Fasilitas kampus"\n\nPilih salah satu atau ketik langsung! 😊`,
      quickOptions: ['jurusan', 'beasiswa', 'asrama', 'transportasi', 'fasilitas']
    }
  }

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
      const aiResponse = getAIResponse(userInput, currentTopic)
      
      // Update current topic
      if (aiResponse.intent && !aiResponse.intent.includes('greeting')) {
        setCurrentTopic(aiResponse.intent.split('_')[0])
      }
      
      const botMessage = {
        id: messages.length + 2,
        text: aiResponse.response,
        sender: 'bot',
        intent: aiResponse.intent,
        timestamp: new Date().toISOString(),
        quickOptions: aiResponse.quickOptions
      }
      
      setMessages(prev => [...prev, botMessage])
      setIsLoading(false)
    }, 800)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleQuickStarter = (value) => {
    setInput(value)
    setTimeout(() => sendMessage(), 100)
  }

  const handleQuickOption = (option) => {
    setInput(option)
    setTimeout(() => sendMessage(), 100)
  }

  const clearChat = () => {
    if (window.confirm('Reset percakapan?')) {
      setMessages([
        {
          id: 1,
          text: '🔄 **Percakapan direset!**\n\nSilakan mulai percakapan baru.',
          sender: 'bot',
          timestamp: new Date().toISOString()
        }
      ])
      setCurrentTopic(null)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                <div className="text-2xl text-white">🤖</div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">AI Chatbot Interaktif</h1>
                <p className="text-gray-600">Percakapan Cerdas • Client-Side</p>
              </div>
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
          
          {/* Quick Starters */}
          <div>
            <p className="text-sm text-gray-500 mb-3 font-medium">🚀 Mulai percakapan:</p>
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
          
          {/* Current Topic */}
          {currentTopic && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">
                  Topik saat ini: {currentTopic.charAt(0).toUpperCase() + currentTopic.slice(1)}
                </span>
                <button
                  onClick={() => handleQuickStarter('keluar')}
                  className="ml-auto text-xs bg-white hover:bg-gray-100 px-2 py-1 rounded border"
                >
                  Ganti topik
                </button>
              </div>
            </div>
          )}
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
                        {msg.sender === 'user' ? (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        )}
                      </div>
                      <div className="text-xs opacity-75">
                        {msg.sender === 'user' ? 'Anda' : 'AI Assistant'} • {formatTime(msg.timestamp)}
                        {msg.intent && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            #{msg.intent}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    <div className="whitespace-pre-line leading-relaxed">
                      {msg.text}
                    </div>
                    
                    {/* Quick Options */}
                    {msg.quickOptions && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                          {msg.quickOptions.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickOption(option)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors border border-gray-300"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
                      <span className="text-sm text-gray-600">
                        {currentTopic ? `Memproses ${currentTopic}...` : 'Menganalisis...'}
                      </span>
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
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={currentTopic ? `Lanjutkan tentang ${currentTopic}... (atau ketik "keluar" untuk ganti topik)` : "Ketik pertanyaan Anda..."}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                  rows="2"
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500">
                    {currentTopic ? (
                      <span className="text-blue-600">💬 Dalam percakapan: {currentTopic}</span>
                    ) : (
                      'Tekan Enter untuk mengirim'
                    )}
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
              <p>💡 <strong>Tips:</strong> AI akan mengingat topik. Tanyakan detail lanjutan atau ketik "keluar" untuk ganti topik.</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2024 AI Chatbot • Client-Side AI • Deploy di Netlify</p>
        </div>
      </div>
    </div>
  )
}
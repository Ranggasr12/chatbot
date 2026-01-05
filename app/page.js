'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '🤖 **Halo! Saya AI Chatbot**\n\nSiap membantu dengan informasi kampus.',
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const quickStarters = [
    { icon: '🎓', text: 'Jurusan', value: 'Jurusan apa saja yang ada?' },
    { icon: '💰', text: 'Beasiswa', value: 'Info beasiswa untuk mahasiswa' },
    { icon: '🏠', text: 'Asrama', value: 'Info asrama dan biayanya' },
    { icon: '🚌', text: 'Transportasi', value: 'Jadwal shuttle bus kampus' },
    { icon: '📚', text: 'Fasilitas', value: 'Fasilitas apa yang tersedia?' }
  ]

  const getAIResponse = (message) => {
    const msg = message.toLowerCase()
    
    if (msg.includes('jurusan')) {
      return `🎓 **Informasi Jurusan:**\n\n• Teknik Informatika (A)\n• Kedokteran (A)\n• Manajemen (A)\n• Hukum (A)\n• Psikologi (A)\n\n📅 Pendaftaran: Januari-Maret 2024`
    }
    
    if (msg.includes('beasiswa')) {
      return `💰 **Beasiswa 2024:**\n\n• Beasiswa Prestasi (IPK ≥ 3.5)\n• KIP-Kuliah (ekonomi kurang mampu)\n• Beasiswa Perusahaan\n\n📝 Pendaftaran: 15 Januari - 15 Februari`
    }
    
    if (msg.includes('asrama')) {
      return `🏠 **Asrama Mahasiswa:**\n\n• Standard: Rp 1.8 juta/semester\n• Premium: Rp 2.8 juta/semester\n• VIP: Rp 3.8 juta/semester\n\n📍 Lokasi: 5 menit dari kampus`
    }
    
    if (msg.includes('bus') || msg.includes('shuttle')) {
      return `🚌 **Shuttle Bus:**\n\n⏰ Jadwal:\n• Senin-Jumat: 06.30-21.00\n• Sabtu: 07.00-18.00\n• Minggu: 08.00-16.00\n\n🗺️ Rute: Kampus ↔ Stasiun ↔ Mall`
    }
    
    if (msg.includes('fasilitas')) {
      return `🏛️ **Fasilitas:**\n\n• Perpustakaan 24/7\n• Lab komputer modern\n• Gym & lapangan olahraga\n• Kantin & coffee shop\n• Klinik kesehatan`
    }
    
    return `🤔 **Tanyakan tentang:**\n\n• "Jurusan teknik apa saja?"\n• "Info beasiswa prestasi"\n• "Biaya asrama"\n• "Jadwal shuttle"\n• "Fasilitas kampus" 😊`
  }

  const sendMessage = () => {
    if (!input.trim() || isLoading) return

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

  const clearChat = () => {
    if (window.confirm('Hapus percakapan?')) {
      setMessages([
        {
          id: 1,
          text: '🔄 **Percakapan direset!**\n\nSilakan tanyakan apa yang Anda butuhkan.',
          sender: 'bot',
          timestamp: new Date().toISOString()
        }
      ])
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
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <div className="text-xl text-white">🤖</div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">AI Chatbot</h1>
                <p className="text-gray-600 text-sm">Chatbot Interaktif</p>
              </div>
            </div>
            
            <button
              onClick={clearChat}
              className="p-2 bg-red-100 hover:bg-red-200 rounded-lg"
              title="Clear chat"
            >
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          {/* Quick Starters */}
          <div>
            <p className="text-sm text-gray-500 mb-2">🚀 Mulai percakapan:</p>
            <div className="grid grid-cols-5 gap-2">
              {quickStarters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickStarter(starter.value)}
                  disabled={isLoading}
                  className="flex flex-col items-center p-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg text-center"
                >
                  <div className="text-lg">{starter.icon}</div>
                  <div className="text-xs font-medium text-gray-700">{starter.text}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow">
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-800 border'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`text-xs ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                      {msg.sender === 'user' ? 'Anda' : 'AI'} • {formatTime(msg.timestamp)}
                    </div>
                  </div>
                  <div className="whitespace-pre-line text-sm">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                    <span className="text-sm text-gray-600">Memproses...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Tulis pesan..."
                className="flex-1 border rounded-lg p-3 text-sm resize-none"
                rows="2"
                disabled={isLoading}
              />
              
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="self-end bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>© 2024 AI Chatbot • Deploy dengan Netlify</p>
        </div>
      </div>
    </div>
  )
}
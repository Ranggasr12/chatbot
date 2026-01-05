'use client'

import { useState, useRef, useEffect } from 'react'

// 🚨 UPDATE UNTUK VERCEL: Pakai relative path
const API_URL = '/api/chat';  // Akan mengarah ke /api/chat.py di Vercel
const HEALTH_URL = '/api/chat'; // GET request ke endpoint yang sama

// Helper untuk getMethodDisplay (tambahkan di atas component)
const getMethodDisplay = (method) => {
  const methods = {
    'ml_model': { emoji: '🤖', text: 'ML Model', color: 'bg-blue-100 text-blue-800' },
    'rule_based': { emoji: '📝', text: 'Rule-Based', color: 'bg-green-100 text-green-800' },
    'greeting_detection': { emoji: '👋', text: 'Greeting', color: 'bg-yellow-100 text-yellow-800' },
    'conversation_exit': { emoji: '🚪', text: 'Exit Flow', color: 'bg-red-100 text-red-800' }
  };
  return methods[method] || { emoji: '❓', text: method, color: 'bg-gray-100 text-gray-800' };
};

// Topic display names
const getTopicDisplayName = (topic) => {
  const names = {
    'asrama_mahasiswa': 'Asrama Mahasiswa',
    'informasi_jurusan': 'Jurusan & Fakultas',
    'beasiswa': 'Beasiswa',
    'bus_schedule': 'Shuttle Bus'
  }
  return names[topic] || topic
}

// Conversation starters
const conversationStarters = [
  { 
    text: "🏠 Asrama Mahasiswa", 
    value: "info asrama mahasiswa",
    description: "Biaya, fasilitas, pendaftaran" 
  },
  { 
    text: "🎓 Jurusan & Fakultas", 
    value: "jurusan apa yang ada",
    description: "Program studi, fakultas, kurikulum" 
  },
  { 
    text: "💰 Beasiswa", 
    value: "beasiswa untuk mahasiswa",
    description: "Jenis, syarat, benefit" 
  },
  { 
    text: "🚌 Shuttle Bus", 
    value: "jadwal shuttle bus kampus",
    description: "Rute, jam, aplikasi tracking" 
  }
]

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '🤖 **Chatbot Akademik dengan Percakapan Interaktif**\n\nSaya dapat membantu dengan percakapan berlanjut tentang topik-topik berikut:',
      sender: 'bot',
      isSystem: true
    },
    {
      id: 2,
      text: '🏠 **Asrama Mahasiswa** → Biaya, fasilitas, pendaftaran\n🎓 **Jurusan & Fakultas** → Program studi, kurikulum\n💰 **Beasiswa** → Jenis, syarat, benefit\n🚌 **Shuttle Bus** → Jadwal, rute, aplikasi\n\n**Coba tanyakan salah satu topik di atas!**',
      sender: 'bot',
      isSystem: true
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState('checking')
  const [isInConversation, setIsInConversation] = useState(false)
  const [currentTopic, setCurrentTopic] = useState(null)
  const [botInfo, setBotInfo] = useState({
    model_loaded: false,
    intents_loaded: 0,
    status: 'unknown'
  })
  const messagesEndRef = useRef(null)

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cek status API saat komponen mount
  useEffect(() => {
    checkApiStatus()
  }, [])

  // 🚨 UPDATE: Fungsi untuk cek koneksi API (untuk Vercel)
  const checkApiStatus = async () => {
    try {
      console.log('🔍 Checking API at:', HEALTH_URL)
      const response = await fetch(HEALTH_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API Response:', data)
        
        setApiStatus('connected')
        setBotInfo({
          model_loaded: data.model_loaded || false,
          intents_loaded: data.intents_loaded || 0,
          status: data.status || 'healthy'
        })
        
        // Tampilkan status
        setMessages(prev => [...prev.filter(m => !m.isStatus), {
          id: prev.length + 1,
          text: `✅ **API Connected**\n• Status: ${data.status || 'healthy'}\n• Model: ${data.model_loaded ? '✅ Loaded' : '⚠️ Rule-based'}\n• Intents: ${data.intents_loaded || 0}\n• Service: ${data.service || 'Chatbot API'}`,
          sender: 'system',
          isStatus: true
        }])
      } else {
        setApiStatus('disconnected')
        setMessages(prev => [...prev.filter(m => !m.isStatus), {
          id: prev.length + 1,
          text: '❌ **API Health Check Failed**\n\nTidak dapat terhubung ke backend.',
          sender: 'system',
          isStatus: true,
          isError: true
        }])
      }
    } catch (error) {
      console.error('❌ API Check Failed:', error)
      setApiStatus('disconnected')
      
      // 🚨 UPDATE: Pesan error untuk Vercel
      setMessages(prev => [...prev.filter(m => !m.isStatus), {
        id: prev.length + 1,
        text: `❌ **Connection Error**\n\nTidak dapat terhubung ke API.\n\n**Environment:** ${process.env.NODE_ENV || 'development'}\n**API URL:** ${API_URL}`,
        sender: 'system',
        isStatus: true,
        isError: true
      }])
    }
  }

  // Kirim pesan ke chatbot
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    // Tambahkan pesan user
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
    }
    
    setMessages(prev => [...prev, userMessage])
    const userInput = input // Simpan input sebelum direset
    setInput('')
    setIsLoading(true)

    try {
      console.log(`📤 Sending to:`, API_URL)
      console.log('Payload:', { message: userInput })
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: userInput }),
      })

      console.log('📥 Response Status:', response.status)
      
      const data = await response.json()
      console.log('📦 Full Response:', data)

      if (data.success) {
        const botMessage = {
          id: messages.length + 2,
          text: data.response,
          sender: 'bot',
          intent: data.intent,
          confidence: data.confidence,
          isInFlow: data.expecting_followup || false,
          topic: data.current_topic || null,
          model_available: data.model_available || false,
          method: data.method || 'rule_based',
          timestamp: data.timestamp || new Date().toISOString()
        }

        setMessages(prev => [...prev, botMessage])
        
        // Update conversation state
        setIsInConversation(data.expecting_followup || false)
        setCurrentTopic(data.current_topic || null)
        
        // Update bot info jika ML sekarang tersedia
        if (data.model_available && !botInfo.model_loaded) {
          checkApiStatus()
        }
        
        // Tampilkan quick options jika dalam flow
        if (data.expecting_followup && data.current_topic) {
          setTimeout(() => {
            showQuickOptions(data.current_topic, userInput.toLowerCase())
          }, 300)
        }
      } else {
        const errorMessage = {
          id: messages.length + 2,
          text: `❌ **Error:** ${data.error || 'Unknown error'}\n\n**Response:** ${data.response}`,
          sender: 'system',
          isError: true
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('🚨 Network Error:', error)
      
      // 🚨 UPDATE: Error message untuk Vercel
      const errorMessage = {
        id: messages.length + 2,
        text: `🌐 **Network Error**\n\n**Error:** ${error.message}\n\n**API URL:** ${API_URL}\n**Environment:** ${process.env.NODE_ENV || 'development'}\n\nPastikan API endpoint tersedia.`,
        sender: 'system',
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
      
      // Update API status
      setApiStatus('disconnected')
    } finally {
      setIsLoading(false)
    }
  }

  // Tampilkan quick options berdasarkan topic
  const showQuickOptions = (topic, lastUserInput) => {
    const topicOptions = {
      'asrama_mahasiswa': {
        title: ' **Asrama Mahasiswa - Quick Options**',
        options: [
          { text: '💵 "biaya" - Info harga & pembayaran', value: 'biaya' },
          { text: '🛏️ "fasilitas" - Fasilitas kamar & umum', value: 'fasilitas' },
          { text: '📝 "pendaftaran" - Cara daftar & syarat', value: 'pendaftaran' },
          { text: '📋 "semua" - Semua informasi lengkap', value: 'semua' },
          { text: '🚪 "keluar" - Kembali ke menu utama', value: 'keluar' }
        ],
        description: 'Ketik pilihan atau pertanyaan lanjutan...'
      },
      
      'informasi_jurusan': {
        title: ' **Jurusan & Fakultas - Quick Options**',
        options: [
          { text: '🔧 "teknik" - Fakultas Teknik & program studi', value: 'teknik' },
          { text: '🏥 "kedokteran" - Kedokteran & kesehatan', value: 'kedokteran' },
          { text: '💰 "ekonomi" - Ekonomi & bisnis', value: 'ekonomi' },
          { text: '⚖️ "hukum" - Hukum & peradilan', value: 'hukum' },
          { text: '📚 "semua" - Semua fakultas & jurusan', value: 'semua' },
          { text: '🚪 "keluar" - Kembali ke menu utama', value: 'keluar' }
        ],
        description: 'Pilih fakultas yang ingin didetailkan...'
      },
      
      'beasiswa': {
        title: ' **Beasiswa - Quick Options**',
        options: [
          { text: '🏆 "prestasi" - Beasiswa prestasi akademik', value: 'prestasi' },
          { text: '💙 "kip-kuliah" - KIP Kuliah & bantuan', value: 'kip-kuliah' },
          { text: '🏢 "perusahaan" - Beasiswa dari perusahaan', value: 'perusahaan' },
          { text: '📋 "syarat" - Syarat & dokumen pendaftaran', value: 'syarat' },
          { text: '📊 "semua" - Semua jenis beasiswa', value: 'semua' },
          { text: '🚪 "keluar" - Kembali ke menu utama', value: 'keluar' }
        ],
        description: 'Pilih jenis beasiswa yang ingin diketahui...'
      },
      
      'bus_schedule': {
        title: ' **Shuttle Bus - Quick Options**',
        options: [
          { text: '⏰ "jadwal" - Jam operasional & frekuensi', value: 'jadwal' },
          { text: '🗺️ "rute" - Rute & titik pemberhentian', value: 'rute' },
          { text: '📱 "aplikasi" - App tracking & fitur', value: 'aplikasi' },
          { text: '📞 "semua" - Semua info shuttle bus', value: 'semua' },
          { text: '🚪 "keluar" - Kembali ke menu utama', value: 'keluar' }
        ],
        description: 'Pilih informasi yang dibutuhkan...'
      }
    }
    
    const topicData = topicOptions[topic]
    
    if (topicData && !lastUserInput.includes('keluar')) {
      setTimeout(() => {
        const optionsText = topicData.options.map(opt => opt.text).join('\n')
        const fullMessage = `${topicData.title}\n\n${optionsText}\n\n${topicData.description}`
        
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: fullMessage,
          sender: 'system',
          isOptions: true,
          topic: topic
        }])
      }, 500)
    }
  }

  // Quick button untuk memilih option
  const selectOption = (optionValue) => {
    setInput(optionValue)
    setTimeout(() => {
      sendMessage()
    }, 100)
  }

  // Handle tombol Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Reset chat
  const clearChat = () => {
    if (window.confirm('Yakin ingin menghapus semua percakapan dan mengulang dari awal?')) {
      setMessages([
        {
          id: 1,
          text: '🤖 **Chatbot Reset Success**\n\nPercakapan telah direset. Silakan tanyakan topik baru!',
          sender: 'bot',
          isSystem: true
        }
      ])
      setIsInConversation(false)
      setCurrentTopic(null)
      setInput('')
    }
  }

  // Exit conversation flow
  const exitConversation = () => {
    setInput('keluar')
    setTimeout(() => {
      sendMessage()
    }, 100)
  }

  // Status indicator
  const getStatusColor = () => {
    switch(apiStatus) {
      case 'connected': return 'bg-green-500'
      case 'disconnected': return 'bg-red-500'
      default: return 'bg-yellow-500'
    }
  }

  // Debug function untuk testing
  const runDebugTest = async () => {
    console.log('🧪 Debug Info:')
    console.log('- API URL:', API_URL)
    console.log('- API Status:', apiStatus)
    console.log('- Bot Info:', botInfo)
    console.log('- In Conversation:', isInConversation)
    console.log('- Current Topic:', currentTopic)
    console.log('- Messages Count:', messages.length)
    console.log('- Environment:', process.env.NODE_ENV)
    
    // Test API langsung
    try {
      const testRes = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: 'test jurusan teknik'})
      })
      const testData = await testRes.json()
      console.log('API Test Result:', testData)
      
      // Tampilkan hasil
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: `🧪 **Debug Test Result**\n\n• Success: ${testData.success}\n• Intent: ${testData.intent}\n• Method: ${testData.method || 'N/A'}\n• Confidence: ${testData.confidence ? (testData.confidence * 100).toFixed(1) : 0}%\n• ML Available: ${testData.model_available ? 'Yes' : 'No'}\n• In Flow: ${testData.expecting_followup ? 'Yes' : 'No'}`,
        sender: 'system',
        isSystem: true
      }])
    } catch (e) {
      console.error('API Test Error:', e)
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: `❌ **Debug Test Failed**\n\nError: ${e.message}\n\nCheck API connection.`,
        sender: 'system',
        isError: true
      }])
    }
  }

  // Quick starter handler
  const handleQuickStarter = (value) => {
    setInput(value)
    // Auto focus dan send setelah delay
    setTimeout(() => {
      const textarea = document.querySelector('textarea')
      if (textarea) {
        textarea.focus()
        // Auto send setelah 200ms
        setTimeout(() => {
          if (input === value) { // Pastikan input belum berubah
            sendMessage()
          }
        }, 200)
      }
    }, 100)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl text-white">🤖</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Chatbot Akademik</h1>
                  <p className="text-gray-600 mt-1">Vercel Edge Functions • Python API</p>
                </div>
              </div>
              
              {/* System Info */}
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor()}`}></div>
                  <span className="text-sm text-gray-600">
                    {apiStatus === 'connected' ? 'API Connected' : 
                     apiStatus === 'disconnected' ? 'API Disconnected' : 'Checking...'}
                  </span>
                </div>
                
                {botInfo.model_loaded && (
                  <div className="flex items-center bg-green-50 px-3 py-1.5 rounded-lg">
                    <span className="text-sm text-green-700">🤖 ML Model Ready</span>
                  </div>
                )}
                
                <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-lg">
                  <span className="text-sm text-blue-700">📚 {botInfo.intents_loaded} Intents</span>
                </div>
                
                {isInConversation && currentTopic && (
                  <div className="flex items-center bg-purple-50 px-3 py-1.5 rounded-lg">
                    <span className="text-sm text-purple-700">🔄 In Flow: {getTopicDisplayName(currentTopic)}</span>
                  </div>
                )}
              </div>
              
              {/* Conversation Status */}
              {isInConversation && currentTopic && (
                <div className="mt-4 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                    <span className="font-medium text-blue-700">Dalam Percakapan:</span>
                    <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {getTopicDisplayName(currentTopic)}
                    </span>
                  </div>
                  <button
                    onClick={exitConversation}
                    className="ml-auto text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-lg transition"
                  >
                    Keluar Percakapan
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={checkApiStatus}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Status
                </button>
                
                <button
                  onClick={runDebugTest}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-lg text-sm transition flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Test API
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Starters Grid */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-3 font-medium">🚀 Mulai percakapan dengan topik:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {conversationStarters.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickStarter(starter.value)}
                  disabled={isLoading || apiStatus === 'disconnected'}
                  className="bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-blue-100 border border-gray-200 hover:border-blue-300 p-4 rounded-xl text-left transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{starter.text.split(' ')[0]}</div>
                    <div>
                      <div className="font-medium text-gray-800">{starter.text}</div>
                      <div className="text-xs text-gray-500 mt-1">{starter.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Messages Area */}
          <div className="h-[550px] overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-gray-50/50 to-white">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : ''} ${
                  msg.isSystem ? 'justify-center' : ''
                }`}
              >
                <div className={`max-w-[85%] p-5 rounded-2xl transition-all duration-300 ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-lg' 
                    : msg.isError
                    ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200 shadow-sm'
                    : msg.isSystem || msg.isStatus
                    ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200'
                    : msg.isOptions
                    ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border border-purple-200 shadow-sm'
                    : msg.isTip
                    ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm'
                    : 'bg-gradient-to-r from-gray-100 to-white text-gray-800 border border-gray-200 rounded-bl-none shadow-md'
                } ${msg.isInFlow ? 'border-l-4 border-blue-400' : ''}`}>
                  
                  {/* Message Content */}
                  <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                  
                  {/* Quick Options Buttons */}
                  {msg.isOptions && msg.topic && (
                    <div className="mt-4 pt-4 border-t border-gray-300/50">
                      <div className="grid grid-cols-1 gap-2">
                        {(() => {
                          const lines = msg.text.split('\n')
                          const optionLines = lines.filter(line => line.includes('"'))
                          return optionLines.map((line, idx) => {
                            const match = line.match(/"([^"]+)"/)
                            if (match) {
                              const optionValue = match[1]
                              return (
                                <button
                                  key={idx}
                                  onClick={() => selectOption(optionValue)}
                                  className="text-left bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-3 transition hover:shadow-sm text-sm"
                                >
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    {line}
                                  </div>
                                </button>
                              )
                            }
                            return null
                          })
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {/* Metadata */}
                  {(msg.intent || msg.method) && !msg.isError && !msg.isSystem && !msg.isStatus && !msg.isOptions && !msg.isTip && (
                    <div className="mt-3 pt-3 border-t border-gray-300/30">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {msg.intent && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            #{msg.intent}
                          </span>
                        )}
                        {msg.method && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            getMethodDisplay(msg.method).color
                          }`}>
                            {getMethodDisplay(msg.method).emoji} {getMethodDisplay(msg.method).text}
                          </span>
                        )}
                        {msg.confidence && (
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                                style={{ width: `${msg.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {(msg.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {msg.timestamp && (
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                        
                        {msg.isInFlow && (
                          <span className="flex items-center text-blue-500">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></span>
                            Percakapan aktif
                          </span>
                        )}
                        
                        {msg.model_available && (
                          <span className="text-green-600 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            ML Active
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex">
                <div className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 p-5 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {isInConversation 
                        ? `Memproses respons untuk ${currentTopic ? getTopicDisplayName(currentTopic) : 'topik ini'}...` 
                        : 'Menganalisis pertanyaan...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={isInConversation 
                    ? `Ketikan pilihan atau lanjutkan percakapan tentang ${currentTopic ? getTopicDisplayName(currentTopic) : 'topik ini'}...` 
                    : "Tanyakan tentang jurusan, beasiswa, asrama, shuttle bus, atau topik kampus lainnya..."}
                  className="w-full border border-gray-300 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition text-gray-800 placeholder-gray-500"
                  rows="2"
                  disabled={isLoading || apiStatus === 'disconnected'}
                />
                
                <div className="absolute right-4 bottom-4 flex items-center space-x-3">
                  <span className={`text-xs ${
                    input.length > 450 ? 'text-red-500' : 
                    input.length > 400 ? 'text-yellow-500' : 'text-gray-400'
                  }`}>
                    {input.length}/500
                  </span>
                  
                  {isInConversation && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      🔄 In Flow
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-3 min-w-[140px]">
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim() || apiStatus === 'disconnected'}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Kirim
                    </span>
                  )}
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={clearChat}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Reset
                  </button>
                  
                  <a
                    href={API_URL}
                    target="_blank"
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    API
                  </a>
                </div>
              </div>
            </div>
            
            {/* API Status Warning */}
            {apiStatus === 'disconnected' && (
              <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl">
                <div className="flex items-center text-red-800">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">API Tidak Terhubung</span>
                </div>
                <div className="text-red-700 text-sm mt-2 ml-7">
                  <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
                  <p><strong>API URL:</strong> {API_URL}</p>
                  <p className="mt-2">Refresh halaman atau coba beberapa saat lagi.</p>
                  <p className="mt-1 text-xs">Jika error berlanjut, pastikan API endpoint tersedia.</p>
                </div>
              </div>
            )}
            
            {/* Tips */}
            <div className="mt-4 text-center text-gray-500 text-sm">
              <p>
                <span className="font-medium">💡 Tips:</span> Sistem menggunakan {botInfo.model_loaded ? 'ML untuk klasifikasi utama' : 'rule-based dengan pattern matching'}
              </p>
              <p className="mt-1 text-xs">
                🤖 Chatbot v2.0 • Vercel Edge Functions • {process.env.NODE_ENV === 'development' ? 'Development Mode' : 'Production Mode'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
'use client'

import { useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    { id: 1, text: '🤖 Halo! Saya AI Chatbot.', sender: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = () => {
    if (!input.trim() || loading) return
    
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: input,
      sender: 'user'
    }])
    
    const userInput = input
    setInput('')
    setLoading(true)
    
    setTimeout(() => {
      let response = 'Saya AI bot. Tanya apa saja!'
      if (userInput.includes('jurusan')) response = '🎓 Jurusan: Teknik, Kedokteran, Ekonomi'
      if (userInput.includes('beasiswa')) response = '💰 Beasiswa: Prestasi, KIP, Perusahaan'
      if (userInput.includes('asrama')) response = '🏠 Asrama: Rp 1.8-3.8 juta/smt'
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: response,
        sender: 'bot'
      }])
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h1 className="text-2xl font-bold">🤖 AI Chatbot</h1>
          <p className="text-gray-600">Deploy di Vercel</p>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="h-96 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Tulis pesan..."
                className="flex-1 border rounded-lg px-4 py-2"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
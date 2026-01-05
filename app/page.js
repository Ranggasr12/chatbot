'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    { id: 1, text: '🤖 **Chatbot Akademik**\n\nHalo! Saya bisa membantu dengan informasi:\n• Jurusan & Fakultas\n• Beasiswa\n• Asrama\n• Shuttle Bus', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { id: messages.length + 1, text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await response.json();

      const botMsg = {
        id: messages.length + 2,
        text: data.response || data.error || 'No response',
        sender: 'bot',
        intent: data.intent
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg = {
        id: messages.length + 2,
        text: `❌ Error: ${error.message}`,
        sender: 'system'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      { id: 1, text: '🤖 Chatbot reset. Silakan tanya lagi!', sender: 'bot' }
    ]);
  };

  const quickQuestions = [
    'Jurusan apa yang ada?',
    'Info beasiswa',
    'Biaya asrama',
    'Jadwal shuttle bus'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🤖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Chatbot Akademik</h1>
                <p className="text-gray-600 text-sm">Simple Next.js Chatbot</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              Clear Chat
            </button>
          </div>

          {/* Quick Questions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(q);
                  setTimeout(() => sendMessage(), 100);
                }}
                className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Box */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : msg.sender === 'system'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  <div className="whitespace-pre-line">{msg.text}</div>
                  {msg.intent && (
                    <div className="text-xs opacity-75 mt-2">#{msg.intent}</div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex">
                <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tanyakan sesuatu..."
                className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
            <p className="text-center text-gray-500 text-sm mt-3">
              Try: "jurusan", "beasiswa", "asrama", "shuttle bus"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
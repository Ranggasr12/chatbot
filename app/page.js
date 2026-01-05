'use client'

import { useState, useRef, useEffect } from 'react'

// API Configuration
const API_URL = '/api/chat';

// Helper functions
const getMethodDisplay = (method) => {
  const methods = {
    'ml_model': { emoji: '🤖', text: 'ML Model', color: 'bg-blue-100 text-blue-800' },
    'rule_based': { emoji: '📝', text: 'Rule-Based', color: 'bg-green-100 text-green-800' },
    'conversation_flow': { emoji: '🔄', text: 'Conversation Flow', color: 'bg-purple-100 text-purple-800' },
    'greeting_detection': { emoji: '👋', text: 'Greeting', color: 'bg-yellow-100 text-yellow-800' }
  };
  return methods[method] || { emoji: '❓', text: method, color: 'bg-gray-100 text-gray-800' };
};

const getTopicDisplayName = (topic) => {
  const names = {
    'asrama_mahasiswa': 'Asrama Mahasiswa',
    'informasi_jurusan': 'Jurusan & Fakultas',
    'beasiswa': 'Beasiswa',
    'bus_schedule': 'Shuttle Bus'
  };
  return names[topic] || topic;
};

// Conversation starters
const conversationStarters = [
  { 
    text: "🏠 Asrama", 
    value: "info asrama mahasiswa",
    description: "Biaya, fasilitas, pendaftaran" 
  },
  { 
    text: "🎓 Jurusan", 
    value: "jurusan apa yang ada",
    description: "Program studi, fakultas" 
  },
  { 
    text: "💰 Beasiswa", 
    value: "beasiswa untuk mahasiswa",
    description: "Jenis, syarat, benefit" 
  },
  { 
    text: "🚌 Shuttle Bus", 
    value: "jadwal shuttle bus",
    description: "Rute, jam, aplikasi" 
  }
];

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '🤖 **Chatbot Akademik**\n\nHalo! Saya bisa membantu dengan informasi:\n• Jurusan & Fakultas\n• Beasiswa & Biaya\n• Asrama Mahasiswa\n• Shuttle Bus Kampus\n\nSilakan tanyakan sesuatu!',
      sender: 'bot',
      isSystem: true
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [isInConversation, setIsInConversation] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check API status
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiStatus('connected');
        
        // Add status message
        if (data.success) {
          setMessages(prev => [...prev.filter(m => !m.isStatus), {
            id: prev.length + 1,
            text: `✅ **System Ready**\n• Status: ${data.status}\n• Intents: ${data.intents_loaded}\n• Features: ${data.features?.join(', ') || 'Basic'}`,
            sender: 'system',
            isStatus: true
          }]);
        }
      } else {
        setApiStatus('disconnected');
      }
    } catch (error) {
      setApiStatus('disconnected');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await response.json();

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
        };

        setMessages(prev => [...prev, botMessage]);
        
        // Update conversation state
        setIsInConversation(data.expecting_followup || false);
        setCurrentTopic(data.current_topic || null);
        
      } else {
        const errorMessage = {
          id: messages.length + 2,
          text: `❌ **Error:** ${data.error || 'Unknown error'}`,
          sender: 'system',
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: `🌐 **Network Error**\n\n${error.message}`,
        sender: 'system',
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setApiStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Reset percakapan?')) {
      setMessages([
        {
          id: 1,
          text: '🤖 **Chatbot Reset**\n\nPercakapan telah direset. Silakan tanyakan topik baru!',
          sender: 'bot',
          isSystem: true
        }
      ]);
      setIsInConversation(false);
      setCurrentTopic(null);
      setInput('');
    }
  };

  const exitConversation = () => {
    setInput('keluar');
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const getStatusColor = () => {
    switch(apiStatus) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const handleQuickStarter = (value) => {
    setInput(value);
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl text-white">🤖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Chatbot Akademik</h1>
                <p className="text-gray-600 text-sm">Next.js • Vercel • Rule-Based AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-lg">
                <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor()}`}></div>
                <span className="text-sm text-gray-700">
                  {apiStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <button
                onClick={clearChat}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Conversation Status */}
          {isInConversation && currentTopic && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="font-medium text-blue-700">Dalam percakapan:</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {getTopicDisplayName(currentTopic)}
                  </span>
                </div>
                <button
                  onClick={exitConversation}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Keluar
                </button>
              </div>
            </div>
          )}

          {/* Quick Starters */}
          <div>
            <p className="text-gray-600 text-sm mb-2">Mulai percakapan:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {conversationStarters.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickStarter(starter.value)}
                  disabled={isLoading || apiStatus === 'disconnected'}
                  className="bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 p-3 rounded-lg text-left transition disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{starter.text.split(' ')[0]}</span>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{starter.text}</div>
                      <div className="text-xs text-gray-500">{starter.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : ''}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                      : msg.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : msg.isSystem || msg.isStatus
                      ? 'bg-gray-100 text-gray-700 border border-gray-200'
                      : 'bg-gray-50 text-gray-800 border border-gray-200 rounded-bl-none'
                  } ${msg.isInFlow ? 'border-l-4 border-blue-400' : ''}`}
                >
                  <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                  
                  {/* Metadata */}
                  {(msg.intent || msg.method) && !msg.isError && !msg.isSystem && !msg.isStatus && (
                    <div className="mt-3 pt-3 border-t border-current/20">
                      <div className="flex flex-wrap items-center gap-2">
                        {msg.intent && (
                          <span className="px-2 py-1 bg-black/10 rounded text-xs">
                            #{msg.intent}
                          </span>
                        )}
                        {msg.method && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            getMethodDisplay(msg.method).color
                          }`}>
                            {getMethodDisplay(msg.method).emoji} {getMethodDisplay(msg.method).text}
                          </span>
                        )}
                        {msg.confidence && (
                          <div className="flex items-center ml-auto">
                            <div className="w-12 bg-gray-200 rounded-full h-1.5 mr-2">
                              <div 
                                className="h-1.5 rounded-full bg-green-500"
                                style={{ width: `${msg.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {(msg.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
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
                <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-none">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {isInConversation 
                        ? `Memproses untuk ${currentTopic ? getTopicDisplayName(currentTopic) : 'topik ini'}...` 
                        : 'Menganalisis...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    isInConversation 
                      ? `Lanjutkan percakapan tentang ${currentTopic ? getTopicDisplayName(currentTopic) : 'topik ini'}...` 
                      : "Tanyakan tentang jurusan, beasiswa, asrama, shuttle bus..."
                  }
                  className="w-full border border-gray-300 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                  rows="2"
                  disabled={isLoading || apiStatus === 'disconnected'}
                />
                
                <div className="absolute right-3 bottom-3">
                  <span className={`text-xs ${
                    input.length > 450 ? 'text-red-500' : 
                    input.length > 400 ? 'text-yellow-500' : 'text-gray-400'
                  }`}>
                    {input.length}/500
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 min-w-[120px]">
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim() || apiStatus === 'disconnected'}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-medium disabled:opacity-50 transition flex items-center justify-center"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses
                    </span>
                  ) : 'Kirim'}
                </button>
                
                <button
                  onClick={checkApiStatus}
                  className="text-sm text-gray-600 hover:text-gray-800 transition"
                >
                  {apiStatus === 'disconnected' ? 'Coba sambung ulang' : 'Cek status'}
                </button>
              </div>
            </div>
            
            {/* Tips */}
            <div className="mt-4 text-center text-gray-500 text-sm">
              <p>💡 <strong>Tips:</strong> Tanyakan detail seperti "biaya asrama" atau "fasilitas kamar"</p>
              <p className="mt-1 text-xs">🤖 Chatbot v1.0 • Next.js API • Conversation Flow</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
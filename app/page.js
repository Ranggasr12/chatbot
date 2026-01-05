'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, RefreshCw, Bot, User, Loader2, MessageSquare, ChevronRight, Sparkles } from 'lucide-react'

const API_URL = '/api/chat';

const quickStarters = [
  { icon: '🔧', text: 'Jurusan Teknik', value: 'Saya mau tanya tentang jurusan teknik' },
  { icon: '🏆', text: 'Beasiswa', value: 'Info beasiswa untuk mahasiswa baru' },
  { icon: '🏠', text: 'Asrama', value: 'Cari info asrama yang nyaman' },
  { icon: '🚌', text: 'Shuttle Bus', value: 'Jadwal shuttle bus hari ini' },
  { icon: '📚', text: 'Fasilitas', value: 'Fasilitas kampus apa saja?' },
  { icon: '💬', text: 'Percakapan', value: 'Halo, bisa bantu saya?' }
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '🤖 **Selamat Datang di Percakapan Interaktif!**\n\nSaya adalah  Chatbot . 🎯\n\n**✨ Fitur Percakapan:**\n• Ingat topik yang sedang dibicarakan\n• Berikan opsi lanjutan\n• Pahami pertanyaan berurutan\n• Bantu eksplorasi detail\n\nPilih topik atau mulai percakapan! 👇',
      sender: 'bot',
      timestamp: new Date().toISOString(),
      isSystem: true
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('online');
  const [currentTopic, setCurrentTopic] = useState(null);
  const [quickOptions, setQuickOptions] = useState([]);
  const [conversationFlow, setConversationFlow] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);
    setQuickOptions([]);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      });

      const data = await response.json();
      
      if (data.success) {
        const botMessage = {
          id: messages.length + 2,
          text: data.response,
          sender: 'bot',
          intent: data.intent,
          timestamp: data.timestamp,
          quickOptions: data.quick_options,
          conversationFlow: data.conversation_flow
        };
        
        setMessages(prev => [...prev, botMessage]);
        setApiStatus('online');
        setConversationFlow(data.conversation_flow || false);
        
        // Set quick options if available
        if (data.quick_options && data.quick_options.length > 0) {
          setQuickOptions(data.quick_options);
        }
        
        // Set current topic based on intent
        if (data.intent && !data.intent.includes('greeting')) {
          setCurrentTopic(data.intent.split('_')[0]);
        } else {
          setCurrentTopic(null);
        }
      }
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: '❌ **Koneksi Error**\n\nMaaf, sistem percakapan sedang gangguan. Silakan coba lagi.',
        sender: 'bot',
        isError: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      setApiStatus('offline');
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
    if (window.confirm('Hapus semua percakapan?')) {
      setMessages([
        {
          id: 1,
          text: '🔄 **Percakapan telah direset!**\n\nSiap untuk percakapan baru. Apa yang ingin Anda tanyakan?',
          sender: 'bot',
          timestamp: new Date().toISOString(),
          isSystem: true
        }
      ]);
      setCurrentTopic(null);
      setQuickOptions([]);
      setConversationFlow(false);
    }
  };

  const handleQuickStarter = (value) => {
    setInput(value);
    setTimeout(() => sendMessage(), 100);
  };

  const handleQuickOption = (option) => {
    setInput(option);
    setTimeout(() => sendMessage(), 100);
  };

  const checkApiStatus = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        setApiStatus('online');
      }
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const exitConversation = () => {
    setInput('keluar');
    setTimeout(() => sendMessage(), 100);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                  <Bot className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">AI Chatbot Interaktif</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {conversationFlow && currentTopic && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Dalam Percakapan: {currentTopic}</span>
                </div>
              )}
              
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${apiStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">{apiStatus === 'online' ? 'Online' : 'Offline'}</span>
              </div>
              
              <button
                onClick={checkApiStatus}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                title="Refresh status"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={clearChat}
                className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition"
                title="Clear chat"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
          
          {/* Conversation Status */}
          {conversationFlow && currentTopic && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="font-medium text-blue-700">Dalam percakapan aktif</span>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {currentTopic.charAt(0).toUpperCase() + currentTopic.slice(1)}
                  </span>
                </div>
                <button
                  onClick={exitConversation}
                  className="text-sm bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 transition"
                >
                  Keluar Percakapan
                </button>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                💡 Sistem mengingat topik ini. Tanyakan detail lanjutan atau ketik "keluar" untuk ganti topik.
              </p>
            </div>
          )}
          
          {/* Quick Starters */}
          <div>
            <p className="text-sm text-gray-500 mb-3 font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Mulai percakapan cepat:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {quickStarters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickStarter(starter.value)}
                  disabled={isLoading}
                  className="group flex flex-col items-center p-3 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50 hover:shadow-sm"
                >
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{starter.icon}</div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700">{starter.text}</div>
                    <div className="text-xs text-gray-500 mt-1">Click to send</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-4 md:p-6 bg-gray-50/50">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-md' 
                    : msg.isError
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : msg.isSystem
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  } ${msg.conversationFlow ? 'border-l-4 border-blue-400' : ''}`}>
                    
                    {/* Message Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-full ${msg.sender === 'user' ? 'bg-blue-400' : 'bg-gradient-to-r from-blue-100 to-blue-200'}`}>
                        {msg.sender === 'user' ? (
                          <User className="w-3.5 h-3.5 text-white" />
                        ) : msg.isError ? (
                          <div className="w-3.5 h-3.5 text-red-500">⚠️</div>
                        ) : (
                          <Bot className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                      <div className="text-xs opacity-75">
                        {msg.sender === 'user' ? 'Anda' : 'AI Assistant'} • {formatTime(msg.timestamp)}
                        {msg.intent && !msg.isError && !msg.isSystem && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            #{msg.intent}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    <div className="whitespace-pre-line leading-relaxed">
                      {msg.text}
                    </div>
                    
                    {/* Quick Options (for bot messages) */}
                    {msg.quickOptions && msg.quickOptions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">💡 <strong>Quick Options:</strong></p>
                        <div className="flex flex-wrap gap-2">
                          {msg.quickOptions.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickOption(option)}
                              className="px-3 py-1.5 bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 rounded-lg text-sm transition-colors"
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
                      <div>
                        <span className="text-sm text-gray-600">
                          {currentTopic 
                            ? `Memproses ${currentTopic}...` 
                            : 'Menganalisis pertanyaan...'}
                        </span>
                        {conversationFlow && (
                          <p className="text-xs text-gray-400 mt-0.5">Mengingat konteks percakapan...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Current Quick Options */}
              {quickOptions.length > 0 && !isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
                    <p className="text-sm font-medium text-blue-700 mb-3">🎯 <strong>Pilihan Lanjutan:</strong></p>
                    <div className="flex flex-wrap gap-2">
                      {quickOptions.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickOption(option)}
                          className="px-4 py-2 bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 rounded-lg text-sm font-medium transition-all hover:shadow-sm hover:scale-105"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600 mt-3">
                      Pilih salah satu atau tanyakan pertanyaan lain tentang topik ini.
                    </p>
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
                  placeholder={
                    conversationFlow && currentTopic 
                      ? `Lanjutkan percakapan tentang ${currentTopic}... (atau ketik "keluar" untuk ganti topik)`
                      : "Mulai percakapan... (contoh: 'Saya mau tanya tentang jurusan teknik')"
                  }
                  className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition placeholder-gray-500"
                  rows="2"
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500">
                    {conversationFlow ? (
                      <span className="text-blue-600 flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        Mode Percakapan Aktif
                      </span>
                    ) : (
                      'Tekan Enter untuk mengirim, Shift+Enter untuk baris baru'
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
                className="self-end bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="hidden md:inline">Kirim</span>
              </button>
            </div>
            
            {/* Tips */}
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>
                💬 <strong>Tips Percakapan:</strong> Sistem mengingat topik. Tanyakan detail lanjutan, 
                contoh: "Jurusan teknik" → "Berapa biayanya?" → "Ada beasiswa?" → "Syaratnya apa?"
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2024 Chatbot </p>
        </div>
      </div>
    </div>
  );
}
'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Trash2, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Brain, 
  BookOpen, 
  Home, 
  Bus, 
  GraduationCap,
  Shield,
  Zap,
  Sparkles,
  ChevronRight,
  Bot,
  User,
  Loader2,
  Clock,
  BarChart3,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Smartphone,
  Globe,
  Coffee
} from 'lucide-react'

const API_URL = '/api/chat';

// Topic display dengan icon
const TOPICS = {
  'jurusan': { name: 'Jurusan & Fakultas', icon: GraduationCap, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  'beasiswa': { name: 'Beasiswa & Dana', icon: Shield, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  'asrama': { name: 'Asrama & Akomodasi', icon: Home, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  'transportasi': { name: 'Transportasi', icon: Bus, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'fasilitas': { name: 'Fasilitas Kampus', icon: BookOpen, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  'greeting': { name: 'Sambutan', icon: MessageSquare, color: 'from-gray-500 to-gray-600', bg: 'bg-gray-500/10', border: 'border-gray-500/20' }
};

// Quick starters dengan icon
const QUICK_STARTERS = [
  { 
    id: 1, 
    text: 'Jurusan Teknologi', 
    value: 'Jurusan teknik dan teknologi apa yang tersedia?', 
    icon: GraduationCap,
    gradient: 'from-blue-500/20 to-blue-600/20',
    hover: 'hover:from-blue-500/30 hover:to-blue-600/30'
  },
  { 
    id: 2, 
    text: 'Beasiswa Prestasi', 
    value: 'Info beasiswa untuk IPK tinggi', 
    icon: Shield,
    gradient: 'from-emerald-500/20 to-green-500/20',
    hover: 'hover:from-emerald-500/30 hover:to-green-500/30'
  },
  { 
    id: 3, 
    text: 'Asrama Premium', 
    value: 'Fasilitas dan biaya asrama premium', 
    icon: Home,
    gradient: 'from-violet-500/20 to-purple-500/20',
    hover: 'hover:from-violet-500/30 hover:to-purple-500/30'
  },
  { 
    id: 4, 
    text: 'Shuttle Bus', 
    value: 'Jadwal shuttle bus kampus hari ini', 
    icon: Bus,
    gradient: 'from-amber-500/20 to-orange-500/20',
    hover: 'hover:from-amber-500/30 hover:to-orange-500/30'
  },
  { 
    id: 5, 
    text: 'Fasilitas Lab', 
    value: 'Apa saja fasilitas laboratorium yang ada?', 
    icon: BookOpen,
    gradient: 'from-rose-500/20 to-pink-500/20',
    hover: 'hover:from-rose-500/30 hover:to-pink-500/30'
  },
  { 
    id: 6, 
    text: 'AI Assistant', 
    value: 'Halo! Bantu saya dengan informasi kampus', 
    icon: Bot,
    gradient: 'from-indigo-500/20 to-purple-500/20',
    hover: 'hover:from-indigo-500/30 hover:to-purple-500/30'
  }
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '🎓 **Selamat Datang di AI Chatbot Akademik!**\n\nSaya adalah **assistant virtual** yang dilengkapi dengan kecerdasan buatan untuk membantu segala kebutuhan informasi kampus Anda.\n\n✨ **Fitur Unggulan:**\n• 🤖 AI Enhanced Responses\n• 🎯 Smart Intent Detection\n• 📊 Data Real-time\n• 💬 Conversation Context\n\nPilih topik atau tanyakan langsung! 👇',
      sender: 'bot',
      timestamp: new Date().toISOString(),
      intent: 'greeting',
      confidence: 0.95,
      isSystem: true,
      animate: true
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [botInfo, setBotInfo] = useState({
    ai_version: '1.0',
    status: 'unknown',
    intents: 0,
    features: []
  });
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check API status on mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setApiStatus('connected');
        setBotInfo({
          ai_version: data.ai_version || '2.0',
          status: data.status,
          intents: data.intents_supported || 6,
          features: data.features || []
        });
        
        // Show welcome message if first time
        if (messages.length === 1) {
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            text: `✅ **System Ready**\n• AI Version: ${data.ai_version || '2.0'}\n• Status: ${data.status || 'healthy'}\n• Features: ${(data.features || []).slice(0, 3).join(', ')}...\n• Intents Supported: ${data.intents_supported || 6}`,
            sender: 'system',
            timestamp: new Date().toISOString(),
            isSystem: true,
            animate: true
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

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
      animate: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);
    setTyping(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await response.json();
      
      // Simulate AI typing delay
      setTimeout(() => {
        setTyping(false);
        
        if (data.success) {
          const botMessage = {
            id: messages.length + 2,
            text: data.response,
            sender: 'bot',
            intent: data.intent,
            confidence: data.confidence,
            method: data.method,
            ai_version: data.ai_version,
            timestamp: data.timestamp,
            animate: true
          };
          
          setMessages(prev => [...prev, botMessage]);
        } else {
          const errorMessage = {
            id: messages.length + 2,
            text: `❌ **Oops!**\n\n${data.response || 'Terjadi kesalahan. Silakan coba lagi.'}`,
            sender: 'system',
            isError: true,
            timestamp: new Date().toISOString(),
            animate: true
          };
          setMessages(prev => [...prev, errorMessage]);
        }
        setIsLoading(false);
      }, 800);

    } catch (error) {
      setTyping(false);
      setIsLoading(false);
      const errorMessage = {
        id: messages.length + 2,
        text: `🌐 **Connection Error**\n\nTidak dapat terhubung ke server AI.\n\nSilakan coba refresh halaman atau hubungi administrator.`,
        sender: 'system',
        isError: true,
        timestamp: new Date().toISOString(),
        animate: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setApiStatus('disconnected');
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
          text: '🔄 **Percakapan telah direset!**\n\nSaya siap membantu dengan pertanyaan baru Anda.\n\nPilih topik favorit atau tanyakan apapun! 😊',
          sender: 'bot',
          timestamp: new Date().toISOString(),
          intent: 'greeting',
          isSystem: true,
          animate: true
        }
      ]);
      setInput('');
    }
  };

  const handleQuickStarter = (value) => {
    setInput(value);
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = () => {
    switch(apiStatus) {
      case 'connected': return <Wifi className="w-4 h-4 text-emerald-400" />;
      case 'disconnected': return <WifiOff className="w-4 h-4 text-rose-400" />;
      default: return <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch(apiStatus) {
      case 'connected': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'disconnected': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    }
  };

  const getStatusText = () => {
    switch(apiStatus) {
      case 'connected': return 'AI Connected';
      case 'disconnected': return 'Disconnected';
      default: return 'Checking...';
    }
  };

  const TopicIcon = ({ intent }) => {
    const topic = TOPICS[intent] || TOPICS['greeting'];
    const Icon = topic.icon;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header dengan Glassmorphism Effect */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Left: Logo & Title */}
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-lg opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-3 rounded-xl border border-white/10">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    AI Chatbot Akademik
                  </h1>
                  <p className="text-gray-400 mt-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Powered by Advanced AI • Real-time Responses
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-6 flex flex-wrap gap-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}>
                  {getStatusIcon()}
                  <span className="text-sm font-medium">{getStatusText()}</span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium">AI v{botInfo.ai_version}</span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">{botInfo.intents} Intents</span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-400">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Fast Response</span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={checkApiStatus}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={clearChat}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all hover:scale-105"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Chat</span>
              </button>
            </div>
          </div>

          {/* Quick Starters Grid */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <p className="text-sm text-gray-400 font-medium whitespace-nowrap">
                🚀 Quick Starters
              </p>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {QUICK_STARTERS.map((starter) => (
                <button
                  key={starter.id}
                  onClick={() => handleQuickStarter(starter.value)}
                  disabled={isLoading || apiStatus === 'disconnected'}
                  className={`relative group p-4 rounded-xl border border-white/10 ${starter.gradient} ${starter.hover} transition-all duration-300 hover:scale-[1.02] hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <starter.icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-white">{starter.text}</div>
                      <div className="text-xs text-gray-400 mt-1">Click to send</div>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-auto text-white/40 group-hover:text-white/60 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Container */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Messages Area */}
          <div className="h-[500px] md:h-[600px] overflow-y-auto p-4 md:p-6">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} ${msg.animate ? 'message-animate' : ''}`}
                >
                  <div className={`relative max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-br-none' 
                    : msg.isError
                    ? 'bg-gradient-to-br from-rose-500/10 to-rose-600/10 border border-rose-500/20'
                    : msg.isSystem
                    ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10'
                    : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-white/10 rounded-bl-none'
                  }`}>
                    
                    {/* Avatar */}
                    <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      msg.sender === 'user' 
                        ? 'bg-blue-500 border-blue-600' 
                        : msg.isError
                        ? 'bg-rose-500 border-rose-600'
                        : msg.isSystem
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 border-blue-600'
                    }`}>
                      {msg.sender === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : msg.isError ? (
                        <AlertCircle className="w-4 h-4 text-white" />
                      ) : msg.isSystem ? (
                        <Smartphone className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className="pl-6">
                      <div className="whitespace-pre-line text-gray-100 leading-relaxed">
                        {msg.text}
                      </div>
                      
                      {/* Message Footer */}
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {msg.intent && !msg.isError && !msg.isSystem && (
                              <>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                                  TOPICS[msg.intent]?.bg || 'bg-gray-700'
                                } ${TOPICS[msg.intent]?.border || 'border-gray-600'} text-gray-300`}>
                                  <TopicIcon intent={msg.intent} />
                                  <span>{TOPICS[msg.intent]?.name || msg.intent}</span>
                                </div>
                                
                                {msg.confidence && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                                        style={{ width: `${msg.confidence * 100}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                      {Math.round(msg.confidence * 100)}%
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                        
                        {/* AI Info */}
                        {msg.ai_version && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1 text-cyan-400">
                              <Brain className="w-3 h-3" />
                              <span>AI v{msg.ai_version}</span>
                            </div>
                            {msg.method === 'ai_enhanced' && (
                              <div className="flex items-center gap-1 text-emerald-400">
                                <Sparkles className="w-3 h-3" />
                                <span>Enhanced Response</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {(isLoading || typing) && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-white/10 rounded-2xl rounded-bl-none p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full loading-dot"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full loading-dot"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full loading-dot"></div>
                      </div>
                      <span className="text-sm text-gray-300">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Tanyakan apapun tentang kampus... (jurusan, beasiswa, asrama, transportasi, fasilitas)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none transition text-white placeholder-gray-400"
                  rows="2"
                  disabled={isLoading || apiStatus === 'disconnected'}
                />
                
                <div className="absolute right-4 bottom-4 flex items-center gap-3">
                  <span className={`text-xs ${
                    input.length > 450 ? 'text-rose-400' : 
                    input.length > 400 ? 'text-amber-400' : 'text-gray-400'
                  }`}>
                    {input.length}/500
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 min-w-[140px]">
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim() || apiStatus === 'disconnected'}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send</span>
                    </>
                  )}
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => inputRef.current?.focus()}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-2 transition-colors"
                    title="Focus input"
                  >
                    <MessageSquare className="w-4 h-4 mx-auto" />
                  </button>
                  
                  <a
                    href={API_URL}
                    target="_blank"
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-2 transition-colors"
                    title="API Endpoint"
                  >
                    <Globe className="w-4 h-4 mx-auto" />
                  </a>
                  
                  <button
                    onClick={clearChat}
                    className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg p-2 transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 className="w-4 h-4 mx-auto text-rose-400" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tips & Status */}
            <div className="mt-6 space-y-3">
              {apiStatus === 'disconnected' && (
                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                    <div>
                      <div className="font-medium text-rose-400">AI Service Disconnected</div>
                      <div className="text-sm text-rose-300/80 mt-1">
                        Silakan refresh halaman atau coba beberapa saat lagi. Sistem akan menggunakan fallback responses.
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm text-gray-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4" />
                    <span>AI Powered Responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Real-time Updates</span>
                  </div>
                </div>
                
                <div className="text-xs">
                  <span className="text-gray-500">© 2024 AI Chatbot Akademik • </span>
                  <span className="text-cyan-400">v{botInfo.ai_version}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
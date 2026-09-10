import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Mic,
  MicOff,
  AlertTriangle,
  HeartPulse,
  RefreshCw,
  PhoneCall,
  ShieldAlert
} from 'lucide-react';
import { AnimalProfile, HealthReport, Language } from '../types';
import { translations, getTranslation } from '../i18n/translations';

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AskAssistantModalProps {
  language: Language;
  onClose: () => void;
  selectedAnimal?: AnimalProfile | null;
  activeReport?: HealthReport | null;
}

export const AskAssistantModal: React.FC<AskAssistantModalProps> = ({
  language,
  onClose,
  selectedAnimal,
  activeReport,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text:
        language === 'hi'
          ? `नमस्ते! मैं पशू साथी AI हूँ। ${
              selectedAnimal ? `मैं आपके पशु "${selectedAnimal.name}" (${selectedAnimal.type}) के स्वास्थ्य के बारे में मदद कर सकता हूँ।` : 'आप अपने पशु के स्वास्थ्य, आहार या लक्षणों के बारे में कुछ भी पूछ सकते हैं।'
            }`
          : language === 'mr'
          ? `नमस्कार! मी पशू साथी AI आहे. ${
              selectedAnimal ? `मी आपले जनावर "${selectedAnimal.name}" (${selectedAnimal.type}) संबंधी मदत करू शकतो.` : 'आपण जनावराचे आरोग्य, आहार किंवा लक्षणांविषयी विचारू शकता.'
            }`
          : `Hello! I am Pashu Saathi AI. ${
              selectedAnimal
                ? `I am ready to help with health questions regarding "${selectedAnimal.name}" (${selectedAnimal.type} • ${selectedAnimal.breed || 'Indigenous'}).`
                : 'Ask me anything about livestock care, symptoms, dietary management, or first aid.'
            }`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    language === 'hi' ? 'पशु ने चारा खाना बंद कर दिया है, क्या करूँ?' : language === 'mr' ? 'जनावराने चारा खाणे बंद केले आहे, काय करावे?' : 'My animal stopped eating.',
    language === 'hi' ? 'मुझे किन लक्षणों पर ध्यान देना चाहिए?' : language === 'mr' ? 'मी कोणती लक्षणे तपासावीत?' : 'What symptoms should I monitor?',
    language === 'hi' ? 'डॉक्टर को क्या जानकारी देनी चाहिए?' : language === 'mr' ? 'डॉक्टरांना काय माहिती द्यावी?' : 'What info should I give the vet?',
    language === 'hi' ? 'क्या यह बीमारी दूसरे पशुओं में फैल सकती है?' : language === 'mr' ? 'हा आजार इतर जनावरांमध्ये पसरू शकतो का?' : 'Is this condition contagious to others?',
  ];

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Speech Recognition for voice queries
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Build animal context
      const animalContext = selectedAnimal
        ? {
            name: selectedAnimal.name,
            type: selectedAnimal.type,
            breed: selectedAnimal.breed,
            age: selectedAnimal.age,
            gender: selectedAnimal.gender,
            status: selectedAnimal.status,
            healthScore: selectedAnimal.healthScore,
            ownerNotes: selectedAnimal.ownerNotes,
          }
        : activeReport
        ? {
            name: activeReport.animalName,
            type: activeReport.animalType,
            symptoms: activeReport.symptoms,
            status: activeReport.result?.overallHealthStatus,
            healthScore: activeReport.result?.healthScore,
          }
        : null;

      const historyContext = messages.slice(-4).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          animalContext,
          language,
          history: historyContext,
        }),
      });

      const data = await response.json();

      const aiMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text:
          data.reply ||
          (language === 'hi'
            ? 'पशु साथी AI: कृपया पशु को स्वच्छ पानी दें और नजदीकी पशु चिकित्सालय से संपर्क करें।'
            : 'Pashu Saathi AI: Please ensure adequate hydration and consult a licensed veterinarian for specific treatment.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: MessageItem = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'hi'
            ? 'नेटवर्क की समस्या के कारण उत्तर नहीं मिल सका। कृपया पुनः प्रयास करें या आपातकालीन हेल्पलाइन 1962 पर कॉल करें।'
            : 'Could not connect right now. Please try again or call the National Livestock Helpline 1962.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-hidden">
      <div className="w-full max-w-2xl h-[85vh] max-h-[700px] rounded-3xl bg-white shadow-2xl border border-stone-200 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 text-white flex items-center justify-center backdrop-blur-xs">
              <Bot className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  {language === 'hi' ? 'पशु साथी AI से पूछें' : language === 'mr' ? 'पशू साथी AI सहाय्यक' : 'Ask Pashu Saathi AI'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                  Live Vet AI
                </span>
              </div>
              <span className="text-xs text-emerald-100 block">
                {selectedAnimal
                  ? `Context: ${selectedAnimal.name} (${selectedAnimal.type})`
                  : activeReport
                  ? `Context: Report ${activeReport.reportCode}`
                  : 'Contextual Animal Health Support'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clinical Disclaimer Ribbon */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-[11px] text-amber-800 shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            AI advice is for preliminary decision support. For life-threatening symptoms, immediately contact a licensed veterinarian or dial <strong>1962</strong>.
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-2xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-br-xs'
                    : 'bg-white border border-stone-200 text-stone-800 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <span
                  className={`block text-[10px] mt-1.5 font-medium ${
                    msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-stone-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-2 text-xs text-stone-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                <span>Pashu Saathi AI is consulting veterinary knowledge...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="p-2.5 bg-white border-t border-stone-100 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 border border-stone-200 text-[11px] font-medium text-stone-700 whitespace-nowrap transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleVoiceInput}
              title="Speak in your language"
              className={`p-2.5 rounded-xl border transition ${
                isListening
                  ? 'bg-red-600 text-white border-red-600 animate-pulse'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'लक्षण या सवाल पूछें...'
                  : language === 'mr'
                  ? 'लक्षणे किंवा प्रश्न विचारा...'
                  : 'Ask about symptoms, feed, or precautions...'
              }
              className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-stone-50/50"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm transition active:scale-95 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

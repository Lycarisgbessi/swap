import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Bot, User, Send } from 'lucide-react';
import { sendChatMessage } from '../services/api';

interface Message { role: 'user' | 'assistant'; text: string; }

const PREDEFINED_QUESTIONS = [
  {
    q: "Quels sont les domaines de formation ?",
    a: "Nous proposons des formations en leadership, politiques publiques, économie, mines et digital."
  },
  {
    q: "Où se déroulent les formations ?",
    a: "Nos formations sont accessibles en ligne et certaines sessions se tiennent en présentiel."
  },
  {
    q: "Comment s'inscrire ?",
    a: "Vous pouvez vous inscrire directement sur la plateforme en choisissant la formation de votre choix."
  },
  {
    q: "Délivrez-vous des certificats ?",
    a: "Oui, toutes nos formations sont certifiantes et reconnues."
  }
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Bonjour 👋 Je suis votre assistant formation. Comment puis-je vous aider ?' }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAssistantResponse = async (userText: string) => {
    const predefined = PREDEFINED_QUESTIONS.find(q => userText.toLowerCase().includes(q.q.toLowerCase().slice(0, 10)));
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      return data.reply;
    } catch (e) {
      return predefined ? predefined.a : "Je suis désolé, je ne peux pas répondre à cette question pour le moment. Veuillez contacter notre support.";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);
    const reply = await getAssistantResponse(userMsg);
    setMessages(m => [...m, { role: 'assistant', text: reply }]);
    setLoading(false);
  };

  const handleQuestionClick = async (question: string, answer: string) => {
    setMessages(m => [...m, { role: 'user', text: question }]);
    setLoading(true);
    const reply = await getAssistantResponse(question);
    setMessages(m => [...m, { role: 'assistant', text: reply }]);
    setLoading(false);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        aria-label="Ouvrir le chatbot"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-6 h-6 text-white" />
              </motion.div>
            : <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <MessageCircle className="w-6 h-6 text-white" />
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-sm">Assistant Formation</p>
                <p className="text-slate-500 text-xs font-medium">IA disponible</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-sm ${m.role === 'user' ? 'bg-primary/10' : 'bg-slate-100'}`}>
                    {m.role === 'user' ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-sm border ${m.role === 'user' ? 'bg-primary text-white border-primary rounded-tr-sm' : 'bg-slate-50 text-slate-700 border-slate-200 rounded-tl-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && <div className="text-xs text-slate-400 p-2 italic">L'assistant réfléchit...</div>}
              
              <div className="mt-4 px-4 pb-4">
                <p className="text-xs text-slate-500 font-medium mb-3">Questions fréquentes :</p>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_QUESTIONS.map((q, idx) => (
                    <button key={idx} onClick={() => handleQuestionClick(q.q, q.a)} className="px-3 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-colors">
                      {q.q}
                    </button>
                  ))}
                </div>
              </div>
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t border-slate-100 flex gap-2">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez votre question..." 
                className="flex-1 bg-slate-50 rounded-full px-4 py-2 text-sm focus:outline-none border border-slate-200"
              />
              <button onClick={handleSend} className="p-2 rounded-full bg-primary text-white"><Send className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

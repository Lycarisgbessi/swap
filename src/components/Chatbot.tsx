import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Bot, User, Send, Sparkles } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; text: string; }

const PREDEFINED_QUESTIONS = [
  {
    q: "Quels sont les domaines de formation ?",
    a: "Nous proposons des formations en leadership, développement web, marketing digital, data et finance."
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
    a: "Oui, la plupart de nos formations sont certifiantes. Le détail est indiqué sur chaque fiche formation."
  }
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Bonjour 👋 Je suis votre assistant Swap. Comment puis-je vous aider ?' }
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
        whileHover={{ scale: 1.1, rotate: -4 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-15 h-15 rounded-full flex items-center justify-center shadow-xl"
        style={{
          width: 60, height: 60,
          background: 'var(--tri-gradient)',
          backgroundSize: '180% auto',
          animation: 'gradientPan 7s ease infinite, pulseRing 2.6s ease infinite',
          color: '#04180F',
        }}
        aria-label="Ouvrir le chatbot">
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-6 h-6" style={{ color: '#04180F' }} />
              </motion.div>
            : <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <MessageCircle className="w-6 h-6" style={{ color: '#04180F' }} />
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 24, rotate: -1 }}
            animate={{ opacity: 1, scale: 1,    y: 0,  rotate: 0 }}
            exit={{    opacity: 0, scale: 0.85, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-26 right-6 z-50 w-80 sm:w-96 h-[520px] bg-white flex flex-col overflow-hidden shadow-2xl"
            style={{ borderRadius: '1.75rem', border: '1.5px solid var(--border)', bottom: 104 }}
          >
            {/* Barre tricolore */}
            <div className="tri-bar" />

            {/* Header */}
            <div className="p-4 flex items-center gap-3" style={{ background: '#F4FBF3', borderBottom: '1.5px solid var(--border)' }}>
              <motion.div
                animate={{ rotate: [0, -6, 6, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-heading font-black"
                style={{ background: 'var(--tri-gradient)', color: '#04180F' }}>
                <Bot className="w-5 h-5" style={{ color: '#04180F' }} />
              </motion.div>
              <div>
                <p className="font-heading font-extrabold text-sm" style={{ color: 'var(--ink)' }}>Assistant Swap</p>
                <p className="text-xs font-bold flex items-center gap-1" style={{ color: '#149352' }}>
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: '#22C55E' }} />
                  En ligne
                </p>
              </div>
              <Sparkles className="w-4 h-4 ml-auto" style={{ color: '#FFC72C' }} />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" style={{ background: 'var(--cream)' }}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                    m.role === 'user' ? '' : ''
                  }`}
                    style={m.role === 'user'
                      ? { background: '#DCFCE7' }
                      : { background: 'var(--tri-gradient)' }}>
                    {m.role === 'user'
                      ? <User className="w-4 h-4" style={{ color: '#149352' }} />
                      : <Bot className="w-4 h-4" style={{ color: '#04180F' }} />}
                  </div>
                  <div className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap font-medium ${
                    m.role === 'user' ? 'rounded-2xl rounded-tr-md text-white' : 'rounded-2xl rounded-tl-md'
                  }`}
                    style={m.role === 'user'
                      ? { background: 'var(--green-700)', color: '#fff' }
                      : { background: '#fff', color: 'var(--ink)', border: '1.5px solid var(--border)' }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-md w-fit"
                  style={{ background: '#fff', border: '1.5px solid var(--border)' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-2 h-2 rounded-full"
                      style={{ background: ['#149352', '#FFC72C', '#E23744'][i], animation: `bounceDot 1.2s ${i * 0.15}s ease infinite` }} />
                  ))}
                </div>
              )}

              {/* Questions fréquentes (avant le premier échange) */}
              {messages.length === 1 && (
                <div className="mt-2 px-1 pb-2">
                  <p className="text-xs font-bold mb-2.5 uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>Questions fréquentes :</p>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_QUESTIONS.map((q, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.04, rotate: -0.5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuestionClick(q.q, q.a)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{
                          background: ['#DCFCE7', '#FFF4CC', '#FDE3E5', '#DCFCE7'][idx % 4],
                          color: ['#149352', '#b8860b', '#E23744', '#149352'][idx % 4],
                          border: `1.5px solid ${['rgba(20,147,82,.25)', 'rgba(255,199,44,.45)', 'rgba(226,55,68,.3)', 'rgba(20,147,82,.25)'][idx % 4]}`,
                        }}>
                        {q.q}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 flex gap-2" style={{ borderTop: '1.5px solid var(--border)' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez votre question…"
                className="flex-1 rounded-full px-4 py-2.5 text-sm focus:outline-none font-medium"
                style={{ background: 'var(--cream)', border: '1.5px solid var(--border)', color: 'var(--ink)' }}
              />
              <motion.button
                onClick={handleSend}
                whileHover={{ scale: 1.08, rotate: -6 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--tri-gradient)' }}>
                <Send className="w-4 h-4" style={{ color: '#04180F' }} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

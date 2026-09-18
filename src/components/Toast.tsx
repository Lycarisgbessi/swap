import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans ToastProvider');
  return ctx;
}

const icons = {
  success: <CheckCircle className="w-5 h-5" style={{ color: '#22C55E' }} />,
  error:   <XCircle    className="w-5 h-5" style={{ color: '#EF4444' }} />,
  warning: <AlertCircle className="w-5 h-5" style={{ color: '#FFC72C' }} />,
  info:    <Info       className="w-5 h-5" style={{ color: '#22C55E' }} />,
};

const colors = {
  success: 'border-[rgba(34,197,94,0.5)]  bg-[#062817]',
  error:   'border-[rgba(239,68,68,0.5)]  bg-[#062817]',
  warning: 'border-[rgba(255,199,44,0.5)] bg-[#062817]',
  info:    'border-[rgba(34,197,94,0.5)]  bg-[#062817]',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const remove = (id: string) => setToasts(p => p.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0,  scale: 1 }}
              exit={{    opacity: 0, x: 60, scale: 0.9 }}
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 backdrop-blur-xl shadow-2xl ${colors[t.type]}`}
            >
              <div className="shrink-0 mt-0.5">{icons[t.type]}</div>
              <p className="text-sm text-white/90 leading-relaxed flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="shrink-0 text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

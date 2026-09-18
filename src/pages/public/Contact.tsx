import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';
import React, { useState } from 'react';

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen pt-32 pb-20 relative overflow-hidden" style={{ background: 'var(--dark-base)' }}>
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] blur-[100px] rounded-full" style={{ background: 'var(--gold-muted)' }}></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
        
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl font-heading font-extrabold text-white mb-6 tracking-tight">Contactez-nous</h1>
          <p className="text-lg mb-12 font-medium" style={{ color: 'var(--text-muted)' }}>
            Une question sur une formation ? Besoin d'un accompagnement personnalisé pour votre entreprise ? N'hésitez pas à nous écrire.
          </p>

          <div className="space-y-8">
            <div className="flex items-start space-x-5">
               <div className="p-4 rounded-2xl border" style={{ background: 'var(--gold-muted)', borderColor: 'var(--gold)' }}>
                 <Mail className="w-6 h-6" style={{ color: 'var(--gold)' }} />
               </div>
               <div className="pt-1">
                  <h4 className="font-bold mb-1 text-lg" style={{ color: 'var(--text-bright)' }}>Email</h4>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-muted)' }}>contact@exemple.com</p>
               </div>
            </div>
            <div className="flex items-start space-x-5">
               <div className="p-4 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                 <Phone className="w-6 h-6 text-white" />
               </div>
               <div className="pt-1">
                  <h4 className="font-bold mb-1 text-lg" style={{ color: 'var(--text-bright)' }}>Téléphone</h4>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-muted)' }}>+224 000 000 000</p>
               </div>
            </div>
            <div className="flex items-start space-x-5">
               <div className="p-4 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                 <MapPin className="w-6 h-6 text-white" />
               </div>
               <div className="pt-1">
                  <h4 className="font-bold mb-1 text-lg" style={{ color: 'var(--text-bright)' }}>Bureaux</h4>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-muted)' }}>Adresse à définir<br/>(Sur rendez-vous uniquement)</p>
               </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-white rounded-3xl p-8 lg:p-10 shadow-2xl border border-[var(--border)]">
           {isSent ? (
              <div className="text-center py-12">
                 <div className="w-20 h-20 bg-[var(--gold-muted)] text-[var(--gold)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-[var(--gold)]">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-dark-primary mb-3">Message envoyé !</h3>
                 <p className="text-dark-secondary font-medium">Notre équipe vous répondra dans les plus brefs délais.</p>
                 <button onClick={() => setIsSent(false)} className="mt-8 font-bold hover:underline" style={{ color: 'var(--gold)' }}>Envoyer un autre message</button>
              </div>
           ) : (
             <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-dark-primary uppercase tracking-wider block">Nom complet</label>
                   <input required type="text" className="w-full bg-white border border-[var(--border)] rounded-xl px-4 py-3 text-dark-primary focus:ring-2 focus:ring-[var(--gold)] focus:outline-none shadow-sm font-medium" placeholder="Jean Dupont" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-dark-primary uppercase tracking-wider block">Email</label>
                   <input required type="email" className="w-full bg-white border border-[var(--border)] rounded-xl px-4 py-3 text-dark-primary focus:ring-2 focus:ring-[var(--gold)] focus:outline-none shadow-sm font-medium" placeholder="jean@example.com" />
                 </div>
               </div>
               
               <div className="space-y-2">
                 <label className="text-sm font-bold text-dark-primary uppercase tracking-wider block">Sujet</label>
                 <select className="w-full bg-white border border-[var(--border)] rounded-xl px-4 py-3 text-dark-primary focus:ring-2 focus:ring-[var(--gold)] focus:outline-none appearance-none shadow-sm font-medium">
                    <option value="general">Question générale</option>
                    <option value="support">Support technique</option>
                    <option value="billing">Facturation</option>
                    <option value="business">Entreprise / B2B</option>
                 </select>
               </div>

               <div className="space-y-2">
                 <label className="text-sm font-bold text-dark-primary uppercase tracking-wider block">Message</label>
                 <textarea required rows={5} className="w-full bg-white border border-[var(--border)] rounded-xl px-4 py-3 text-dark-primary focus:ring-2 focus:ring-[var(--gold)] focus:outline-none resize-y shadow-sm font-medium" placeholder="Comment pouvons-nous vous aider ?"></textarea>
               </div>

               <button type="submit" disabled={isSubmitting} className="w-full btn-gold py-4 text-lg shadow-md disabled:opacity-50 mt-2 font-extrabold">
                 {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
               </button>
             </form>
           )}
        </motion.div>

      </div>
    </div>
  );
}

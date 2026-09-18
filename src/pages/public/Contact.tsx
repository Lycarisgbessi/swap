import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { Reveal, RevealText } from '../../components/Reveal';

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
    <div className="min-h-screen pt-36 pb-24 section-cream relative overflow-hidden">
      {/* Décor */}
      <div className="blob blob-yellow" style={{ width: 420, height: 420, top: '-120px', left: '-130px' }} />
      <div className="blob blob-green"  style={{ width: 360, height: 360, bottom: '-80px', right: '-100px', animationDelay: '-7s' }} />
      <div className="dot-grid absolute inset-0 opacity-30" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">

        {/* ── Colonne gauche ── */}
        <div>
          <Reveal><span className="section-label">Contact</span></Reveal>
          <h1 className="display-hero text-5xl md:text-6xl mt-6 mb-6" style={{ color: 'var(--ink)' }}>
            <RevealText text="Parlons de votre" delay={0.05} />{' '}
            <span className="tri-text"><RevealText text="prochain pas." delay={0.4} /></span>
          </h1>
          <Reveal delay={0.4}>
            <p className="text-lg mb-12 font-medium max-w-md" style={{ color: 'var(--ink-soft)' }}>
              Une question sur une formation ? Besoin d'un accompagnement
              personnalisé ? Écrivez-nous, on adore les échanges.
            </p>
          </Reveal>

          <div className="space-y-5">
            {[
              { icon: Mail, title: 'Email', value: 'contact@exemple.com', bg: '#FFF4CC', color: '#b8860b', href: 'mailto:contact@exemple.com' },
              { icon: Phone, title: 'Téléphone', value: '+224 000 000 000', bg: '#DCFCE7', color: '#149352', href: 'tel:+224000000000' },
              { icon: MapPin, title: 'Bureaux', value: 'Adresse à définir (sur rendez-vous)', bg: '#FDE3E5', color: '#E23744' },
            ].map((c, i) => (
              <Reveal key={i} delay={0.1 + i * 0.1} x={-30} y={0}>
                <motion.a
                  href={c.href || undefined}
                  whileHover={{ x: 8, rotate: i % 2 ? 0.5 : -0.5 }}
                  className="card-flat flex items-center gap-5 p-5 w-full text-left group"
                  style={{ cursor: c.href ? 'pointer' : 'default' }}>
                  <div className="p-3.5 rounded-2xl flex-shrink-0 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110"
                    style={{ background: c.bg, color: c.color, transform: 'rotate(-3deg)' }}>
                    <c.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-lg" style={{ color: 'var(--ink)' }}>{c.title}</h4>
                    <p className="font-medium text-sm" style={{ color: 'var(--ink-soft)' }}>{c.value}</p>
                  </div>
                </motion.a>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Formulaire ── */}
        <Reveal x={40} y={0} delay={0.2}>
          <div className="relative">
            {/* Carte flottante décalée décorative */}
            <div className="absolute -top-5 -right-5 w-full h-full rounded-[2rem] tri-bar" style={{ height: 8, width: '60%', right: '20%' }} aria-hidden />

            <div className="card-pop p-8 lg:p-10">
              {isSent ? (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                  className="text-center py-14">
                  <motion.div
                    animate={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{ background: 'var(--tri-gradient)' }}>
                    <Sparkles className="w-10 h-10" style={{ color: '#04180F' }} />
                  </motion.div>
                  <h3 className="text-2xl font-heading font-extrabold mb-3" style={{ color: 'var(--ink)' }}>Message envoyé !</h3>
                  <p className="font-medium mb-8" style={{ color: 'var(--ink-soft)' }}>Notre équipe vous répondra dans les plus brefs délais.</p>
                  <button onClick={() => setIsSent(false)} className="btn-mini">
                    Envoyer un autre message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--ink)' }}>Nom complet</label>
                      <input required type="text" className="input-swap" placeholder="Jean Dupont" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--ink)' }}>Email</label>
                      <input required type="email" className="input-swap" placeholder="jean@exemple.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--ink)' }}>Sujet</label>
                    <select className="input-swap cursor-pointer">
                      <option value="general">Question générale</option>
                      <option value="support">Support technique</option>
                      <option value="billing">Facturation</option>
                      <option value="business">Entreprise / B2B</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--ink)' }}>Message</label>
                    <textarea required rows={5} className="input-swap resize-y" placeholder="Comment pouvons-nous vous aider ?" />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-swap w-full py-4 text-lg disabled:opacity-60">
                    {isSubmitting
                      ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>◌</motion.span> Envoi en cours…</>
                      : <><Send className="w-5 h-5" /> Envoyer le message</>}
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

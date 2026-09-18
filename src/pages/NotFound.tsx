import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Search, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden section-cream">
      <div className="blob blob-green"  style={{ width: 340, height: 340, top: '-80px', right: '-60px' }} />
      <div className="blob blob-yellow" style={{ width: 280, height: 280, bottom: '-60px', left: '-40px', animationDelay: '-5s' }} />
      <div className="blob blob-red"    style={{ width: 240, height: 240, top: '40%', left: '60%', animationDelay: '-9s' }} />
      <div className="dot-grid absolute inset-0 opacity-30" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg relative z-10">

        {/* 404 — chaque chiffre dans une bulle de couleur */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[
            { d: '4', c: '#149352', r: -6 },
            { d: '0', c: '#FFC72C', r: 4 },
            { d: '4', c: '#E23744', r: -3 },
          ].map((n, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: n.r * 6 }}
              animate={{ scale: 1, rotate: n.r }}
              transition={{ delay: 0.15 + i * 0.14, type: 'spring', stiffness: 220, damping: 13 }}
              whileHover={{ rotate: 0, scale: 1.15, y: -8 }}
              className="font-heading font-black text-7xl sm:text-8xl w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center rounded-[38% 62% 55% 45% / 48% 42% 58% 52%] select-none cursor-default"
              style={{ background: n.c, color: '#04180F', boxShadow: `0 14px 34px -12px ${n.c}88` }}>
              {n.d}
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}>
          <h1 className="text-3xl font-heading font-extrabold mb-3" style={{ color: 'var(--ink)' }}>Page introuvable</h1>
          <p className="text-lg font-medium mb-10" style={{ color: 'var(--ink-soft)' }}>
            Cette page n'existe pas ou a été déplacée.<br />
            Revenez sur le droit chemin.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link to="/" className="btn-swap px-7 py-3.5">
                <Home className="w-5 h-5" /> Accueil
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04, rotate: 0.5 }} whileTap={{ scale: 0.96 }}>
              <Link to="/courses" className="btn-outline-swap px-7 py-3.5">
                <Search className="w-5 h-5" /> Voir les formations
              </Link>
            </motion.div>
          </div>

          <motion.p
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-12 text-xs font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2"
            style={{ color: 'var(--ink-soft)' }}>
            <Compass className="w-3.5 h-3.5" style={{ color: '#149352' }} />
            Swap — apprenez aujourd'hui, brillez demain
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

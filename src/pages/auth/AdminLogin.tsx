import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import Logo from '../../components/Logo';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Identifiants incorrects');
        return;
      }

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_username', data.username);
      localStorage.setItem('admin_expires_at', data.expires_at);
      navigate('/admin');
    } catch {
      setError('Erreur de connexion. Vérifiez votre réseau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen section-vert flex items-center justify-center px-4 relative overflow-hidden">
      {/* Décor */}
      <div className="dot-grid-light absolute inset-0" aria-hidden />
      <div className="blob blob-yellow" style={{ width: 380, height: 380, top: '-110px', right: '-90px' }} />
      <div className="blob blob-green"  style={{ width: 340, height: 340, bottom: '-100px', left: '-80px', animationDelay: '-6s' }} />
      <div className="spin-ring absolute -top-24 -left-24 w-80 h-80" aria-hidden />
      <div className="spin-ring absolute -bottom-28 -right-28 w-96 h-96" style={{ animationDirection: 'reverse', animationDuration: '36s' }} aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10">

        {/* Logo / Titre */}
        <div className="text-center mb-9">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: -4 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }}
            className="inline-block mb-6">
            <div className="w-16 h-16 flex items-center justify-center font-heading font-black text-3xl"
              style={{
                background: 'var(--tri-gradient)',
                color: '#04180F',
                borderRadius: '38% 62% 55% 45% / 48% 42% 58% 52%',
                boxShadow: '0 18px 40px -14px rgba(255,199,44,.5)',
                animation: 'gradientPan 7s ease infinite',
              }}>
              S
            </div>
          </motion.div>
          <h1 className="text-3xl font-heading font-extrabold text-white">Espace Formateur</h1>
          <p className="font-medium mt-2" style={{ color: 'var(--text-muted)' }}>
            Connectez-vous pour accéder au cockpit
          </p>
        </div>

        {/* Carte */}
        <motion.div
          whileHover={{ y: -3 }}
          className="card-pop p-8">
          <div className="tri-bar absolute top-0 inset-x-0 !h-[5px] rounded-t-[2rem] rounded-b-none" />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identifiant */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.15em] block" style={{ color: 'var(--ink)' }}>Identifiant</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="admin"
                className="input-swap"
              />
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.15em] block" style={{ color: 'var(--ink)' }}>Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="input-swap pr-12"
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--green-700)' }}
                >
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm rounded-xl px-4 py-3 font-bold"
                style={{ background: '#FDE3E5', border: '1.5px solid rgba(226,55,68,.35)', color: '#E23744' }}
              >
                {error}
              </motion.p>
            )}

            {/* Bouton */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="btn-swap w-full py-4 disabled:opacity-60 mt-2"
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Connexion…</>
                : <>Se connecter <ArrowRight className="w-5 h-5" /></>}
            </motion.button>

            <p className="text-xs text-center font-medium flex items-center justify-center gap-1.5" style={{ color: 'var(--ink-soft)' }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#149352' }} />
              Connexion chiffrée et sécurisée
            </p>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8">
          <Logo height={34} light />
        </motion.p>
      </motion.div>
    </div>
  );
}

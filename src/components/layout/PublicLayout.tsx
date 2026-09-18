import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Chatbot from '../Chatbot';
import Logo from '../Logo';
import { useSettings } from '../SettingsProvider';

const navLinks = [
  { name: 'Accueil',        path: '/' },
  { name: 'Formations',     path: '/courses' },
  { name: 'À Propos',       path: '/about' },
  { name: 'Contact',        path: '/contact' },
];

export default function PublicLayout() {
  const location = useLocation();
  const { platformName } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress } = useScroll();
  const progressBar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col section-cream">

      {/* Barre de progression de lecture (tricolore) */}
      <motion.div
        className="fixed top-0 left-0 h-[4px] z-[60] tri-bar"
        style={{ width: progressBar }}
        aria-hidden
      />

      {/* ══ NAVBAR — pilule flottante ═══════════════════════ */}
      <header className="fixed top-4 inset-x-0 z-50 px-4">
        <motion.nav
          initial={{ y: -70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl mx-auto flex items-center justify-between gap-4 rounded-full px-4 sm:px-5 py-2.5 transition-all duration-300"
          style={{
            background: scrolled ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid var(--border)',
            boxShadow: scrolled
              ? '0 14px 38px -16px rgba(6,40,23,.35), 0 3px 0 var(--green-100)'
              : '0 6px 24px -14px rgba(6,40,23,.25)',
          }}>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo height={40} />
          </Link>

          {/* Desktop nav — pilules */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="nav-pill"
                  data-active={isActive}>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2">
            <motion.a
              href="tel:+224000000000"
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-10 h-10 rounded-full"
              style={{
                background: 'var(--green-100)',
                border: '1.5px solid rgba(20,147,82,.3)',
                color: 'var(--green-700)',
              }}
              aria-label="Nous appeler">
              <Phone className="w-4 h-4" />
            </motion.a>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link to="/courses" className="btn-swap !py-2.5 !px-5 text-sm">
                Commencer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Hamburger */}
          <motion.button
            onClick={() => setMobileOpen(o => !o)}
            whileTap={{ scale: 0.88, rotate: 8 }}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-full"
            style={{ background: 'var(--green-100)', color: 'var(--green-800)' }}
            aria-label="Menu">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? 'x' : 'menu'}
                initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                transition={{ duration: 0.16 }}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </motion.nav>
      </header>

      {/* Mobile drawer — panneau plein écran tricolore */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ clipPath: 'circle(0% at 92% 6%)' }}
            animate={{ clipPath: 'circle(150% at 92% 6%)' }}
            exit={{ clipPath: 'circle(0% at 92% 6%)' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 md:hidden section-vert flex flex-col justify-center px-10">
            <div className="dot-grid-light absolute inset-0" aria-hidden />
            <nav className="relative z-10 space-y-2">
              {navLinks.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + i * 0.07 }}>
                  <Link
                    to={item.path}
                    className="block font-heading font-extrabold text-4xl py-2"
                    style={{ color: location.pathname === item.path ? 'var(--yellow-500)' : '#F6FFF9' }}>
                    <span className="text-sm align-super mr-2" style={{ color: 'var(--green-400)' }}>0{i + 1}</span>
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-8">
                <a href="tel:+224000000000" className="btn-outline-light">
                  <Phone className="w-4 h-4" /> +224 000 000 000
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Chatbot />

      {/* ══ FOOTER — vert profond ══════════════════════════ */}
      <footer className="section-vert">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">

          {/* Marquee tricolore */}
          <div className="marquee mb-12 py-3" style={{ borderTop: '1px solid rgba(255,255,255,.1)', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
            <div className="marquee-track">
              {[...Array(2)].flatMap((_, k) =>
                ['Apprendre', 'Progresser', 'Se certifier', 'Exceller', 'Swap'].map((w, i) => (
                  <span key={`${k}-${i}`} className="font-heading font-extrabold text-lg flex items-center gap-12" style={{ color: i % 3 === 0 ? 'var(--green-400)' : i % 3 === 1 ? 'var(--yellow-500)' : 'var(--red-500)' }}>
                    {w}
                    <Sparkles className="w-4 h-4 opacity-40" />
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12"
            style={{ borderBottom: '1px solid rgba(255,255,255,.1)' }}>

            {/* Brand */}
            <div className="md:col-span-2">
              <Logo height={46} light />
              <p className="text-sm leading-relaxed max-w-xs mt-5" style={{ color: 'var(--text-muted)' }}>
                La plateforme qui vous fait passer au niveau supérieur :
                formations en ligne, live et certificats.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <a href="tel:+224000000000"
                  className="flex items-center gap-2 text-sm font-bold transition-colors hover:text-[var(--yellow-500)]"
                  style={{ color: 'var(--green-400)' }}>
                  <Phone className="w-4 h-4" /> +224 000 000 000
                </a>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--yellow-500)' }}>Navigation</h4>
              <ul className="space-y-3">
                {navLinks.map(link => (
                  <li key={link.name}>
                    <Link to={link.path}
                      className="text-sm font-medium transition-all hover:translate-x-1 inline-block"
                      style={{ color: 'var(--text-muted)' }}>
                      {link.name} <span style={{ color: 'var(--green-400)' }}>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--yellow-500)' }}>Contact</h4>
              <ul className="space-y-3">
                <li><a href="tel:+224000000000" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>+224 000 000 000</a></li>
                <li><a href="mailto:contact@exemple.com" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>contact@exemple.com</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row md:justify-between items-center gap-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} {platformName}. Tous droits réservés.
            </p>
            <div className="tri-bar w-32" aria-hidden />
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from '../Chatbot';
import Logo from '../Logo';
import { useSettings } from '../SettingsProvider';

const navLinks = [
  { name: 'Accueil',        path: '/' },
  { name: 'Nos Formations', path: '/courses' },
  { name: 'À Propos',       path: '/about' },
  { name: 'Contact',        path: '/contact' },
];

export default function PublicLayout() {
  const location = useLocation();
  const { platformName } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#071529' }}>

      {/* ══ NAVBAR ══════════════════════════════════ */}
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(6, 17, 31, 0.97)' /* --dark-base */
            : 'rgba(6, 17, 31, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled
            ? '1px solid var(--gold-border)'
            : '1px solid var(--dark-border)',
          boxShadow: scrolled ? '0 8px 40px rgba(6, 17, 31, 0.5)' : 'none',
        }}>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                <Logo height={44} />
              </motion.div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="nav-link"
                    style={{ color: isActive ? 'var(--gold)' : 'var(--text-muted)' }}
                    data-active={isActive}>
                    {item.name}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-accent"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <a href="tel:+224000000000"
                className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
                style={{ color: 'var(--gold)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-bright)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--gold)')}>
                <Phone className="w-4 h-4" />
                Nous appeler
              </a>
            </div>

            {/* Hamburger */}
            <motion.button
              onClick={() => setMobileOpen(o => !o)}
              whileTap={{ scale: 0.9 }}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              aria-label="Menu">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? 'x' : 'menu'}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}>
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden"
              style={{ borderTop: '1px solid rgba(220,179,47,0.15)', background: 'rgba(7,21,41,0.98)' }}>
              <div className="px-4 py-5 space-y-1">
                {navLinks.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}>
                    <Link
                      to={item.path}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all"
                      style={location.pathname === item.path
                        ? { background: 'var(--gold-muted)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }
                        : { color: 'var(--text-bright)' }}>
                      {item.name}
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-4 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <a href="tel:+224000000000" className="btn-outline-white text-sm py-3 text-center">
                    <Phone className="w-4 h-4" /> Nous appeler
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page content */}
      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      <Chatbot />

      {/* ══ FOOTER ════════════════════════════════════ */}
      <footer style={{ background: 'var(--dark-base)', borderTop: '1px solid var(--gold-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12"
            style={{ borderBottom: '1px solid var(--dark-divider)' }}>

            {/* Brand */}
            <div className="md:col-span-2">
              <Logo height={48} />
              <p className="text-sm leading-relaxed max-w-xs mt-5"
                style={{ color: 'var(--text-muted)' }}>
                Des formations de qualité pour développer vos compétences
                et faire grandir votre carrière.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <a href="tel:+224000000000"
                  className="flex items-center gap-2 text-sm font-medium transition-colors"
                  style={{ color: 'var(--gold)' }}>
                  <Phone className="w-4 h-4" /> +224 000 000 000
                </a>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-5"
                style={{ color: 'var(--gold)' }}>Navigation</h4>
              <ul className="space-y-3">
                {navLinks.map(link => (
                  <li key={link.name}>
                    <Link to={link.path}
                      className="text-sm font-medium transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-bright)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-5"
                style={{ color: 'var(--gold)' }}>Contact</h4>
              <ul className="space-y-3">
                <li><a href="tel:+224000000000"
                  className="text-sm transition-colors"
                  style={{ color: 'var(--text-muted)' }}>+224 000 000 000</a></li>
                <li><a href="mailto:contact@exemple.com"
                  className="text-sm transition-colors"
                  style={{ color: 'var(--text-muted)' }}>contact@exemple.com</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row md:justify-between items-center gap-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} {platformName}. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 rounded-full bg-accent" />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
                {platformName}
              </span>
              <div className="w-8 h-0.5 rounded-full bg-accent" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

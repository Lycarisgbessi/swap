import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Book, Users, Settings, LogOut, Menu, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../Logo';
import { adminLogout } from '../../services/api';

const navItems = [
  { name: "Vue d'ensemble", href: '/admin',          icon: LayoutDashboard },
  { name: 'Formations',      href: '/admin/courses',  icon: Book },
  { name: 'Apprenants & CRM', href: '/admin/students', icon: Users },
  { name: 'Paramètres',     href: '/admin/settings', icon: Settings },
];

/* ── Sidebar content (shared desktop + mobile) ── */
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const navigate  = useNavigate();

  const username = localStorage.getItem('admin_username') ?? 'Formateur';
  const initials = username.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="h-20 flex items-center px-6 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" className="group" onClick={onClose}>
          <Logo height={36} light />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Section label */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--green-400)' }}>
          Cockpit
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 pb-4 space-y-1.5">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/admin' && location.pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i }}>
              <Link
                to={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 relative group"
                style={isActive
                  ? { background: 'var(--yellow-500)', color: 'var(--green-deep)', boxShadow: '0 4px 0 rgba(255,199,44,.35)' }
                  : { color: 'var(--text-muted)' }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLElement).style.color = '#F6FFF9';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                  }
                }}>
                <Icon className="flex-shrink-0" style={{ width: '1.1rem', height: '1.1rem' }} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.span layoutId="nav-dot" className="ml-auto w-2 h-2 rounded-full bg-current" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
            style={{ background: 'var(--tri-gradient)', color: '#04180F' }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{username}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Formateur</p>
          </div>
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:rotate-6"
            style={{ background: 'rgba(226,55,68,0.14)', color: 'var(--red-500)' }}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const username = localStorage.getItem('admin_username') ?? 'Formateur';
  const initials = username.slice(0, 2).toUpperCase();

  // Page title from route
  const pageTitle = navItems.find(n =>
    n.href === location.pathname || (n.href !== '/admin' && location.pathname.startsWith(n.href))
  )?.name ?? "Vue d'ensemble";

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--green-deep)' }}>

      {/* ── Desktop sidebar ── */}
      <aside className="w-64 hidden md:flex flex-col flex-shrink-0"
        style={{
          background: 'var(--green-950)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay + drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(4,24,15,0.75)', backdropFilter: 'blur(4px)' }}
            />
            <motion.aside
              initial={{ x: -290 }} animate={{ x: 0 }} exit={{ x: -290 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col md:hidden"
              style={{ background: 'var(--green-950)', borderRight: '1px solid rgba(255,255,255,0.09)' }}>
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0"
        style={{ background: 'radial-gradient(900px 400px at 90% -5%, rgba(255,199,44,.06), transparent 60%), var(--green-deep)' }}>

        {/* Top bar */}
        <header className="h-20 flex items-center justify-between px-6 flex-shrink-0"
          style={{
            background: 'rgba(6,40,23,0.9)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(10px)',
          }}>

          {/* Mobile hamburger */}
          <motion.button
            onClick={() => setMobileOpen(true)}
            whileTap={{ scale: 0.85, rotate: 6 }}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full mr-3"
            style={{ background: 'rgba(255,255,255,0.07)', color: '#F6FFF9' }}>
            <Menu className="w-5 h-5" />
          </motion.button>

          {/* Page title */}
          <div className="hidden md:flex items-center gap-3">
            <div className="tri-bar-v h-6" />
            <h1 className="text-xl font-heading font-extrabold text-white">{pageTitle}</h1>
          </div>
          <div className="md:hidden flex-1 font-heading font-bold text-white truncate">{pageTitle}</div>

          {/* Right: profile chip */}
          <div className="flex items-center gap-3">
            <Link to="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full transition-all hover:-translate-y-0.5"
              style={{ color: 'var(--green-400)', background: 'rgba(34,197,94,0.09)', border: '1px solid rgba(34,197,94,0.25)' }}>
              Site public <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center gap-2.5 py-1.5 px-3 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: 'var(--tri-gradient)', color: '#04180F' }}>
                {initials}
              </div>
              <span className="text-sm font-bold text-white hidden sm:block">{username}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 md:p-10 pb-20 max-w-screen-xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 14, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}>
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

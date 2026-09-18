import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Book, Users, Settings, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../Logo';

const navItems = [
  { name: "Vue d'ensemble", href: '/admin',          icon: LayoutDashboard },
  { name: 'Formations',      href: '/admin/courses',  icon: Book },
  { name: 'Inscrits & CRM', href: '/admin/students', icon: Users },
  { name: 'Paramètres',     href: '/admin/settings', icon: Settings },
];

/* ── Sidebar content (shared desktop + mobile) ── */
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const navigate  = useNavigate();

  const username = localStorage.getItem('admin_username') ?? 'Formateur';
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="h-20 flex items-center px-6 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link to="/" className="flex items-center gap-3 group" onClick={onClose}>
          <Logo height={36} />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg md:hidden"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(248,250,252,0.6)' }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Section label */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'rgba(220,179,47,0.6)' }}>
          Navigation
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 pb-4 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/admin' && location.pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative group"
              style={isActive
                ? { background: 'rgba(220,179,47,0.12)', color: '#dcb32f', border: '1px solid rgba(220,179,47,0.2)' }
                : { color: 'rgba(248,250,252,0.5)', border: '1px solid transparent' }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.color = '#f8fafc';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(248,250,252,0.5)';
                }
              }}>
              {/* Active left bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bar"
                  className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                  style={{ background: '#dcb32f' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: '1.1rem', height: '1.1rem' }} />
              <span>{item.name}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" style={{ opacity: 0.6 }} />}
            </Link>
          );
        })}
      </nav>

      {/* User profile block */}
      <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #dcb32f, #b8870f)', color: '#071529' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{username}</p>
            <p className="text-xs" style={{ color: 'rgba(248,250,252,0.4)' }}>Formateur</p>
          </div>
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
    <div className="min-h-screen flex" style={{ background: '#071529' }}>

      {/* ── Desktop sidebar ── */}
      <aside className="w-64 hidden md:flex flex-col flex-shrink-0"
        style={{
          background: '#040d1c',
          borderRight: '1px solid rgba(255,255,255,0.06)',
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
              style={{ background: 'rgba(7,21,41,0.7)', backdropFilter: 'blur(4px)' }}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col md:hidden"
              style={{ background: '#040d1c', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="h-20 flex items-center justify-between px-6 flex-shrink-0"
          style={{
            background: 'rgba(4,13,28,0.95)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(8px)',
          }}>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl mr-3"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-1.5 h-6 rounded-full" style={{ background: '#dcb32f' }} />
            <h1 className="text-xl font-bold text-white">{pageTitle}</h1>
          </div>
          <div className="md:hidden flex-1" />

          {/* Right: profile chip */}
          <div className="flex items-center gap-3">
            <Link to="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              style={{ color: 'rgba(220,179,47,0.7)', background: 'rgba(220,179,47,0.06)', border: '1px solid rgba(220,179,47,0.15)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#dcb32f')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(220,179,47,0.7)')}>
              ← Site public
            </Link>
            <div className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #dcb32f, #b8870f)', color: '#071529' }}>
                {initials}
              </div>
              <span className="text-sm font-semibold text-white hidden sm:block">{username}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#0a1a35' }}>
          <div className="p-6 md:p-10 pb-20 max-w-screen-xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}>
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

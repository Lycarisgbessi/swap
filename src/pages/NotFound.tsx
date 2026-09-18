import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-50">
      <div className="mesh-orb-1 opacity-50" />
      <div className="mesh-orb-3 opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-[9rem] font-heading font-extrabold leading-none text-gradient-learning mb-4"
        >
          404
        </motion.div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Page introuvable</h1>
        <p className="text-slate-600 font-medium text-lg mb-10">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-slate-900 font-bold shadow-md hover:scale-105 transition-transform w-full sm:w-auto">
            <Home className="w-5 h-5" />
            Accueil
          </Link>
          <Link to="/courses"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-sm w-full sm:w-auto">
            <Search className="w-5 h-5" />
            Voir les formations
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, Home, MessageCircle } from 'lucide-react';

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') ?? '';

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--background)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-md p-8 text-center"
      >
        <div
          className="w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}
        >
          <XCircle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-dark-primary mb-3">Paiement annulé</h1>
        <p className="text-dark-secondary font-medium text-sm mb-8">
          Vous avez annulé le processus de paiement.<br />
          Aucun montant n'a été débité de votre compte.
        </p>

        <div className="flex flex-col gap-3">
          {from ? (
            <Link
              to={`/courses/${from}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm btn-gold shadow-md"
            >
              <ArrowLeft className="w-5 h-5" /> Retour à la formation
            </Link>
          ) : (
            <Link
              to="/courses"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm btn-gold shadow-md"
            >
              <Home className="w-5 h-5" /> Voir toutes les formations
            </Link>
          )}

          <a
            href="https://wa.me/224000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-white border border-[var(--border)] text-dark-primary hover:bg-[rgba(6,17,31,0.03)] shadow-sm transition-colors"
          >
            <MessageCircle className="w-5 h-5" /> Besoin d'aide ? Contactez-nous
          </a>
        </div>

        <p className="mt-6 text-xs text-dark-secondary font-medium">
          Si vous rencontrez un problème, contactez notre support via WhatsApp.
        </p>
      </motion.div>
    </div>
  );
}

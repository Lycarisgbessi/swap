import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, Loader2, Copy, Check,
  AlertTriangle, MessageCircle, ArrowLeft, Home, PlayCircle
} from 'lucide-react';
import { getPaymentStatus } from '../../services/api';

type PaymentStatus = 'loading' | 'success' | 'failed' | 'pending' | 'error';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  let transactionId  = searchParams.get('transactionId') ?? searchParams.get('ref') ?? '';
  transactionId = transactionId.split(':')[0]; // Djomy rajoute parfois un suffixe :1
  const urlStatus      = searchParams.get('status') ?? '';   // hint from Djomy redirect

  const [status,     setStatus]     = useState<PaymentStatus>('loading');
  const [accessUrl,  setAccessUrl]  = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [copied,     setCopied]     = useState(false);
  const [errMsg,     setErrMsg]     = useState('');
  const [debugMsg,   setDebugMsg]   = useState('');

  useEffect(() => {
    if (!transactionId) {
      setStatus('error');
      setErrMsg('Identifiant de transaction manquant.');
      return;
    }

    // Si Djomy nous indique déjà un échec dans l'URL, on vérifie quand même côté serveur
    // mais on peut afficher un état intermédiaire rapide
    if (urlStatus === 'CANCELLED' || urlStatus === 'FAILED') {
      setStatus('failed');
      setErrMsg('Le paiement a été annulé ou a échoué.');
    }

    let attempts = 0;
    const maxAttempts = 120;  // Polling max 120 × 5s = 10 minutes (au lieu de 18 secondes)
    const interval = 5000;

    const checkStatus = async () => {
      attempts++;
      try {
        const res = await getPaymentStatus(transactionId);
        
        if (res.status === 'PENDING' && (res as any).djomy_debug) {
            console.log("Djomy Debug:", (res as any).djomy_debug);
            setDebugMsg(JSON.stringify((res as any).djomy_debug));
        }

        if (res.status === 'SUCCESS') {
          setAccessUrl(res.access_url ?? '');
          setCourseTitle(res.course_title ?? '');
          setStatus('success');
          return true; // stop polling
        } else if (res.status === 'FAILED' || res.status === 'CANCELLED' || res.status === 'EXPIRED') {
          setStatus('failed');
          setErrMsg(res.message ?? 'Le paiement a échoué.');
          return true;
        } else if (attempts >= maxAttempts) {
          // Trop long, on arrête le polling
          setStatus('error');
          setErrMsg("Délai d'attente dépassé. Si vous avez été débité, contactez le formateur.");
          return true;
        } else {
          // Toujours PENDING, on affiche l'état d'attente à l'utilisateur
          if (status !== 'pending') setStatus('pending');
          return false; // continue polling
        }
      } catch (err: any) {
        if (attempts >= maxAttempts) {
          setStatus('error');
          setErrMsg(err.message ?? 'Impossible de vérifier le paiement.');
          return true;
        }
        return false;
      }
    };

    // Premier appel immédiat
    checkStatus().then(done => {
      if (done) return;
      const timer = setInterval(async () => {
        const done = await checkStatus();
        if (done) clearInterval(timer);
      }, interval);
      return () => clearInterval(timer);
    });
  }, [transactionId, urlStatus]);

  const copyLink = () => {
    navigator.clipboard.writeText(accessUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(
      `Bonjour ! Je viens de finaliser mon paiement pour "${courseTitle}". Voici mon lien d'accès : ${accessUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  useEffect(() => {
    if (status === 'success' && accessUrl) {
      const timer = setTimeout(() => {
        window.location.href = accessUrl;
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status, accessUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--background)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-md p-8"
      >

        {/* ── CHARGEMENT ── */}
        {status === 'loading' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto mb-6 animate-pulse"
              style={{ background: 'var(--gold-muted)', borderColor: 'var(--gold)' }}>
              <Loader2 className="w-10 h-10 text-dark-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-dark-primary mb-3">Vérification du paiement…</h1>
            <p className="text-dark-secondary font-medium text-sm">
              Nous confirmons votre paiement avec Djomy.<br />Cela peut prendre quelques secondes.
            </p>
          </div>
        )}

        {/* ── SUCCÈS ── */}
        {status === 'success' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto mb-6"
              style={{ background: 'var(--gold-muted)', borderColor: 'var(--gold)' }}>
              <CheckCircle className="w-10 h-10 text-dark-primary" />
            </div>
            <h1 className="text-2xl font-bold text-dark-primary mb-2">Paiement confirmé !</h1>
            {courseTitle && (
              <p className="text-dark-secondary font-medium text-sm mb-6">
                Vous avez accès à : <strong className="text-dark-primary">{courseTitle}</strong>
              </p>
            )}

            <div className="border rounded-xl p-4 mb-5 text-left flex items-start gap-3"
              style={{ background: 'var(--gold-muted)', borderColor: 'var(--gold)' }}>
              <Loader2 className="w-5 h-5 text-dark-primary shrink-0 mt-0.5 animate-spin" />
              <p className="text-dark-primary text-sm font-medium">
                Redirection automatique vers votre espace de formation en cours...
              </p>
            </div>

            <div className="bg-[rgba(6,17,31,0.03)] border border-[var(--border)] rounded-2xl p-5 mb-6 text-left shadow-inner">
              <p className="text-xs text-dark-secondary mb-2 font-bold uppercase tracking-wider">Lien d'accès personnel</p>
              <p className="text-sm font-mono break-all font-semibold" style={{ color: 'var(--gold)' }}>{accessUrl}</p>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              <a
                href={accessUrl}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white shadow-md bg-green-600 hover:bg-green-700 transition-colors"
              >
                <PlayCircle className="w-5 h-5" /> Suivre ma formation maintenant
              </a>

              <button
                onClick={copyLink}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all border ${
                  copied
                    ? 'bg-white border-green-500 text-green-600'
                    : 'bg-white border-[var(--border)] text-dark-primary hover:bg-[rgba(6,17,31,0.03)] shadow-sm'
                }`}
              >
                {copied ? <><Check className="w-5 h-5" /> Lien copié</> : <><Copy className="w-5 h-5 text-dark-secondary" /> Copier mon lien</>}
              </button>

              <button
                onClick={openWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm btn-gold shadow-md"
              >
                <MessageCircle className="w-5 h-5" /> Contacter le formateur
              </button>
            </div>

            <Link to="/courses" className="text-sm font-semibold text-dark-secondary hover:text-dark-primary transition-colors flex items-center justify-center gap-1 mt-2">
              <Home className="w-4 h-4" /> Voir toutes les formations
            </Link>
          </div>
        )}

        {/* ── ÉCHEC ── */}
        {status === 'failed' && (
          <div className="text-center py-4">
            <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}>
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-dark-primary mb-3">Paiement échoué</h1>
            <p className="text-dark-secondary font-medium text-sm mb-8">
              {errMsg || 'Votre paiement n\'a pas pu être traité. Aucun montant n\'a été débité.'}
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/courses"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm btn-gold shadow-md">
                <ArrowLeft className="w-5 h-5" /> Retour aux formations
              </Link>
            </div>
          </div>
        )}

        {/* ── EN ATTENTE (paiement mobile en cours) ── */}
        {status === 'pending' && (
          <div className="text-center py-4">
            <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto mb-6 animate-pulse"
              style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.4)' }}>
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-dark-primary mb-3">Paiement en attente</h1>
            <p className="text-dark-secondary font-medium text-sm mb-6">
              Votre paiement est en cours de traitement. Vérifiez votre téléphone pour confirmer via <strong>Orange Money</strong> ou <strong>MTN MoMo</strong>.
            </p>
            <div className="p-4 rounded-xl mb-6 text-sm font-medium"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'rgba(245,158,11,0.9)' }}>
              Ne fermez pas cette page. Une fois le paiement validé sur votre téléphone, votre lien d'accès s'affichera automatiquement ici.
            </div>
            <Link to="/courses"
              className="text-sm font-semibold text-dark-secondary hover:text-dark-primary transition-colors flex items-center justify-center gap-1">
              <Home className="w-4 h-4" /> Retour aux formations
            </Link>

            {debugMsg && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left overflow-hidden">
                <p className="text-xs text-red-600 font-bold mb-1">Diagnostic API Djomy (Pour le support técnica):</p>
                <p className="text-[10px] text-red-500 font-mono break-all">{debugMsg}</p>
              </div>
            )}
          </div>
        )}

        {/* ── ERREUR TECHNIQUE ── */}
        {status === 'error' && (
          <div className="text-center py-4">
            <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}>
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-dark-primary mb-3">Erreur de vérification</h1>
            <p className="text-dark-secondary font-medium text-sm mb-6">
              {errMsg || 'Impossible de vérifier votre paiement. Contactez le support si le montant a été débité.'}
            </p>
            <Link to="/courses"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm btn-gold shadow-md">
              <ArrowLeft className="w-5 h-5" /> Retour aux formations
            </Link>
          </div>
        )}

      </motion.div>
    </div>
  );
}

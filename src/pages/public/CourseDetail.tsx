import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getConvertedPrices } from '../../utils/currency';
import {
  Star, Users, Clock, Award, ChevronDown, ChevronRight,
  PlayCircle, FileText, Headphones, BookOpen, X, Loader2,
  Copy, Check, AlertTriangle, MessageCircle, ExternalLink, Globe,
  Info, CreditCard
} from 'lucide-react';
import { getCourse, initPayment } from '../../services/api';
import { useSettings } from '../../components/SettingsProvider';

interface Lesson  { id: string; title: string; type: string; duration: string; is_free: number; content: string; description: string; }
interface Module  { id: string; title: string; description: string; lessons: Lesson[]; }
interface Course  {
  id: string; title: string; description: string; price: string;
  type: string; status: string; category: string; image_url: string;
  external_link: string; visits: number; likes: number; created_at: string;
  curriculum: Module[]; paidSignups: number; freeSignups: number; revenue: string;
  format?: string; duration?: string; has_certificate?: string;
  objectives?: string; prerequisites?: string;
}

const lessonIcon = (type: string) => ({
  video: <PlayCircle className="w-4 h-4 text-primary" />,
  pdf:   <FileText   className="w-4 h-4 text-amber-500" />,
  audio: <Headphones className="w-4 h-4 text-emerald-600" />,
})[type] ?? <BookOpen className="w-4 h-4 text-slate-500" />;

// Codes pays Djomy disponibles
const COUNTRY_CODES = [
  { code: 'GN', label: '🇬🇳 Guinée' },
  { code: 'CI', label: '🇨🇮 Côte d\'Ivoire' },
  { code: 'SN', label: '🇸🇳 Sénégal' },
  { code: 'ML', label: '🇲🇱 Mali' },
  { code: 'BF', label: '🇧🇫 Burkina Faso' },
  { code: 'TG', label: '🇹🇬 Togo' },
  { code: 'BJ', label: '🇧🇯 Bénin' },
  { code: 'CM', label: '🇨🇲 Cameroun' },
];

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const settings = useSettings();
  const [course, setCourse]     = useState<Course | null>(null);
  const [loading, setLoading]   = useState(true);
  const [openMods, setOpenMods] = useState<Record<string, boolean>>({});

  // Modal checkout
  const [modalOpen, setModalOpen]   = useState(false);
  const [enrollStep, setEnrollStep] = useState<'registration' | 'payment' | 'redirecting' | 'success'>('registration');
  const [form, setForm]             = useState({ firstName: '', lastName: '', email: '', phone: '', country_code: 'GN' });
  const [enrolling, setEnrolling]   = useState(false);
  const [enrollError, setEnrollError] = useState('');

  // Résultat inscription
  const [accessUrl, setAccessUrl]   = useState('');
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    if (!id) return;
    getCourse(id)
      .then(d => {
        setCourse(d);
        if (d.curriculum?.[0]) setOpenMods({ [d.curriculum[0].id]: true });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleRegistrationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setEnrolling(true);
    setEnrollError('');
    try {
      const { enrollStudent } = await import('../../services/api');
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      await enrollStudent({
        name: fullName,
        email: form.email,
        phone: form.phone,
        course_id: course.id,
        price: course.price,
        status: 'prospect',
        country_code: form.country_code
      });
      // Prospect saved. Now move to payment step.
      setEnrollStep('payment');
    } catch (err: any) {
      setEnrollError(err.message ?? "Erreur lors de l'enregistrement");
    } finally {
      setEnrolling(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!course) return;
    setEnrolling(true);
    setEnrollError('');
    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const res = await initPayment({
        name: fullName,
        email: form.email,
        phone: form.phone,
        course_id: course.id,
        country_code: form.country_code,
      });

      if (res.free || res.already_paid) {
        setAccessUrl(res.access_url ?? '');
        setEnrollStep('success');
        setTimeout(() => {
          window.location.href = res.access_url ?? '';
        }, 4000);
        return;
      }

      if (res.redirect_url) {
        setEnrollStep('redirecting');
        setTimeout(() => {
          window.location.href = res.redirect_url!;
        }, 1200);
        return;
      }

      throw new Error('Réponse inattendue du serveur.');
    } catch (err: any) {
      setEnrollError(err.message ?? "Erreur lors de l'inscription");
    } finally {
      setEnrolling(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(accessUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(
      `Bonjour ! Je viens de m'inscrire à la formation "${course?.title}". Voici mon lien d'accès : ${accessUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-dark-primary animate-spin" />
    </div>
  );

  if (!course) return (
    <div className="min-h-screen bg-white flex items-center justify-center flex-col gap-4">
      <p className="text-dark-secondary text-xl font-medium">Formation introuvable.</p>
      <Link to="/courses" className="text-dark-primary font-semibold hover:underline">← Voir toutes les formations</Link>
    </div>
  );

  const totalLessons = course.curriculum?.reduce((a, m) => a + m.lessons.length, 0) ?? 0;

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* ── HEADER HERO ── */}
      <section className="pt-32 pb-16 section-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="badge-gold mb-6">
              {course.category}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white mb-6 leading-tight tracking-tight">
              {course.title}
            </h1>
            <p className="text-xl mb-8 leading-relaxed font-light" style={{ color: 'var(--text-muted)' }}>
              {course.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium" style={{ color: 'var(--text-bright)' }}>
              <span className="flex items-center gap-2"><Users className="w-5 h-5" style={{ color: 'var(--gold)' }} />{course.paidSignups} inscrits</span>
              <span className="flex items-center gap-2"><BookOpen className="w-5 h-5" style={{ color: 'var(--gold)' }} />{totalLessons} leçons</span>
              {course.duration && <span className="flex items-center gap-2"><Clock className="w-5 h-5" style={{ color: 'var(--gold)' }} />{course.duration}</span>}
              <span className="flex items-center gap-2"><Star className="w-5 h-5 fill-current" style={{ color: 'var(--gold)' }} />{course.likes} avis</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT & SIDEBAR ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12 relative items-start">
          
          {/* COLONNE GAUCHE (Contenu) */}
          <div className="lg:w-2/3 space-y-16">
            
            {/* À propos */}
            {course.description && (
              <div>
                <h2 className="text-2xl font-heading font-bold text-dark-primary mb-6 flex items-center gap-3">
                  <Info className="w-6 h-6 text-dark-primary" /> À propos de cette formation
                </h2>
                <div className="prose prose-invert max-w-none text-dark-secondary leading-relaxed">
                  <p className="whitespace-pre-line">{course.description}</p>
                </div>
              </div>
            )}

            {/* Objectifs */}
            {course.objectives && (
              <div>
                <h2 className="text-2xl font-heading font-bold text-dark-primary mb-6 flex items-center gap-3">
                  <Check className="w-6 h-6" style={{ color: 'var(--gold)' }} /> Ce que vous allez apprendre
                </h2>
                <div className="bg-white border border-[var(--border)] p-6 md:p-8 rounded-2xl shadow-sm">
                  <p className="whitespace-pre-line text-dark-secondary leading-relaxed font-medium">{course.objectives}</p>
                </div>
              </div>
            )}

            {/* Prérequis */}
            {course.prerequisites && (
              <div>
                <h2 className="text-2xl font-heading font-bold text-dark-primary mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6" style={{ color: 'var(--gold)' }} /> Prérequis
                </h2>
                <div className="bg-white border border-[var(--gold-border)] p-6 md:p-8 rounded-2xl shadow-sm">
                  <p className="text-dark-secondary whitespace-pre-line leading-relaxed font-medium">{course.prerequisites}</p>
                </div>
              </div>
            )}

            {/* Curriculum */}
            <div>
              <h2 className="text-2xl font-heading font-bold text-dark-primary mb-6 flex items-center gap-3">
                <BookOpen className="w-6 h-6" style={{ color: 'var(--gold)' }} /> Programme de la formation
              </h2>
              <div className="space-y-4">
                {course.curriculum?.map(mod => (
                  <div key={mod.id} className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setOpenMods(p => ({ ...p, [mod.id]: !p[mod.id] }))}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-[rgba(6,17,31,0.03)] transition-colors"
                    >
                      <span className="font-bold text-dark-primary text-lg">{mod.title}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-dark-secondary bg-[rgba(6,17,31,0.05)] px-3 py-1 rounded-full">{mod.lessons.length} leçon{mod.lessons.length > 1 ? 's' : ''}</span>
                        {openMods[mod.id] ? <ChevronDown className="w-5 h-5 text-dark-secondary" /> : <ChevronRight className="w-5 h-5 text-dark-secondary" />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {openMods[mod.id] && (
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                          className="overflow-hidden border-t border-[var(--border)] bg-[rgba(6,17,31,0.02)]"
                        >
                          {mod.lessons.map(l => (
                            <div key={l.id} className="flex items-center gap-4 px-6 py-4 border-b border-[var(--border)] last:border-0 hover:bg-[rgba(6,17,31,0.04)] transition-colors">
                              {lessonIcon(l.type)}
                              <span className="text-dark-secondary font-medium text-sm flex-1">{l.title}</span>
                              {l.is_free ? (
                                <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: 'var(--gold-muted)', color: 'var(--foreground)' }}>Aperçu gratuit</span>
                              ) : (
                                <span className="text-xs text-dark-secondary border border-[var(--border)] px-2 py-1 rounded-md">🔒 Privé</span>
                              )}
                              {l.duration && <span className="text-xs font-semibold text-dark-secondary">{l.duration}</span>}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* COLONNE DROITE (Carte d'inscription Sticky) */}
          <div className="lg:w-1/3 w-full sticky top-24 z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 lg:p-8 border border-[var(--border)] shadow-2xl"
            >
              {course.image_url && (
                <div className="rounded-xl overflow-hidden mb-6 shadow-sm">
                  <img src={course.image_url} alt={course.title} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              
              <div className="text-3xl font-black text-dark-primary mb-3">
                {getConvertedPrices(course.price, settings?.currency)?.mainPrice || course.price}
              </div>
              {getConvertedPrices(course.price, settings?.currency) && (
                <p className="text-xs font-semibold mb-3 tracking-wide uppercase" style={{ color: 'var(--gold)' }}>
                  (soit {getConvertedPrices(course.price, settings?.currency)?.othersString})
                </p>
              )}
              <p className="text-dark-secondary text-sm mb-6 font-medium">Accès complet à vie. Aucun frais caché.</p>

              <button
                onClick={() => { setModalOpen(true); setEnrollStep('registration'); setEnrollError(''); }}
                className="w-full btn-gold py-4 text-lg mb-6 shadow-md font-extrabold"
              >
                {course.type === 'external' ? 'Réserver ma place' : 'S\'inscrire maintenant'}
              </button>

              <div className="space-y-4 text-sm text-dark-secondary font-medium border-t border-[var(--border)] pt-6">
                {course.format && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                    <div>
                      <span className="block text-dark-primary font-bold mb-0.5">Format</span>
                      <span className="capitalize">{course.format}</span>
                    </div>
                  </div>
                )}
                {course.has_certificate && course.has_certificate !== 'Aucun' && (
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                    <div>
                      <span className="block text-dark-primary font-bold mb-0.5">Certification</span>
                      <span>{course.has_certificate} inclus</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3"><Award className="w-5 h-5 shrink-0 text-dark-primary" /><span>Lien d'accès personnel garanti</span></div>
                <div className="flex items-center gap-3"><MessageCircle className="w-5 h-5 shrink-0 text-dark-primary" /><span>Support privé via WhatsApp</span></div>
                {course.type === 'external' && <div className="flex items-center gap-3"><ExternalLink className="w-5 h-5 shrink-0 text-dark-primary" /><span>Session live (lien post-paiement)</span></div>}
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── MODAL INSCRIPTION ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            style={{ background: 'rgba(6,17,31,0.8)' }}
            onClick={e => { if (e.target === e.currentTarget && enrollStep === 'form') setModalOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white border border-[var(--border)] p-8 w-full max-w-md rounded-2xl shadow-2xl"
            >
              {/* Étape 1 : Registration */}
              {enrollStep === 'registration' && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-heading font-bold text-dark-primary">Informations personnelles</h3>
                    <button onClick={() => setModalOpen(false)} className="text-dark-secondary hover:text-dark-primary transition-colors bg-[rgba(6,17,31,0.05)] hover:bg-[rgba(6,17,31,0.08)] rounded-full p-2 border border-[var(--border)]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-dark-primary">Prénom</label>
                        <input
                          required type="text" value={form.firstName}
                          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                          placeholder="Jean"
                          className="w-full bg-white border border-[var(--border)] rounded-xl px-4 py-3 text-dark-primary placeholder-dark-secondary focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent transition-all shadow-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-dark-primary">Nom</label>
                        <input
                          required type="text" value={form.lastName}
                          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                          placeholder="Dupont"
                          className="w-full bg-white border border-[var(--border)] rounded-xl px-4 py-3 text-dark-primary placeholder-dark-secondary focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent transition-all shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-dark-primary">Email</label>
                      <input
                        required type="email" value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="jean.dupont@email.com"
                        className="w-full bg-white border border-[var(--border)] rounded-xl px-4 py-3 text-dark-primary placeholder-dark-secondary focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent transition-all shadow-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-dark-primary">Téléphone (format international)</label>
                      <input
                        required type="tel" value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="00224621000000"
                        className="w-full bg-white border border-[var(--border)] rounded-xl px-4 py-3 text-dark-primary placeholder-dark-secondary focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent transition-all shadow-sm"
                      />
                      <p className="text-xs text-dark-secondary font-medium mt-1">Format international sans + ni espace. Ex : 00224621000000</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-dark-primary">Pays</label>
                      <select
                        value={form.country_code}
                        onChange={e => setForm(f => ({ ...f, country_code: e.target.value }))}
                        className="w-full bg-white border border-[var(--border)] rounded-xl px-4 py-3 text-dark-primary focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent transition-all shadow-sm appearance-none"
                      >
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    {enrollError && (
                      <p className="text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 font-medium">{enrollError}</p>
                    )}

                    <motion.button type="submit" disabled={enrolling}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full btn-gold font-extrabold py-4 text-lg mt-4 shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {enrolling
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...</>
                        : <>Continuer vers le paiement <ChevronRight className="w-5 h-5" /></>}
                    </motion.button>
                  </form>
                </>
              )}

              {/* Étape 2 : Payment */}
              {enrollStep === 'payment' && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-heading font-bold text-dark-primary">Paiement</h3>
                    <button onClick={() => setModalOpen(false)} className="text-dark-secondary hover:text-dark-primary transition-colors bg-[rgba(6,17,31,0.05)] hover:bg-[rgba(6,17,31,0.08)] rounded-full p-2 border border-[var(--border)]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-5 bg-[rgba(6,17,31,0.02)] border border-[var(--border)] rounded-2xl mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-dark-secondary text-sm font-medium mb-1">Total à régler</p>
                      <p className="text-dark-primary font-extrabold text-2xl">{getConvertedPrices(course.price, settings?.currency)?.mainPrice || course.price}</p>
                      {getConvertedPrices(course.price, settings?.currency) && (
                        <p className="text-xs font-semibold mt-1" style={{ color: 'var(--gold)' }}>
                          ~ {getConvertedPrices(course.price, settings?.currency)?.othersString}
                        </p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: 'var(--gold-muted)', borderColor: 'var(--gold)' }}>
                      <CreditCard className="w-6 h-6 text-dark-primary" />
                    </div>
                  </div>

                  {/* Badge méthodes de paiement */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Orange Money', 'MTN MoMo', 'VISA/MasterCard', 'PayCard'].map(m => (
                      <span key={m} className="text-xs px-2.5 py-1 rounded-full font-semibold border" style={{ background: 'var(--gold-muted)', borderColor: 'var(--gold)', color: 'var(--foreground)' }}>{m}</span>
                    ))}
                  </div>

                  {enrollError && (
                    <p className="text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 font-medium mb-4">{enrollError}</p>
                  )}

                  <motion.button onClick={handlePaymentSubmit} disabled={enrolling}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full btn-gold font-extrabold py-4 text-lg shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {enrolling
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Connexion au paiement...</>
                      : <><CreditCard className="w-5 h-5" /> Payer maintenant</>}
                  </motion.button>

                  <p className="text-xs text-center text-dark-secondary font-medium mt-4">
                    🔒 Paiement sécurisé via <strong>Djomy</strong> — Vos données sont protégées
                  </p>
                  <button onClick={() => setEnrollStep('registration')} className="w-full mt-4 text-sm font-semibold text-dark-secondary hover:text-dark-primary transition-colors">
                    ← Revenir aux informations
                  </button>
                </>
              )}

              {/* Étape Redirection : en cours */}
              {enrollStep === 'redirecting' && (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto mb-6 animate-pulse" style={{ background: 'var(--gold-muted)', borderColor: 'var(--gold)' }}>
                    <Loader2 className="w-10 h-10 text-dark-primary animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-dark-primary mb-3">Redirection en cours…</h3>
                  <p className="text-dark-secondary font-medium text-sm">
                    Vous allez être redirigé vers la page de paiement sécurisée <strong>Djomy</strong>.
                    <br />Ne fermez pas cette fenêtre.
                  </p>
                </div>
              )}

              {/* Étape 2 : Succès (formation gratuite ou déjà payée) */}
              {enrollStep === 'success' && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--gold-muted)', borderColor: 'var(--gold)' }}>
                    <Check className="w-10 h-10 text-dark-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-dark-primary mb-3">Inscription confirmée !</h3>
                  
                  <div className="border rounded-xl p-4 mb-6 text-left flex items-start gap-3" style={{ background: 'var(--gold-muted)', borderColor: 'var(--gold)' }}>
                    <Loader2 className="w-5 h-5 text-dark-primary shrink-0 mt-0.5 animate-spin" />
                    <p className="text-dark-primary text-sm font-medium">
                      Redirection automatique vers votre espace de formation en cours...
                    </p>
                  </div>

                  <div className="bg-[rgba(6,17,31,0.03)] border border-[var(--border)] rounded-2xl p-5 mb-6 text-left shadow-inner">
                    <p className="text-xs text-dark-secondary mb-2 font-bold uppercase tracking-wider">Lien d'accès personnel</p>
                    <p className="text-sm font-mono break-all font-semibold" style={{ color: 'var(--gold)' }}>{accessUrl}</p>
                  </div>

                  <div className="flex flex-col gap-3 mb-6">
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

                  <button
                    onClick={() => setModalOpen(false)}
                    className="mt-2 text-sm font-semibold text-dark-secondary hover:text-dark-primary transition-colors"
                  >
                    Fermer cette fenêtre
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

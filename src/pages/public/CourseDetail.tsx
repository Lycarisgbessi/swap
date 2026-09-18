import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getConvertedPrices } from '../../utils/currency';
import {
  Star, Users, Clock, Award, ChevronDown, ChevronRight,
  PlayCircle, FileText, Headphones, BookOpen, X, Loader2,
  Copy, Check, AlertTriangle, MessageCircle, ExternalLink, Globe,
  Info, CreditCard, ShieldCheck
} from 'lucide-react';
import { getCourse, initPayment } from '../../services/api';
import { useSettings } from '../../components/SettingsProvider';
import { Reveal, Magnetic } from '../../components/Reveal';

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
  video: <PlayCircle className="w-4 h-4" style={{ color: '#149352' }} />,
  pdf:   <FileText   className="w-4 h-4" style={{ color: '#b8860b' }} />,
  audio: <Headphones className="w-4 h-4" style={{ color: '#E23744' }} />,
})[type] ?? <BookOpen className="w-4 h-4" style={{ color: 'var(--ink-soft)' }} />;

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
    <div className="min-h-screen section-cream flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-full tri-bar" style={{ width: 64, height: 64, animation: 'spinSlow 1.2s linear infinite', borderRadius: '50%', border: 'none' }} />
        <Loader2 className="w-8 h-8 absolute inset-0 m-auto animate-spin" style={{ color: 'var(--green-700)' }} />
      </div>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen section-cream flex items-center justify-center flex-col gap-4">
      <p className="text-xl font-medium" style={{ color: 'var(--ink-soft)' }}>Formation introuvable.</p>
      <Link to="/courses" className="btn-swap">← Voir toutes les formations</Link>
    </div>
  );

  const totalLessons = course.curriculum?.reduce((a, m) => a + m.lessons.length, 0) ?? 0;

  return (
    <div className="section-cream min-h-screen pb-20">

      {/* ── HEADER HERO — vert profond ── */}
      <section className="section-vert pt-36 pb-20 relative">
        <div className="blob blob-yellow" style={{ width: 400, height: 400, top: '-120px', right: '-100px' }} />
        <div className="blob blob-green"  style={{ width: 340, height: 340, bottom: '-90px', left: '-80px', animationDelay: '-6s' }} />
        <div className="dot-grid-light absolute inset-0" aria-hidden />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: -12, rotate: -3 }}
              animate={{ opacity: 1, y: 0, rotate: -1.5 }}
              className="badge-gold mb-6 inline-flex">
              {course.category}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="display-hero text-4xl md:text-5xl lg:text-6xl text-white mb-6">
              {course.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="text-xl mb-8 leading-relaxed font-medium" style={{ color: 'var(--text-muted)' }}>
              {course.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap items-center gap-3">
              {[
                { icon: Users, label: `${course.paidSignups} inscrits`, c: 'var(--green-400)' },
                { icon: BookOpen, label: `${totalLessons} leçons`, c: 'var(--yellow-500)' },
                { icon: Clock, label: course.duration || 'À votre rythme', c: 'var(--red-500)' },
                { icon: Star, label: `${course.likes} avis`, c: 'var(--green-400)' },
              ].map((it, i) => (
                <motion.span key={i} whileHover={{ y: -3, scale: 1.05 }}
                  className="flex items-center gap-2 text-sm font-bold px-3.5 py-2 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <it.icon className="w-4 h-4" style={{ color: it.c }} />
                  <span style={{ color: '#F6FFF9' }}>{it.label}</span>
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT & SIDEBAR ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col lg:flex-row gap-12 relative items-start">

          {/* COLONNE GAUCHE (Contenu) */}
          <div className="lg:w-2/3 space-y-16">

            {/* À propos */}
            {course.description && (
              <Reveal>
                <div>
                  <h2 className="text-2xl font-heading font-extrabold mb-6 flex items-center gap-3" style={{ color: 'var(--ink)' }}>
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#FFF4CC' }}>
                      <Info className="w-5 h-5" style={{ color: '#b8860b' }} />
                    </span>
                    À propos de cette formation
                  </h2>
                  <div className="card-flat p-6 md:p-8">
                    <p className="whitespace-pre-line leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>{course.description}</p>
                  </div>
                </div>
              </Reveal>
            )}

            {/* Objectifs */}
            {course.objectives && (
              <Reveal>
                <div>
                  <h2 className="text-2xl font-heading font-extrabold mb-6 flex items-center gap-3" style={{ color: 'var(--ink)' }}>
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#DCFCE7' }}>
                      <Check className="w-5 h-5" style={{ color: '#149352' }} />
                    </span>
                    Ce que vous allez apprendre
                  </h2>
                  <div className="card-flat p-6 md:p-8" style={{ borderTop: '4px solid var(--green-500)' }}>
                    <p className="whitespace-pre-line leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>{course.objectives}</p>
                  </div>
                </div>
              </Reveal>
            )}

            {/* Prérequis */}
            {course.prerequisites && (
              <Reveal>
                <div>
                  <h2 className="text-2xl font-heading font-extrabold mb-6 flex items-center gap-3" style={{ color: 'var(--ink)' }}>
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#FDE3E5' }}>
                      <AlertTriangle className="w-5 h-5" style={{ color: '#E23744' }} />
                    </span>
                    Prérequis
                  </h2>
                  <div className="card-flat p-6 md:p-8" style={{ borderTop: '4px solid var(--red-500)' }}>
                    <p className="whitespace-pre-line leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>{course.prerequisites}</p>
                  </div>
                </div>
              </Reveal>
            )}

            {/* Curriculum */}
            <div>
              <Reveal>
                <h2 className="text-2xl font-heading font-extrabold mb-6 flex items-center gap-3" style={{ color: 'var(--ink)' }}>
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#DCFCE7' }}>
                    <BookOpen className="w-5 h-5" style={{ color: '#149352' }} />
                  </span>
                  Programme de la formation
                </h2>
              </Reveal>
              <div className="space-y-4">
                {course.curriculum?.map((mod, mi) => (
                  <Reveal key={mod.id} delay={mi * 0.06}>
                    <div className="card-flat overflow-hidden">
                      <button
                        onClick={() => setOpenMods(p => ({ ...p, [mod.id]: !p[mod.id] }))}
                        className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-[#F4FBF3]"
                        style={{ background: openMods[mod.id] ? '#F4FBF3' : 'transparent' }}>
                        <span className="font-heading font-extrabold text-lg flex items-center gap-3" style={{ color: 'var(--ink)' }}>
                          <span className="w-7 h-7 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--yellow-500)', color: 'var(--green-deep)' }}>
                            {mi + 1}
                          </span>
                          {mod.title}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#DCFCE7', color: '#149352' }}>
                            {mod.lessons.length} leçon{mod.lessons.length > 1 ? 's' : ''}
                          </span>
                          <motion.span animate={{ rotate: openMods[mod.id] ? 90 : 0 }} transition={{ duration: 0.25 }}>
                            <ChevronRight className="w-5 h-5" style={{ color: 'var(--ink-soft)' }} />
                          </motion.span>
                        </div>
                      </button>
                      <AnimatePresence>
                        {openMods[mod.id] && (
                          <motion.div
                            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                            className="overflow-hidden" style={{ borderTop: '1.5px dashed var(--border)' }}>
                            {mod.lessons.map(l => (
                              <div key={l.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#F4FBF3]"
                                style={{ borderBottom: '1px dashed var(--border)' }}>
                                {lessonIcon(l.type)}
                                <span className="font-medium text-sm flex-1" style={{ color: 'var(--ink)' }}>{l.title}</span>
                                {l.is_free ? (
                                  <span className="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider"
                                    style={{ background: '#DCFCE7', color: '#149352' }}>Aperçu gratuit</span>
                                ) : (
                                  <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                                    style={{ background: '#FDE3E5', color: '#E23744' }}>🔒 Privé</span>
                                )}
                                {l.duration && <span className="text-xs font-bold" style={{ color: 'var(--ink-soft)' }}>{l.duration}</span>}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

          </div>

          {/* COLONNE DROITE (Carte d'inscription Sticky) */}
          <div className="lg:w-1/3 w-full sticky top-24 z-20">
            <Reveal x={30} y={0}>
              <motion.div
                whileHover={{ y: -4 }}
                className="card-pop p-6 lg:p-8">
                {course.image_url && (
                  <div className="rounded-2xl overflow-hidden mb-6">
                    <img src={course.image_url} alt={course.title} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                )}

                <div className="text-3xl font-heading font-black mb-2" style={{ color: 'var(--green-700)' }}>
                  {getConvertedPrices(course.price, settings?.currency)?.mainPrice || course.price}
                </div>
                {getConvertedPrices(course.price, settings?.currency) && (
                  <p className="text-xs font-bold mb-3 tracking-wide uppercase" style={{ color: 'var(--red-600)' }}>
                    (soit {getConvertedPrices(course.price, settings?.currency)?.othersString})
                  </p>
                )}
                <p className="text-sm mb-6 font-medium" style={{ color: 'var(--ink-soft)' }}>Accès complet à vie. Aucun frais caché.</p>

                <Magnetic strength={0.15}>
                  <button
                    onClick={() => { setModalOpen(true); setEnrollStep('registration'); setEnrollError(''); }}
                    className="btn-swap w-full py-4 text-lg mb-6">
                    {course.type === 'external' ? 'Réserver ma place' : 'S\'inscrire maintenant'}
                  </button>
                </Magnetic>

                <div className="space-y-4 text-sm font-medium pt-6" style={{ borderTop: '1.5px dashed var(--border)' }}>
                  {course.format && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#149352' }} />
                      <div>
                        <span className="block font-extrabold mb-0.5" style={{ color: 'var(--ink)' }}>Format</span>
                        <span className="capitalize" style={{ color: 'var(--ink-soft)' }}>{course.format}</span>
                      </div>
                    </div>
                  )}
                  {course.has_certificate && course.has_certificate !== 'Aucun' && (
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#b8860b' }} />
                      <div>
                        <span className="block font-extrabold mb-0.5" style={{ color: 'var(--ink)' }}>Certification</span>
                        <span style={{ color: 'var(--ink-soft)' }}>{course.has_certificate} inclus</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 shrink-0" style={{ color: '#149352' }} /><span style={{ color: 'var(--ink-soft)' }}>Lien d'accès personnel garanti</span></div>
                  <div className="flex items-center gap-3"><MessageCircle className="w-5 h-5 shrink-0" style={{ color: '#E23744' }} /><span style={{ color: 'var(--ink-soft)' }}>Support privé via WhatsApp</span></div>
                  {course.type === 'external' && <div className="flex items-center gap-3"><ExternalLink className="w-5 h-5 shrink-0" style={{ color: '#b8860b' }} /><span style={{ color: 'var(--ink-soft)' }}>Session live (lien post-paiement)</span></div>}
                </div>
              </motion.div>
            </Reveal>
          </div>

        </div>
      </section>

      {/* ── MODAL INSCRIPTION ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            style={{ background: 'rgba(4,24,15,0.82)' }}
            onClick={e => { if (e.target === e.currentTarget && enrollStep === 'registration') setModalOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 26, rotate: -1 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 26 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="bg-white p-8 w-full max-w-md rounded-[2rem] shadow-2xl relative overflow-hidden"
            >
              {/* Barre tricolore d'étape */}
              <div className="tri-bar absolute top-0 inset-x-0 !h-[5px] rounded-none" />

              {/* Étape 1 : Registration */}
              {enrollStep === 'registration' && (
                <>
                  <div className="flex items-center justify-between mb-6 mt-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--green-700)' }}>Étape 1/2</p>
                      <h3 className="text-2xl font-heading font-extrabold" style={{ color: 'var(--ink)' }}>Vos informations</h3>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.85, rotate: 8 }}
                      onClick={() => setModalOpen(false)}
                      className="rounded-full p-2.5"
                      style={{ background: '#F4FBF3', color: 'var(--ink)', border: '1.5px solid var(--border)' }}>
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>Prénom</label>
                        <input required type="text" value={form.firstName}
                          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                          placeholder="Jean" className="input-swap" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>Nom</label>
                        <input required type="text" value={form.lastName}
                          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                          placeholder="Dupont" className="input-swap" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>Email</label>
                      <input required type="email" value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="jean.dupont@email.com" className="input-swap" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>Téléphone (international)</label>
                      <input required type="tel" value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="00224621000000" className="input-swap" />
                      <p className="text-xs font-medium mt-1" style={{ color: 'var(--ink-soft)' }}>Sans + ni espace. Ex : 00224621000000</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>Pays</label>
                      <select value={form.country_code}
                        onChange={e => setForm(f => ({ ...f, country_code: e.target.value }))}
                        className="input-swap cursor-pointer">
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    {enrollError && (
                      <motion.p initial={{ x: -8 }} animate={{ x: 0 }}
                        className="text-sm rounded-xl px-4 py-3 font-bold"
                        style={{ background: '#FDE3E5', border: '1.5px solid rgba(226,55,68,.35)', color: '#E23744' }}>
                        {enrollError}
                      </motion.p>
                    )}

                    <motion.button type="submit" disabled={enrolling}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="btn-swap w-full py-4 text-lg mt-2 disabled:opacity-60">
                      {enrolling
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement…</>
                        : <>Continuer vers le paiement <ChevronRight className="w-5 h-5" /></>}
                    </motion.button>
                  </form>
                </>
              )}

              {/* Étape 2 : Payment */}
              {enrollStep === 'payment' && (
                <>
                  <div className="flex items-center justify-between mb-6 mt-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--green-700)' }}>Étape 2/2</p>
                      <h3 className="text-2xl font-heading font-extrabold" style={{ color: 'var(--ink)' }}>Paiement</h3>
                    </div>
                    <motion.button whileTap={{ scale: 0.85, rotate: 8 }} onClick={() => setModalOpen(false)}
                      className="rounded-full p-2.5" style={{ background: '#F4FBF3', color: 'var(--ink)', border: '1.5px solid var(--border)' }}>
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="p-5 rounded-2xl mb-6 flex items-center justify-between"
                    style={{ background: 'var(--tri-gradient-soft, linear-gradient(135deg, rgba(22,163,74,.14), rgba(255,199,44,.18), rgba(226,55,68,.12)))', border: '1.5px solid var(--border)' }}>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--ink-soft)' }}>Total à régler</p>
                      <p className="font-heading font-black text-2xl" style={{ color: 'var(--ink)' }}>
                        {getConvertedPrices(course.price, settings?.currency)?.mainPrice || course.price}
                      </p>
                      {getConvertedPrices(course.price, settings?.currency) && (
                        <p className="text-xs font-bold mt-1" style={{ color: 'var(--red-600)' }}>
                          ~ {getConvertedPrices(course.price, settings?.currency)?.othersString}
                        </p>
                      )}
                    </div>
                    <motion.div animate={{ rotate: [0, -6, 6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: 'var(--tri-gradient)' }}>
                      <CreditCard className="w-6 h-6" style={{ color: '#04180F' }} />
                    </motion.div>
                  </div>

                  {/* Badge méthodes de paiement */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Orange Money', 'MTN MoMo', 'VISA/MasterCard', 'PayCard'].map((m, i) => (
                      <span key={m} className="text-xs px-3 py-1.5 rounded-full font-bold"
                        style={{
                          background: i % 3 === 0 ? '#DCFCE7' : i % 3 === 1 ? '#FFF4CC' : '#FDE3E5',
                          color: i % 3 === 0 ? '#149352' : i % 3 === 1 ? '#b8860b' : '#E23744',
                        }}>{m}</span>
                    ))}
                  </div>

                  {enrollError && (
                    <p className="text-sm rounded-xl px-4 py-3 font-bold mb-4"
                      style={{ background: '#FDE3E5', border: '1.5px solid rgba(226,55,68,.35)', color: '#E23744' }}>{enrollError}</p>
                  )}

                  <motion.button onClick={handlePaymentSubmit} disabled={enrolling}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="btn-swap w-full py-4 text-lg disabled:opacity-60">
                    {enrolling
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Connexion au paiement…</>
                      : <><CreditCard className="w-5 h-5" /> Payer maintenant</>}
                  </motion.button>

                  <p className="text-xs text-center font-medium mt-4" style={{ color: 'var(--ink-soft)' }}>
                    🔒 Paiement sécurisé via <strong>Djomy</strong> — Vos données sont protégées
                  </p>
                  <button onClick={() => setEnrollStep('registration')}
                    className="w-full mt-4 text-sm font-bold transition-colors" style={{ color: 'var(--green-700)' }}>
                    ← Revenir aux informations
                  </button>
                </>
              )}

              {/* Étape Redirection */}
              {enrollStep === 'redirecting' && (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center relative"
                    style={{ background: '#FFF4CC', animation: 'pulseRing 1.6s ease infinite' }}>
                    <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#b8860b' }} />
                  </div>
                  <h3 className="text-2xl font-heading font-extrabold mb-3" style={{ color: 'var(--ink)' }}>Redirection en cours…</h3>
                  <p className="font-medium text-sm" style={{ color: 'var(--ink-soft)' }}>
                    Vous allez être redirigé vers la page de paiement sécurisée <strong>Djomy</strong>.
                    <br />Ne fermez pas cette fenêtre.
                  </p>
                </div>
              )}

              {/* Étape Succès */}
              {enrollStep === 'success' && (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0.5, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'var(--tri-gradient)' }}>
                    <Check className="w-10 h-10" style={{ color: '#04180F' }} />
                  </motion.div>
                  <h3 className="text-2xl font-heading font-extrabold mb-3" style={{ color: 'var(--ink)' }}>Inscription confirmée !</h3>

                  <div className="rounded-2xl p-4 mb-6 text-left flex items-start gap-3"
                    style={{ background: '#FFF9E3', border: '1.5px solid rgba(255,199,44,.4)' }}>
                    <Loader2 className="w-5 h-5 shrink-0 mt-0.5 animate-spin" style={{ color: '#b8860b' }} />
                    <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                      Redirection automatique vers votre espace de formation en cours…
                    </p>
                  </div>

                  <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: '#F4FBF3', border: '1.5px dashed rgba(20,147,82,.4)' }}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--green-700)' }}>Lien d'accès personnel</p>
                    <p className="text-sm font-mono break-all font-bold" style={{ color: 'var(--green-800)' }}>{accessUrl}</p>
                  </div>

                  <div className="flex flex-col gap-3 mb-6">
                    <a href={accessUrl} className="btn-vert w-full py-3.5 text-sm">
                      <PlayCircle className="w-5 h-5" /> Suivre ma formation maintenant
                    </a>

                    <button onClick={copyLink}
                      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm transition-all border-2 ${
                        copied ? '' : ''
                      }`}
                      style={copied
                        ? { background: '#DCFCE7', borderColor: '#149352', color: '#149352' }
                        : { background: 'var(--paper)', borderColor: 'var(--border)', color: 'var(--ink)' }}>
                      {copied ? <><Check className="w-5 h-5" /> Lien copié</> : <><Copy className="w-5 h-5" /> Copier mon lien</>}
                    </button>

                    <button onClick={openWhatsApp} className="btn-swap w-full py-3.5 text-sm">
                      <MessageCircle className="w-5 h-5" /> Contacter le formateur
                    </button>
                  </div>

                  <button onClick={() => setModalOpen(false)}
                    className="text-sm font-bold transition-colors" style={{ color: 'var(--ink-soft)' }}>
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

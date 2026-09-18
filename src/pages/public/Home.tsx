import { motion, useInView } from 'framer-motion';
import { getConvertedPrices } from '../../utils/currency';
import {
  ArrowRight, Shield, Globe, BookOpen,
  CheckCircle, Sparkles, Zap, Phone, ChevronRight,
  Award, TrendingUp, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getCourses } from '../../services/api';
import { useSettings } from '../../components/SettingsProvider';

/* ── Variants ─────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 50 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }
  }),
};

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }
  }),
};

const stagger = {
  hidden:   {},
  visible:  { transition: { staggerChildren: 0.1 } },
};

const slideLeft = {
  hidden:  { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } },
};
const slideRight = {
  hidden:  { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } },
};

/* ── Animated counter ─────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref      = useRef<HTMLSpanElement>(null);
  const inView   = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = Math.ceil(to / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, to);
      setCount(start);
      if (start >= to) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Data ─────────────────────────────────────────── */
const features = [
  { icon: Shield,      title: 'Leadership & Management',     desc: 'Développer les compétences de pilotage, de décision et de gestion d\'équipe pour diriger des projets et des organisations avec confiance.',            color: 'var(--gold)', bg: 'var(--gold-muted)' },
  { icon: Globe,       title: 'Business & Entrepreneuriat',  desc: 'Structurer, financer et développer une activité : stratégie, business model, croissance et conquête de nouveaux marchés.',                          color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  { icon: BookOpen,    title: 'Développement Web & Digital', desc: 'Maîtriser les technologies du web, du front-end au back-end, et construire des applications modernes et performantes.',                             color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  { icon: Zap,         title: 'Data & Intelligence Artificielle', desc: 'Exploiter la donnée et les outils d\'IA pour automatiser, analyser et accélérer la prise de décision.',                                        color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  { icon: CheckCircle, title: 'Marketing Digital',           desc: 'Acquérir, fidéliser et convertir : réseaux sociaux, publicité en ligne, contenu et stratégie de marque.',                                           color: '#22d3ee', bg: 'rgba(34,211,238,0.12)'  },
  { icon: Sparkles,    title: 'Finance & Gestion',           desc: 'Comprendre la gestion financière, les investissements et les meilleures pratiques pour piloter la performance.',                                   color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
];

const stats = [
  { icon: TrendingUp, value: 150, suffix: '+', label: 'Cours dispensés' },
  { icon: Award,      value: 50,  suffix: '+', label: 'Experts certifiés' },
  { icon: CheckCircle, value: 98, suffix: '%', label: 'Taux de satisfaction' },
];

const testimonials = [
  { name: 'Amadou Diallo', role: 'Directeur général, secteur public', text: 'Une formation d\'un niveau international, avec une compréhension profonde des enjeux du terrain. Mon leadership en a été transformé.' },
  { name: 'Fatoumata Bah', role: 'Consultante en stratégie', text: 'J\'ai pu structurer mes projets avec une méthodologie solide. Les formateurs sont d\'une qualité rare, accessibles et engagés.' },
  { name: 'Ibrahim Kouyaté', role: 'Entrepreneur, secteur minier', text: 'La formation m\'a permis d\'accéder à des marchés que je n\'imaginais pas. Un investissement qui se rentabilise immédiatement.' },
];

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const settings = useSettings();

  useEffect(() => {
    getCourses()
      .then(data => setFeaturedCourses(data.filter((c: any) => c.status === 'published').slice(0, 3)))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--dark-base)' }}>

      {/* ══════════════════════════════════════════════
          HERO — Full-screen dark immersive
      ══════════════════════════════════════════════ */}
      <section className="section-dark min-h-screen flex items-center pt-24 pb-16 relative">
        {/* Subtle decoration — very understated */}
        <div className="glow-orb glow-orb-gold"
          style={{ width: 600, height: 600, top: '-150px', right: '-200px', opacity: 0.04 }} />
        <div className="glow-orb glow-orb-blue"
          style={{ width: 400, height: 400, bottom: '-80px', left: '-120px', opacity: 0.03 }} />


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            {/* ── Left ── */}
            <motion.div
              className="lg:col-span-7"
              variants={stagger} initial="hidden" animate="visible">

              <motion.h1 variants={fadeUp} custom={0}
                className="text-5xl md:text-6xl xl:text-7xl font-black text-white mb-8"
                style={{ lineHeight: 1.05 }}>
                Développez vos compétences.{' '}
                <span className="text-gradient-gold">Transformez</span>{' '}
                <br className="hidden md:block" />
                votre {' '}
                <span className="text-gradient-gold">avenir professionnel</span>.
              </motion.h1>

              <motion.p variants={fadeUp} custom={2}
                className="text-lg xl:text-xl mb-10 max-w-xl leading-relaxed"
                style={{ color: 'var(--text-muted)' }}>
                Des programmes de formation d'excellence conçus pour accompagner
                votre montée en compétences, où que vous en soyez dans votre parcours.
              </motion.p>

              <motion.div variants={fadeUp} custom={3}
                className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <a href="tel:+224000000000" className="btn-gold text-base px-7 py-4">
                  <Phone className="w-5 h-5" />
                  Nous appeler
                </a>
                <Link to="/courses" className="btn-outline-white text-base px-7 py-4">
                  Découvrir les formations
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </motion.div>

            {/* ── Right: Stats ── */}
            <motion.div
              className="lg:col-span-5 grid grid-cols-3 gap-4"
              variants={stagger} initial="hidden" animate="visible">
              {stats.map((s, i) => (
                <motion.div
                  key={i} custom={4 + i} variants={fadeUp}
                  className="stat-card">
                  <s.icon className="w-6 h-6 mb-3 mx-auto" style={{ color: 'var(--gold)', opacity: 0.9 }} />
                  <div className="text-3xl xl:text-4xl font-black number-glow mb-2">
                    <Counter to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES — 6 pillars
      ══════════════════════════════════════════════ */}
      <section className="bg-white py-28 relative">
        <div className="grid-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <motion.div
            className="text-center mb-16"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center mb-4">
              <span className="section-label">Nos Axes Stratégiques</span>
            </motion.div>
            <motion.h2 variants={fadeUp}
              className="text-4xl md:text-5xl font-extrabold text-dark-primary mb-5">
              Un catalogue taillé pour{' '}
              <span className="text-gradient-gold">votre réussite</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-secondary text-lg max-w-2xl mx-auto">
              Des programmes à fort impact conçus avec les meilleures pratiques
              et adaptés aux besoins du marché.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            variants={stagger}>
            {features.map((f, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} className="feature-card group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: f.bg }}>
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-bold text-dark-primary mb-3 group-hover:text-dark-secondary transition-colors duration-300">
                  {f.title}
                </h3>
                <p className="text-sm text-dark-secondary leading-relaxed">{f.desc}</p>
                <div className="flex items-center gap-2 mt-5 text-xs font-semibold"
                  style={{ color: f.color }}>
                  <span>En savoir plus</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURED COURSES - Changé en section blanche pour équilibrer 40/40
      ══════════════════════════════════════════════ */}
      <section className="bg-white py-28 relative">
        <div className="grid-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Header */}
          <motion.div
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={stagger}>
            <div>
              <motion.span variants={fadeUp} className="section-label">Formations phares</motion.span>
              <motion.h2 variants={fadeUp}
                className="text-4xl md:text-5xl font-extrabold text-dark-primary">
                Nos programmes <span className="text-gradient-gold">les plus demandés</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-dark-secondary mt-3 text-lg">
                Des formations concrètes, animées par des experts de haut niveau.
              </motion.p>
            </div>
            <motion.div variants={fadeUp}>
              <Link to="/courses" className="btn-secondary">
                Voir tout le catalogue
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            variants={stagger}>

            {isLoading && [1,2,3].map(i => (
              <div key={i} className="premium-card h-80 animate-pulse" style={{ background: 'var(--secondary)' }} />
            ))}

            {!isLoading && featuredCourses.length === 0 && (
              <div className="col-span-3 text-center py-24 glass-panel" style={{ border: '1px solid var(--border)', background: 'var(--secondary)' }}>
                <BookOpen className="w-12 h-12 text-dark-primary mx-auto mb-4 opacity-20" />
                <p className="text-dark-secondary text-lg">Aucune formation disponible pour le moment.</p>
              </div>
            )}

            {!isLoading && featuredCourses.map((course, idx) => (
              <motion.div
                key={course.id} custom={idx} variants={fadeUp}
                className="premium-card flex flex-col overflow-hidden group">

                {/* Image */}
                <div className="course-card-img h-48 flex-shrink-0 bg-slate-100">
                  {course.image_url
                    ? <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--secondary)' }}>
                        <BookOpen className="w-12 h-12" style={{ color: 'var(--gold-muted)' }} />
                      </div>
                  }
                  {/* Gradient overlay */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,21,41,0.8) 0%, transparent 60%)' }} />
                  {/* Category pill */}
                  <div className="absolute bottom-3 left-3">
                    <span className="badge-gold text-xs">{course.category || 'Formation'}</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow bg-white">
                  <h3 className="text-lg font-bold text-dark-primary mb-3 leading-snug line-clamp-2
                    group-hover:text-dark-secondary transition-colors duration-300">
                    {course.title}
                  </h3>
                  <p className="text-sm text-dark-secondary leading-relaxed line-clamp-3 flex-grow mb-6">
                    {course.description || 'Une formation complète pour transformer vos compétences.'}
                  </p>

                  <div className="flex items-center justify-between pt-5"
                    style={{ borderTop: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-xs text-dark-secondary mb-0.5 font-medium">Prix</p>
                      <p className="text-2xl font-black number-glow">{getConvertedPrices(course.price, settings?.currency)?.mainPrice || course.price}</p>
                      {getConvertedPrices(course.price, settings?.currency) && (
                        <p className="text-[10px] mt-0.5 font-semibold" style={{ color: 'var(--gold)' }}>
                          ~ {getConvertedPrices(course.price, settings?.currency)?.othersString}
                        </p>
                      )}
                    </div>
                    <Link to={`/courses/${course.id}`} className="btn-gold text-sm py-2.5 px-5">
                      Voir la formation
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>



      {/* ══════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden"
        style={{ background: 'var(--dark-base)' }}>
        <div className="grid-overlay" />
        {/* Gold glow center */}
        <div className="glow-orb glow-orb-gold"
          style={{ width: 800, height: 400, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.1 }} />

        {/* Top gold line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, var(--gold) 50%, transparent 100%)' }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center mb-6">
              <span className="section-label">Passez à l'action</span>
            </motion.div>
            <motion.h2 variants={fadeUp}
              className="text-4xl md:text-6xl font-black text-white mb-6"
              style={{ lineHeight: 1.05 }}>
              Prêt à transformer votre{' '}
              <span className="text-gradient-gold">avenir professionnel ?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Rejoignez nos apprenants qui choisient l'excellence et donnez un élan décisif à votre carrière.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses" className="btn-gold text-lg px-10 py-5">
                Démarrer maintenant
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="tel:+224000000000" className="btn-outline-white text-lg px-10 py-5">
                <Phone className="w-5 h-5" />
                Nous contacter
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, var(--gold) 50%, transparent 100%)' }} />
      </section>

    </div>
  );
}

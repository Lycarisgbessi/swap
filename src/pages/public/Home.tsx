import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { getConvertedPrices } from '../../utils/currency';
import {
  ArrowRight, Shield, Globe, BookOpen, CheckCircle, Sparkles, Zap,
  Phone, ChevronRight, Award, TrendingUp, Star, Rocket, Target, Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getCourses } from '../../services/api';
import { useSettings } from '../../components/SettingsProvider';
import { Reveal, RevealText, Magnetic } from '../../components/Reveal';

/* ── Animated counter ─────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1600;
    const step = Math.ceil(to / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, to);
      setCount(start);
      if (start >= to) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count.toLocaleString('fr-FR')}{suffix}</span>;
}

/* ── Data ─────────────────────────────────────────── */
const features = [
  { icon: Shield,      title: 'Leadership & Management',  desc: "Développez vos compétences de pilotage, de décision et de gestion d'équipe pour diriger avec confiance.", color: '#149352', bg: '#DCFCE7' },
  { icon: Globe,       title: 'Business & Entrepreneuriat', desc: "Structurez, financez et développez votre activité : stratégie, business model et conquête de marchés.",  color: '#E23744', bg: '#FDE3E5' },
  { icon: BookOpen,    title: 'Développement Web',        desc: "Maîtrisez les technologies du web, du front-end au back-end, et construisez des applications modernes.",   color: '#FFC72C', bg: '#FFF4CC' },
  { icon: Zap,         title: 'Data & Intelligence Artificielle', desc: "Exploitez la donnée et les outils d'IA pour automatiser, analyser et accélérer vos décisions.",     color: '#149352', bg: '#DCFCE7' },
  { icon: CheckCircle, title: 'Marketing Digital',        desc: "Acquérez, fidélisez et convertissez : réseaux sociaux, publicité en ligne et stratégie de contenu.",      color: '#E23744', bg: '#FDE3E5' },
  { icon: Sparkles,    title: 'Finance & Gestion',        desc: "Comprenez la gestion financière, les investissements et les pratiques pour piloter la performance.",    color: '#FFC72C', bg: '#FFF4CC' },
];

const stats = [
  { icon: TrendingUp, value: 150, suffix: '+', label: 'Formations' },
  { icon: Award,      value: 50,  suffix: '+', label: 'Experts' },
  { icon: CheckCircle, value: 98, suffix: '%', label: 'Satisfaction' },
];

const testimonials = [
  { name: 'Amadou D.', role: 'Directeur général', text: "Une formation d'un niveau international, avec une compréhension profonde des enjeux du terrain. Mon leadership en a été transformé.", color: '#149352' },
  { name: 'Fatoumata B.', role: 'Consultante stratégie', text: "J'ai pu structurer mes projets avec une méthodologie solide. Les formateurs sont d'une qualité rare, accessibles et engagés.", color: '#FFC72C' },
  { name: 'Ibrahim K.', role: 'Entrepreneur', text: "La formation m'a permis d'accéder à des marchés que je n'imaginais pas. Un investissement qui se rentabilise immédiatement.", color: '#E23744' },
];

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const settings = useSettings();

  // Parallaxe du hero
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 130]);
  const heroOpacity = useTransform(heroScroll, [0, 0.85], [1, 0]);

  useEffect(() => {
    getCourses()
      .then(data => setFeaturedCourses(data.filter((c: any) => c.status === 'published').slice(0, 3)))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-col section-cream">

      {/* ══════════════════════════════════════════════
          HERO — light, blobs tricolores, titre mot à mot
      ══════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        {/* Blobs organiques animés */}
        <div className="blob blob-green"  style={{ width: 480, height: 480, top: '-120px', left: '-140px' }} />
        <div className="blob blob-yellow" style={{ width: 380, height: 380, top: '10%', right: '-110px', animationDelay: '-4s' }} />
        <div className="blob blob-red"    style={{ width: 320, height: 320, bottom: '-90px', left: '32%', animationDelay: '-8s' }} />
        <div className="dot-grid absolute inset-0 opacity-40" aria-hidden />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">

            {/* ── Left ── */}
            <div className="lg:col-span-7">

              <motion.div
                initial={{ opacity: 0, y: -14, rotate: -3 }}
                animate={{ opacity: 1, y: 0, rotate: -2 }}
                transition={{ duration: 0.6 }}
                className="inline-block mb-7">
                <span className="badge-gold">
                  <Sparkles className="w-3.5 h-3.5" /> Nouvelle saison de formations
                </span>
              </motion.div>

              <h1 className="display-hero text-[2.9rem] sm:text-6xl xl:text-[5.2rem] mb-8" style={{ color: 'var(--ink)' }}>
                <RevealText text="Apprenez aujourd'hui." delay={0.1} />
                <br />
                <span className="tri-text">
                  <RevealText text="Brillez demain." delay={0.4} />
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.7 }}
                className="text-lg xl:text-xl mb-10 max-w-xl leading-relaxed font-medium"
                style={{ color: 'var(--ink-soft)' }}>
                Des formations en ligne, en live et en présentiel conçues pour
                faire décoller votre carrière. Rejoignez la communauté{' '}
                <span className="font-bold" style={{ color: 'var(--green-700)' }}>{settings?.platformName || 'Swap'}</span>.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <Magnetic>
                  <Link to="/courses" className="btn-swap text-base px-8 py-4">
                    Explorer les formations
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Magnetic>
                <Magnetic strength={0.18}>
                  <a href="tel:+224000000000" className="btn-outline-swap text-base px-8 py-4">
                    <Phone className="w-5 h-5" />
                    Nous appeler
                  </a>
                </Magnetic>
              </motion.div>
            </div>

            {/* ── Right: Stats flottantes ── */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-4">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 46, rotate: i === 1 ? 4 : -3 }}
                  animate={{ opacity: 1, y: 0, rotate: i === 1 ? 2 : -2 }}
                  transition={{ delay: 1.1 + i * 0.14, type: 'spring', stiffness: 130, damping: 15 }}
                  whileHover={{ rotate: 0, y: -10, scale: 1.04 }}
                  className="card-pop !rounded-3xl p-5 text-center"
                  style={{ marginTop: i === 1 ? '2rem' : 0 }}>
                  <div className="w-11 h-11 mx-auto mb-3 rounded-full flex items-center justify-center"
                    style={{ background: i === 0 ? '#DCFCE7' : i === 1 ? '#FFF4CC' : '#FDE3E5' }}>
                    <s.icon className="w-5 h-5" style={{ color: i === 0 ? '#149352' : i === 1 ? '#b8860b' : '#E23744' }} />
                  </div>
                  <div className="text-3xl xl:text-4xl font-heading font-black" style={{ color: 'var(--ink)' }}>
                    <Counter to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider mt-1" style={{ color: 'var(--ink-soft)' }}>{s.label}</div>
                </motion.div>
              ))}

              {/* Badge flottant */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.7, type: 'spring', stiffness: 200, damping: 14 }}
                className="col-span-3 flex items-center gap-3 card-flat px-5 py-4"
                style={{ animation: 'floatY 5s ease-in-out infinite' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--tri-gradient)' }}>
                  <Rocket className="w-5 h-5" style={{ color: '#04180F' }} />
                </div>
                <div>
                  <p className="font-heading font-extrabold text-sm" style={{ color: 'var(--ink)' }}>Inscription en 2 minutes</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>Paiement mobile money accepté</p>
                </div>
                <div className="ml-auto flex -space-x-2">
                  {['#149352', '#FFC72C', '#E23744'].map(c => (
                    <span key={c} className="w-7 h-7 rounded-full border-2 border-white" style={{ background: c }} />
                  ))}
                </div>
              </motion.div>
            </div>

          </div>
        </motion.div>

        {/* Indicateur scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: 'var(--ink-soft)' }}>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Défiler</span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full" style={{ background: ['var(--green-500)', 'var(--yellow-500)', 'var(--red-500)'][i], animation: `bounceDot 1.4s ${i * 0.18}s ease infinite` }} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          MARQUEE tricolore
      ══════════════════════════════════════════════ */}
      <section className="section-vert py-5">
        <div className="marquee">
          <div className="marquee-track">
            {[...Array(2)].flatMap((_, k) =>
              ['Leadership', 'Développement Web', 'Marketing Digital', 'Data & IA', 'Finance', 'Entrepreneuriat'].map((w, i) => (
                <span key={`${k}-${i}`} className="font-heading font-extrabold text-2xl flex items-center gap-12"
                  style={{ color: i % 3 === 0 ? 'var(--green-400)' : i % 3 === 1 ? 'var(--yellow-500)' : 'var(--red-500)' }}>
                  {w}
                  <Star className="w-4 h-4 fill-current opacity-50" />
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES — 6 domaines
      ══════════════════════════════════════════════ */}
      <section className="section-cream py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center mb-16">
            <Reveal><span className="section-label">Nos domaines</span></Reveal>
            <Reveal delay={0.08}>
              <h2 className="display-hero text-4xl md:text-5xl mt-6 mb-5" style={{ color: 'var(--ink)' }}>
                Un catalogue taillé pour{' '}
                <span className="tri-text">votre réussite</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="text-lg max-w-2xl mx-auto font-medium" style={{ color: 'var(--ink-soft)' }}>
                Six grands domaines de compétence, des programmes concrets animés
                par des experts passionnés.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 0.07} rotate={i % 2 === 0 ? -1 : 1}>
                <motion.div
                  whileHover={{ rotate: 0, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="feature-card h-full group cursor-default">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110"
                    style={{ background: f.bg, transform: 'rotate(-4deg)' }}>
                    <f.icon className="w-7 h-7" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-lg font-heading font-extrabold mb-3" style={{ color: 'var(--ink)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>{f.desc}</p>
                  <div className="flex items-center gap-2 mt-6 text-xs font-bold uppercase tracking-wider transition-transform duration-300 group-hover:translate-x-2"
                    style={{ color: f.color }}>
                    Bientôt disponible
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FORMATIONS PHARES
      ══════════════════════════════════════════════ */}
      <section className="section-cream pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <Reveal><span className="section-label">Formations phares</span></Reveal>
              <Reveal delay={0.08}>
                <h2 className="display-hero text-4xl md:text-5xl mt-6" style={{ color: 'var(--ink)' }}>
                  Nos programmes{' '}
                  <span className="tri-text">les plus demandés</span>
                </h2>
              </Reveal>
            </div>
            <Reveal delay={0.15}>
              <Magnetic strength={0.2}>
                <Link to="/courses" className="btn-outline-swap">
                  Tout le catalogue
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Magnetic>
            </Reveal>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">

            {isLoading && [1, 2, 3].map(i => (
              <div key={i} className="card-pop h-96 animate-pulse" style={{ background: 'var(--paper)' }} />
            ))}

            {!isLoading && featuredCourses.length === 0 && (
              <Reveal className="col-span-3">
                <div className="card-flat text-center py-24">
                  <BookOpen className="w-14 h-14 mx-auto mb-4 opacity-20" style={{ color: 'var(--ink)' }} />
                  <p className="text-lg font-medium" style={{ color: 'var(--ink-soft)' }}>Aucune formation disponible pour le moment.</p>
                </div>
              </Reveal>
            )}

            {!isLoading && featuredCourses.map((course, idx) => (
              <Reveal key={course.id} delay={idx * 0.1} rotate={idx === 1 ? 0.6 : -0.4}>
                <motion.div whileHover={{ y: -10 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="card-pop flex flex-col h-full group">

                  {/* Image */}
                  <div className="course-card-img h-48 flex-shrink-0" style={{ background: 'var(--green-100)' }}>
                    {course.image_url
                      ? <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center dot-grid">
                          <BookOpen className="w-12 h-12" style={{ color: 'var(--green-600)', opacity: 0.5 }} />
                        </div>
                      }
                    {/* Category pill */}
                    <div className="absolute bottom-3 left-3">
                      <span className="badge-gold text-[10px]">{course.category || 'Formation'}</span>
                    </div>
                    {/* Rating */}
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)' }}>
                        <Star className="w-3 h-3 fill-current" style={{ color: 'var(--yellow-500)' }} />
                        4.9
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-heading font-extrabold mb-3 leading-snug line-clamp-2" style={{ color: 'var(--ink)' }}>
                      {course.title}
                    </h3>
                    <p className="text-sm leading-relaxed line-clamp-3 flex-grow mb-6 font-medium" style={{ color: 'var(--ink-soft)' }}>
                      {course.description || 'Une formation complète pour transformer vos compétences.'}
                    </p>

                    <div className="flex items-center justify-between pt-5 mt-auto" style={{ borderTop: '1.5px dashed var(--border)' }}>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--ink-soft)' }}>Prix</p>
                        <p className="text-2xl font-heading font-black" style={{ color: 'var(--green-700)' }}>
                          {getConvertedPrices(course.price, settings?.currency)?.mainPrice || course.price}
                        </p>
                        {getConvertedPrices(course.price, settings?.currency) && (
                          <p className="text-[10px] mt-0.5 font-bold" style={{ color: 'var(--red-600)' }}>
                            ~ {getConvertedPrices(course.price, settings?.currency)?.othersString}
                          </p>
                        )}
                      </div>
                      <motion.div whileHover={{ scale: 1.05, rotate: -2 }} whileTap={{ scale: 0.95 }}>
                        <Link to={`/courses/${course.id}`} className="btn-swap text-sm py-2.5 px-5">
                          Voir
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TÉMOIGNAGES
      ══════════════════════════════════════════════ */}
      <section className="section-cream pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal><span className="section-label">Ils nous font confiance</span></Reveal>
            <Reveal delay={0.08}>
              <h2 className="display-hero text-4xl md:text-5xl mt-6" style={{ color: 'var(--ink)' }}>
                Des parcours qui <span className="tri-text">parlent d'eux-mêmes</span>
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 0.12} rotate={i === 1 ? 0.8 : -0.8}>
                <motion.div whileHover={{ y: -8, rotate: 0 }} className="card-flat p-8 h-full relative"
                  style={{ borderTop: `4px solid ${t.color}` }}>
                  <span className="absolute top-5 right-7 font-heading font-black text-6xl leading-none select-none" style={{ color: t.color, opacity: 0.14 }}>”</span>
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-current" style={{ color: t.color }} />
                    ))}
                  </div>
                  <p className="font-medium leading-relaxed mb-7" style={{ color: 'var(--ink-soft)' }}>{t.text}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-heading font-black text-sm"
                      style={{ background: t.color, color: '#04180F' }}>
                      {t.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-heading font-extrabold text-sm" style={{ color: 'var(--ink)' }}>{t.name}</p>
                      <p className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA — section verte immersive
      ══════════════════════════════════════════════ */}
      <section className="section-vert py-32 relative">
        <div className="dot-grid-light absolute inset-0" aria-hidden />
        <div className="blob blob-yellow" style={{ width: 420, height: 420, top: '-80px', left: '55%' }} />
        <div className="spin-ring absolute -bottom-32 -left-32 w-96 h-96" aria-hidden />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-[0.25em] px-4 py-2 rounded-full mb-8"
              style={{ background: 'rgba(255,199,44,0.12)', color: 'var(--yellow-500)', border: '1px solid rgba(255,199,44,0.3)' }}>
              <Target className="w-3.5 h-3.5" /> Passez à l'action
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-hero text-4xl md:text-6xl text-white mb-7">
              Prêt à transformer votre{' '}
              <span className="tri-text">avenir professionnel ?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-xl mb-12 max-w-2xl mx-auto font-medium" style={{ color: 'var(--text-muted)' }}>
              Rejoignez nos apprenants et donnez un élan décisif à votre carrière dès aujourd'hui.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Magnetic>
                <Link to="/courses" className="btn-swap text-lg px-10 py-5">
                  Démarrer maintenant
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.18}>
                <a href="tel:+224000000000" className="btn-outline-light text-lg px-10 py-5">
                  <Phone className="w-5 h-5" />
                  Nous contacter
                </a>
              </Magnetic>
            </div>
          </Reveal>

          {/* Silhouettes stats */}
          <Reveal delay={0.35}>
            <div className="flex items-center justify-center gap-8 mt-16 flex-wrap">
              {[
                { icon: Users, label: 'Communauté active' },
                { icon: Award, label: 'Certificats reconnus' },
                { icon: Zap, label: 'Accès immédiat' },
              ].map((it, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: i === 0 ? 'rgba(34,197,94,0.15)' : i === 1 ? 'rgba(255,199,44,0.15)' : 'rgba(226,55,68,0.15)' }}>
                    <it.icon className="w-4 h-4" style={{ color: i === 0 ? 'var(--green-400)' : i === 1 ? 'var(--yellow-500)' : 'var(--red-500)' }} />
                  </span>
                  {it.label}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

import { motion } from 'framer-motion';
import { Target, Users, Zap, Award, CheckCircle, Leaf, Flame, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../components/SettingsProvider';
import { Reveal, RevealText, Magnetic } from '../../components/Reveal';

export default function About() {
  const { platformName } = useSettings();
  const name = platformName || 'Swap';

  return (
    <div className="flex flex-col min-h-screen section-cream">

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-20 overflow-hidden text-center">
        <div className="blob blob-green"  style={{ width: 400, height: 400, top: '-100px', left: '-100px' }} />
        <div className="blob blob-red"    style={{ width: 320, height: 320, bottom: '-60px', right: '-80px', animationDelay: '-6s' }} />
        <div className="dot-grid absolute inset-0 opacity-30" aria-hidden />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal><span className="section-label">À propos de nous</span></Reveal>
          <h1 className="display-hero text-5xl md:text-7xl mt-7 mb-7" style={{ color: 'var(--ink)' }}>
            <RevealText text="L'histoire de" delay={0.05} />{' '}
            <span className="tri-text"><RevealText text={name} delay={0.35} /></span>
          </h1>
          <Reveal delay={0.5}>
            <p className="text-xl font-medium mb-10 max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
              Une plateforme de formation née d'une conviction simple :
              l'apprentissage doit être vivant, accessible et transformateur.
            </p>
          </Reveal>
          <Reveal delay={0.6}>
            <div className="tri-bar max-w-[180px] mx-auto" />
          </Reveal>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="section-vert py-16 relative">
        <div className="dot-grid-light absolute inset-0" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { v: '10+', l: "Années d'expertise", c: 'var(--green-400)' },
              { v: '150+', l: 'Cours dispensés',   c: 'var(--yellow-500)' },
              { v: '50+',  l: 'Experts certifiés', c: 'var(--red-500)' },
              { v: '98%',  l: 'Satisfaction',      c: 'var(--green-400)' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <motion.div whileHover={{ y: -6, rotate: i % 2 ? 1.5 : -1.5 }} className="stat-card">
                  <div className="text-5xl font-heading font-black mb-2" style={{ color: s.c }}>{s.v}</div>
                  <div className="font-bold text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{s.l}</div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Histoire ── */}
      <section className="section-cream py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <Reveal x={-40} y={0}>
              <div>
                <span className="section-label">Notre ADN</span>
                <h2 className="display-hero text-3xl md:text-5xl mt-6 mb-8" style={{ color: 'var(--ink)' }}>
                  L'excellence, <span className="tri-text">sans détour</span>
                </h2>
                <div className="space-y-5 text-lg font-medium leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  <p>
                    Conçue comme un espace d'excellence et de transmission des savoirs,
                    notre plateforme transforme l'expertise de ses formateurs en
                    programmes à fort impact, adaptés aux réalités du marché.
                  </p>
                  <p>
                    Notre mission : former une génération de professionnels, dirigeants
                    et entrepreneurs capables d'anticiper, piloter et transformer
                    leurs organisations.
                  </p>
                </div>
                <div className="pt-8 space-y-4">
                  {[
                    { icon: Leaf,  t: 'Programmes à fort impact', c: '#149352' },
                    { icon: Flame, t: 'Adaptés aux besoins du marché', c: '#E23744' },
                    { icon: Heart, t: 'Animés par des experts passionnés', c: '#b8860b' },
                  ].map((it, i) => (
                    <Reveal key={i} delay={0.1 + i * 0.08} x={-20} y={0}>
                      <div className="flex items-center gap-3 font-bold" style={{ color: 'var(--ink)' }}>
                        <span className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: it.c + '22', color: it.c }}>
                          <it.icon className="w-4.5 h-4.5" style={{ width: '1.1rem', height: '1.1rem' }} />
                        </span>
                        {it.t}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal x={40} y={0} delay={0.15}>
              <motion.div
                whileHover={{ rotate: 0, scale: 1.015 }}
                style={{ rotate: '2deg' }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                className="relative rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="aspect-square dot-grid flex items-center justify-center"
                  style={{ background: 'linear-gradient(140deg, var(--green-100), var(--yellow-100) 55%, var(--red-100))' }}>
                  <div className="grid grid-cols-2 gap-5 p-10">
                    {[
                      { icon: Target, c: '#149352', bg: '#FFFFFF' },
                      { icon: Users, c: '#b8860b', bg: '#FFFFFF' },
                      { icon: Zap, c: '#E23744', bg: '#FFFFFF' },
                      { icon: Award, c: '#149352', bg: '#FFFFFF' },
                    ].map((it, i) => (
                      <motion.div key={i}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3.5, delay: i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white flex items-center justify-center shadow-lg"
                        style={{ rotate: i % 2 ? '3deg' : '-3deg' }}>
                        <it.icon className="w-10 h-10" style={{ color: it.c }} />
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="tri-bar absolute bottom-0 inset-x-0" />
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Valeurs ── */}
      <section className="section-cream pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal><span className="section-label">Nos valeurs</span></Reveal>
            <Reveal delay={0.08}>
              <h2 className="display-hero text-3xl md:text-5xl mt-6" style={{ color: 'var(--ink)' }}>
                Ce qui guide <span className="tri-text">chaque décision</span>
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: 'Objectifs clairs', desc: "Chaque formation est conçue avec un objectif métier direct. Pas de blabla, que du concret.", color: '#149352', bg: '#DCFCE7' },
              { icon: Users, title: 'Communauté', desc: "Rejoignez un réseau actif d'apprenants et de professionnels. L'entraide est notre force.", color: '#b8860b', bg: '#FFF4CC' },
              { icon: Zap, title: 'Impact rapide', desc: "Des méthodes accélérées pour des résultats concrets sur le marché du travail.", color: '#E23744', bg: '#FDE3E5' },
              { icon: Award, title: 'Excellence', desc: "Un contenu validé par l'expérience et plébiscité par les entreprises.", color: '#149352', bg: '#DCFCE7' },
            ].map((v, i) => (
              <Reveal key={i} delay={i * 0.09} rotate={i % 2 ? 1 : -1}>
                <motion.div whileHover={{ y: -10, rotate: 0 }} className="card-pop p-8 text-center h-full">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6"
                    style={{ background: v.bg, transform: 'rotate(-5deg)', transition: 'transform .3s' }}>
                    <v.icon className="w-8 h-8" style={{ color: v.color }} />
                  </div>
                  <h3 className="text-lg font-heading font-extrabold mb-3" style={{ color: 'var(--ink)' }}>{v.title}</h3>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{v.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <Reveal delay={0.2}>
            <div className="text-center mt-16">
              <Magnetic>
                <Link to="/courses" className="btn-swap text-base px-8 py-4">
                  Découvrir nos formations
                  <CheckCircle className="w-5 h-5" />
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

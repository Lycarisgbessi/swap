import { motion } from 'framer-motion';
import { Target, Users, Zap, Award, CheckCircle, Clock, MapPin, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../components/SettingsProvider';

export default function About() {
  const { platformName } = useSettings();
  const nameWords = platformName.trim().split(/\s+/);
  const lastWord = nameWords.pop() || '';
  const firstWords = nameWords.join(' ');

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden text-center bg-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 bg-gradient-to-b from-blue-900/20 to-transparent blur-3xl pointer-events-none rounded-full" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="badge-gold mb-6 inline-flex">À propos de nous</span>
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-dark-primary mb-6 tracking-tight">
              {firstWords}{' '}<span className="text-gradient-gold">{lastWord}</span>
            </h1>
            <p className="text-xl text-dark-secondary leading-relaxed font-medium mb-12 max-w-3xl mx-auto">
              Une plateforme de formation dédiée au renforcement des compétences
              stratégiques, managériales et techniques de ses apprenants, avec des
              programmes conçus pour un impact concret et immédiat.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 relative border-y-4 overflow-hidden" style={{ background: 'var(--dark-base)', borderColor: 'var(--gold)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div className="px-4">
              <div className="text-5xl font-black mb-2" style={{ color: 'var(--gold)' }}>10+</div>
              <div className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-bright)' }}>Années d'expertise</div>
            </div>
            <div className="px-4">
              <div className="text-5xl font-black mb-2" style={{ color: 'var(--gold)' }}>150+</div>
              <div className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-bright)' }}>Cours dispensés</div>
            </div>
            <div className="px-4">
              <div className="text-5xl font-black mb-2" style={{ color: 'var(--gold)' }}>50+</div>
              <div className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-bright)' }}>Experts certifiés</div>
            </div>
            <div className="px-4">
              <div className="text-5xl font-black mb-2" style={{ color: 'var(--gold)' }}>98%</div>
              <div className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-bright)' }}>Taux de satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Story & ADN */}
      <section className="py-24 relative z-10 w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-dark-primary mb-8 tracking-tight">Espace d’excellence et d'innovation</h2>
              <div className="space-y-6 text-lg text-dark-secondary font-medium leading-relaxed">
                <p>
                  Conçue comme un espace d’excellence, d’innovation et de transmission des savoirs, notre plateforme transforme l’expertise de ses formateurs en programmes de formation à fort impact, adaptés aux réalités du marché et aux exigences du monde professionnel contemporain.
                </p>
                <p>
                  Elle a pour mission de former une nouvelle génération de professionnels, dirigeants, experts et entrepreneurs, capables d’anticiper, piloter et transformer leurs organisations et leurs projets.
                </p>
                <div className="pt-6">
                  <ul className="space-y-4">
                    <li className="flex items-center text-dark-secondary">
                      <CheckCircle className="w-6 h-6 mr-3" style={{ color: 'var(--gold)' }} /> Programmes de formation à fort impact
                    </li>
                    <li className="flex items-center text-dark-secondary">
                      <CheckCircle className="w-6 h-6 mr-3" style={{ color: 'var(--gold)' }} /> Adaptés aux besoins du marché
                    </li>
                    <li className="flex items-center text-dark-secondary">
                      <CheckCircle className="w-6 h-6 mr-3" style={{ color: 'var(--gold)' }} /> Animés par des experts passionnés
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 to-blue-400/20 mix-blend-multiply z-10"></div>
                <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Equipe au travail" className="object-cover w-full h-full" />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[var(--border)]">
         <div className="text-center mb-16">
           <h2 className="text-3xl md:text-5xl font-extrabold text-dark-primary mb-4">Nos valeurs fondatrices</h2>
           <p className="text-dark-secondary text-lg">Ce qui guide nos décisions au quotidien.</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white border-t-4 p-8 rounded-3xl text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300" style={{ borderColor: 'var(--dark-base)' }}>
               <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6" style={{ background: 'rgba(6,17,31,0.05)' }}>
                  <Target className="w-8 h-8 text-dark-primary" />
               </div>
               <h3 className="text-xl font-bold text-dark-primary mb-3">Objectifs Clairs</h3>
               <p className="text-dark-secondary font-medium text-sm leading-relaxed">Chaque formation est conçue avec un objectif métier direct en tête. Pas de blabla, que du concret.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-white border-t-4 p-8 rounded-3xl text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300" style={{ borderColor: 'var(--gold)' }}>
               <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6" style={{ background: 'var(--gold-muted)' }}>
                  <Users className="w-8 h-8" style={{ color: 'var(--gold)' }} />
               </div>
               <h3 className="text-xl font-bold text-dark-primary mb-3">Communauté</h3>
               <p className="text-dark-secondary font-medium text-sm leading-relaxed">Rejoignez un réseau actif d'apprenants et de professionnels passionnés. L'entraide est notre force.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white border-t-4 p-8 rounded-3xl text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300" style={{ borderColor: 'var(--dark-base)' }}>
               <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6" style={{ background: 'rgba(6,17,31,0.05)' }}>
                  <Zap className="w-8 h-8 text-dark-primary" />
               </div>
               <h3 className="text-xl font-bold text-dark-primary mb-3">Impact Rapide</h3>
               <p className="text-dark-secondary font-medium text-sm leading-relaxed">Des méthodes d'apprentissage accélérées pour des résultats concrets et rapides sur le marché du travail.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="bg-white border-t-4 p-8 rounded-3xl text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300" style={{ borderColor: 'var(--gold)' }}>
               <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6" style={{ background: 'var(--gold-muted)' }}>
                  <Award className="w-8 h-8" style={{ color: 'var(--gold)' }} />
               </div>
               <h3 className="text-xl font-bold text-dark-primary mb-3">Excellence</h3>
               <p className="text-dark-secondary font-medium text-sm leading-relaxed">Un contenu validé par l'expérience et plébiscité par les entreprises. Visez toujours plus haut.</p>
            </motion.div>
         </div>
      </section>



    </div>
  );
}

import { Search, PlayCircle, Download, Link as LinkIcon, Star, BookOpen, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../../services/api';
import { getConvertedPrices } from '../../utils/currency';
import { useSettings } from '../../components/SettingsProvider';

const fadeUp = {
  hidden:  { opacity: 0, y: 35 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }
  }),
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Courses() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm]     = useState('');
  const [courses, setCourses]           = useState<any[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const settings = useSettings();

  const categoriesSet = new Set(courses.map((c: any) => c.category || 'Général'));
  const filters       = ['All', ...Array.from(categoriesSet)];

  useEffect(() => {
    getCourses()
      .then(data => setCourses(data.filter((c: any) => c.status === 'published')))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredCourses = courses.filter((c: any) => {
    const cat = c.category || 'Général';
    return (activeFilter === 'All' || cat === activeFilter)
        && c.title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* ── Hero ── */}
      <section className="section-dark pt-28 pb-16 relative overflow-hidden">
        <div className="grid-overlay" />
        <div className="glow-orb glow-orb-gold"
          style={{ width: 600, height: 600, top: -200, right: -150, opacity: 0.06 }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="mb-5">
              <span className="badge-gold">Catalogue complet</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1}
              className="text-5xl md:text-6xl font-black text-white mb-5"
              style={{ lineHeight: 1.06 }}>
              Nos <span className="text-gradient-gold">Formations</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2}
              className="text-lg max-w-xl leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Le catalogue d'excellence pour accélérer votre carrière. Formations natives,
              packages et masterclasses exclusives.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Filter bar (elevated, floats from hero) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col md:flex-row gap-4 items-stretch md:items-center p-4 rounded-2xl"
          style={{ background: 'var(--dark-elevated)', border: '1px solid var(--gold-border)', backdropFilter: 'blur(12px)' }}>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5"
              style={{ color: 'var(--gold)', width: '1.1rem', height: '1.1rem' }} />
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-dark pl-11"
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px self-stretch"
            style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gold)' }} />
            {filters.map(filter => (
              <motion.button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200"
                style={activeFilter === filter
                  ? { background: 'var(--gold)', color: '#06111F' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-bright)', border: '1px solid var(--dark-border)' }}>
                {filter === 'All' ? 'Toutes' : filter}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Results count */}
        {!isLoading && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="text-xs font-semibold mt-5 mb-8 uppercase tracking-widest"
            style={{ color: 'var(--dark-primary)' }}>
            {filteredCourses.length} formation{filteredCourses.length !== 1 ? 's' : ''} disponible{filteredCourses.length !== 1 ? 's' : ''}
          </motion.p>
        )}

        {/* ── Grid ── */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-28">
          <AnimatePresence mode="popLayout">

            {isLoading && [1,2,3,4,5,6].map(i => (
              <div key={i} className="premium-card h-96 animate-pulse" />
            ))}

            {!isLoading && filteredCourses.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-24 glass-panel" style={{ border: '1px solid var(--border)' }}>
                <BookOpen className="w-14 h-14 mx-auto mb-4 text-dark-primary opacity-20" />
                <p className="text-dark-secondary text-lg font-medium">Aucune formation trouvée.</p>
              </motion.div>
            )}

            {!isLoading && filteredCourses.map((course, idx) => (
              <motion.div
                layout
                key={course.id}
                custom={idx}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
                className="premium-card flex flex-col overflow-hidden group cursor-pointer">

                {/* Thumbnail */}
                <div className="course-card-img h-48 flex-shrink-0 overflow-hidden relative bg-white">
                  <img
                    src={course.image_url || `https://picsum.photos/seed/${course.id}/600/400`}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(7,21,41,0.85) 0%, transparent 55%)' }} />
                  {/* Type badge */}
                  <div className="absolute top-3 left-3">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: 'var(--dark-elevated)', color: 'var(--text-bright)', backdropFilter: 'blur(4px)', border: '1px solid var(--dark-border)' }}>
                      {course.type === 'native'   && <><PlayCircle className="w-3 h-3 text-blue-400" />En ligne</>}
                      {course.type === 'package'  && <><Download   className="w-3 h-3 text-amber-400" />Téléchargement</>}
                      {course.type === 'external' && <><LinkIcon   className="w-3 h-3 text-green-400" />Live</>}
                      {!course.type              && <><PlayCircle className="w-3 h-3 text-blue-600" />Formation</>}
                    </span>
                  </div>
                  {/* Rating */}
                  <div className="absolute bottom-3 right-3">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
                      style={{ background: 'var(--dark-elevated)', color: 'var(--gold)', backdropFilter: 'blur(4px)' }}>
                      <Star className="w-3 h-3 fill-current" />
                      4.9
                    </span>
                  </div>
                  {/* Category bottom left */}
                  <div className="absolute bottom-3 left-3">
                    <span className="badge-gold text-xs py-0.5 px-2">{course.category || 'Formation'}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-grow bg-white">
                  <h3 className="text-lg font-bold text-dark-primary mb-3 line-clamp-2 leading-snug
                    group-hover:text-dark-secondary transition-colors duration-250">
                    {course.title}
                  </h3>
                  <p className="text-sm text-dark-secondary leading-relaxed line-clamp-2 flex-grow mb-5">
                    {course.description || 'Formation complète pour transformer vos compétences.'}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-5"
                    style={{ borderTop: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-xs text-dark-secondary mb-0.5">Prix</p>
                      <p className="text-2xl font-black number-glow">{getConvertedPrices(course.price, settings?.currency)?.mainPrice || course.price}</p>
                      {getConvertedPrices(course.price, settings?.currency) && (
                        <p className="text-[10px] mt-0.5 font-semibold" style={{ color: 'var(--gold)' }}>
                          ~ {getConvertedPrices(course.price, settings?.currency)?.othersString}
                        </p>
                      )}
                    </div>
                    <Link to={`/courses/${course.id}`} className="btn-gold text-sm py-2.5 px-5">
                      Voir
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

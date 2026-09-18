import { Search, PlayCircle, Download, Link as LinkIcon, Star, BookOpen, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../../services/api';
import { getConvertedPrices } from '../../utils/currency';
import { useSettings } from '../../components/SettingsProvider';
import { Reveal, RevealText, Magnetic } from '../../components/Reveal';

const TYPE_META: Record<string, { label: string; icon: typeof PlayCircle; color: string; bg: string }> = {
  native:   { label: 'En ligne',       icon: PlayCircle, color: '#149352', bg: '#DCFCE7' },
  package:  { label: 'Téléchargement', icon: Download,   color: '#b8860b', bg: '#FFF4CC' },
  external: { label: 'Live',           icon: LinkIcon,   color: '#E23744', bg: '#FDE3E5' },
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
    <div className="min-h-screen section-cream">

      {/* ── Hero ── */}
      <section className="section-vert pt-36 pb-24 relative overflow-hidden">
        <div className="blob blob-yellow" style={{ width: 440, height: 440, top: '-140px', right: '-110px' }} />
        <div className="blob blob-green"  style={{ width: 360, height: 360, bottom: '-100px', left: '-90px', animationDelay: '-5s' }} />
        <div className="dot-grid-light absolute inset-0" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-[0.22em] px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(255,199,44,0.12)', color: 'var(--yellow-500)', border: '1px solid rgba(255,199,44,0.3)' }}>
              Catalogue complet
            </span>
          </Reveal>
          <h1 className="display-hero text-5xl md:text-7xl text-white mb-6">
            <RevealText text="Toutes nos" delay={0.05} />{' '}
            <span className="tri-text"><RevealText text="formations" delay={0.3} /></span>
          </h1>
          <Reveal delay={0.4}>
            <p className="text-lg max-w-xl leading-relaxed font-medium" style={{ color: 'var(--text-muted)' }}>
              Le catalogue pour accélérer votre carrière : formations natives,
              packages téléchargeables et masterclasses live exclusives.
            </p>
          </Reveal>
          <Reveal delay={0.5}>
            <Magnetic strength={0.2}>
              <div className="tri-bar w-28 mt-8" />
            </Magnetic>
          </Reveal>
        </div>
      </section>

      {/* ── Filter bar (flottante) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-9 relative z-20">
        <Reveal y={24}>
          <div className="card-pop flex flex-col md:flex-row gap-4 items-stretch md:items-center p-4">

            {/* Search */}
            <div className="relative flex-1">
              <motion.span
                animate={searchTerm ? { rotate: [0, -12, 12, 0], scale: 1.15 } : {}}
                className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="w-4 h-4" style={{ color: 'var(--green-700)' }} />
              </motion.span>
              <input
                type="text"
                placeholder="Rechercher une formation…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-swap !rounded-full pl-11 !border-[1.5px]"
              />
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px self-stretch" style={{ background: 'var(--border)' }} />

            {/* Filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--green-700)' }} />
              {filters.map(filter => (
                <motion.button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  whileHover={{ scale: 1.06, rotate: -1 }}
                  whileTap={{ scale: 0.94 }}
                  className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200"
                  style={activeFilter === filter
                    ? { background: 'var(--green-700)', color: '#fff', boxShadow: '0 3px 0 var(--green-900)' }
                    : { background: 'var(--paper)', color: 'var(--ink-soft)', border: '1.5px solid var(--border)' }}>
                  {filter === 'All' ? 'Toutes' : filter}
                </motion.button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Results count */}
        {!isLoading && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-xs font-bold mt-5 mb-8 uppercase tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>
            <motion.span key={filteredCourses.length} initial={{ scale: 1.4, color: '#149352' }} animate={{ scale: 1, color: 'var(--green-700)' }}
              className="inline-block font-black text-sm mr-1">{filteredCourses.length}</motion.span>
            formation{filteredCourses.length !== 1 ? 's' : ''} disponible{filteredCourses.length !== 1 ? 's' : ''}
          </motion.p>
        )}

        {/* ── Grid ── */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 pb-28">
          <AnimatePresence mode="popLayout">

            {isLoading && [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card-pop h-96 animate-pulse" />
            ))}

            {!isLoading && filteredCourses.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-24 card-flat">
                <motion.div animate={{ rotate: [0, -6, 6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  <BookOpen className="w-14 h-14 mx-auto mb-4 opacity-25" style={{ color: 'var(--ink)' }} />
                </motion.div>
                <p className="text-lg font-medium" style={{ color: 'var(--ink-soft)' }}>Aucune formation trouvée.</p>
              </motion.div>
            )}

            {!isLoading && filteredCourses.map((course, idx) => {
              const meta = TYPE_META[course.type] || { label: 'Formation', icon: BookOpen, color: '#149352', bg: '#DCFCE7' };
              return (
                <motion.div
                  layout
                  key={course.id}
                  initial={{ opacity: 0, y: 40, rotate: idx % 3 === 1 ? 0.8 : -0.8 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.92, rotate: idx % 2 ? 3 : -3 }}
                  transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -10 }}
                  className="card-pop flex flex-col overflow-hidden group cursor-pointer h-full">

                  {/* Thumbnail */}
                  <div className="course-card-img h-48 flex-shrink-0 relative" style={{ background: 'var(--green-100)' }}>
                    <img
                      src={course.image_url || `https://picsum.photos/seed/${course.id}/600/400`}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Type badge */}
                    <div className="absolute top-3 left-3">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: meta.bg, color: meta.color, border: `1.5px solid ${meta.color}33` }}>
                        <meta.icon className="w-3.5 h-3.5" />
                        {meta.label}
                      </span>
                    </div>
                    {/* Rating */}
                    <div className="absolute bottom-3 right-3">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)' }}>
                        <Star className="w-3 h-3 fill-current" style={{ color: 'var(--yellow-500)' }} />
                        4.9
                      </span>
                    </div>
                    {/* Category */}
                    <div className="absolute bottom-3 left-3">
                      <span className="badge-gold text-[10px]">{course.category || 'Formation'}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-heading font-extrabold mb-3 line-clamp-2 leading-snug" style={{ color: 'var(--ink)' }}>
                      {course.title}
                    </h3>
                    <p className="text-sm font-medium line-clamp-2 flex-grow mb-5" style={{ color: 'var(--ink-soft)' }}>
                      {course.description || 'Formation complète pour transformer vos compétences.'}
                    </p>

                    {/* Footer */}
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
                      <motion.div whileHover={{ scale: 1.06, rotate: -3 }} whileTap={{ scale: 0.94 }}>
                        <Link to={`/courses/${course.id}`} className="btn-swap text-sm py-2.5 px-5">
                          Voir
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

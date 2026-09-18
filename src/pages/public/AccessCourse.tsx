import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PlayCircle, FileText, Headphones, ChevronDown, ChevronRight, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';

interface Lesson   { id: string; title: string; type: string; duration: string; is_free: number; content: string; }
interface Module   { id: string; title: string; description: string; lessons: Lesson[]; }
interface Course   { id: string; title: string; description: string; type: string; category: string; image_url: string; external_link: string; }
interface AccessData { valid: boolean; student_name: string; course: Course; curriculum: Module[]; enrolled_at: string; }

const lessonIcon = (type: string) => ({
  video: <PlayCircle className="w-5 h-5 text-primary" />,
  pdf:   <FileText   className="w-5 h-5 text-amber-500" />,
  audio: <Headphones className="w-5 h-5 text-emerald-500" />,
})[type] ?? <BookOpen className="w-5 h-5 text-slate-500" />;

export default function AccessCourse() {
  const { token } = useParams<{ token: string }>();
  const [data, setData]     = useState<AccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [openMods, setOpenMods] = useState<Record<string, boolean>>({});
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/access?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        setData(d);
        // Ouvrir le premier module par défaut
        if (d.curriculum?.[0]) setOpenMods({ [d.curriculum[0].id]: true });
        // Charger la première leçon disponible
        const first = d.curriculum?.[0]?.lessons?.[0];
        if (first) setActiveLesson(first);
      })
      .catch(() => setError('Erreur de connexion. Vérifiez votre réseau.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--gold)' }} />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[var(--border)] rounded-2xl p-10 max-w-lg w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
           <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-dark-primary mb-3">Lien invalide</h1>
        <p className="text-dark-secondary font-medium mb-8">{error || 'Ce lien d\'accès est invalide ou a expiré.'}</p>
        <div className="border rounded-xl p-4 text-left mb-8" style={{ background: 'var(--gold-muted)', borderColor: 'var(--gold)' }}>
           <p className="text-dark-primary text-sm font-medium">Contactez votre formateur sur WhatsApp pour récupérer votre lien d'accès personnel.</p>
        </div>
        <Link to="/" className="inline-block font-bold hover:underline" style={{ color: 'var(--gold)' }}>← Retour à l'accueil</Link>
      </motion.div>
    </div>
  );

  const { course, curriculum, student_name } = data;

  return (
    <div className="min-h-screen bg-[rgba(6,17,31,0.02)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div>
          <h1 className="text-dark-primary font-extrabold text-lg truncate max-w-xs sm:max-w-md">{course.title}</h1>
          <p className="text-dark-secondary text-sm font-medium">Bonjour, <span className="font-bold" style={{ color: 'var(--gold)' }}>{student_name}</span> 👋</p>
        </div>
        <span className="px-3 py-1 border text-xs font-bold rounded-full uppercase tracking-wider hidden sm:inline-block" style={{ background: 'var(--gold-muted)', borderColor: 'var(--gold)', color: 'var(--dark-primary)' }}>
          Accès Complet
        </span>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 gap-8">
        {/* Sidebar — Curriculum */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm p-5 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-dark-secondary font-bold mb-6 text-sm uppercase tracking-wider border-b border-[var(--border)] pb-3">Programme</h2>
            <div className="space-y-4">
              {curriculum.map(mod => (
                <div key={mod.id}>
                  <button
                    onClick={() => setOpenMods(p => ({ ...p, [mod.id]: !p[mod.id] }))}
                    className="w-full flex items-center justify-between py-2 rounded-xl hover:bg-[rgba(6,17,31,0.03)] transition-colors text-left group px-2"
                  >
                    <span className="text-dark-primary text-sm font-bold transition-colors">{mod.title}</span>
                    {openMods[mod.id] ? <ChevronDown className="w-4 h-4 text-dark-secondary" /> : <ChevronRight className="w-4 h-4 text-dark-secondary" />}
                  </button>
                  {openMods[mod.id] && (
                    <div className="ml-1 mt-2 space-y-1.5 border-l-2 border-[var(--border)] pl-3">
                      {mod.lessons.map(l => {
                        const isActive = activeLesson?.id === l.id;
                        return (
                          <button
                            key={l.id}
                            onClick={() => setActiveLesson(l)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors font-medium ${
                              isActive
                                ? 'font-bold shadow-sm'
                                : 'text-dark-secondary hover:bg-[rgba(6,17,31,0.03)] hover:text-dark-primary border border-transparent'
                            }`}
                            style={isActive ? { background: 'var(--gold-muted)', color: 'var(--dark-primary)', border: '1px solid var(--gold)' } : undefined}
                          >
                            {lessonIcon(l.type)}
                            <span className="truncate flex-1">{l.title}</span>
                            {l.duration && <span className="ml-auto text-xs font-semibold opacity-60 shrink-0">{l.duration}</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 min-w-0">
          {/* Lien externe (Zoom etc.) */}
          {course.type === 'external' && course.external_link && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              style={{ background: 'var(--gold-muted)', borderColor: 'var(--gold)' }}>
              <div>
                <h3 className="text-dark-primary font-bold mb-1 text-lg">Accès à votre session live</h3>
                <p className="text-dark-secondary text-sm font-medium">Cliquez sur le bouton pour rejoindre votre formation en direct.</p>
              </div>
              <a href={course.external_link} target="_blank" rel="noopener noreferrer"
                className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 btn-gold shadow-md">
                Rejoindre <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          )}

          {activeLesson ? (
            <motion.div
              key={activeLesson.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
                {/* Lecteur vidéo */}
                {activeLesson.type === 'video' && activeLesson.content && (
                  <video controls className="w-full aspect-video bg-black" src={activeLesson.content}>
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                )}
                {/* PDF viewer */}
                {activeLesson.type === 'pdf' && activeLesson.content && (
                  <iframe src={activeLesson.content} className="w-full border-b border-[var(--border)]" style={{ height: '75vh' }} title={activeLesson.title} />
                )}
                {/* Audio */}
                {activeLesson.type === 'audio' && activeLesson.content && (
                  <div className="p-12 flex flex-col items-center gap-6 border-b border-[var(--border)]" style={{ background: 'rgba(6,17,31,0.02)' }}>
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md">
                       <Headphones className="w-10 h-10" style={{ color: 'var(--gold)' }} />
                    </div>
                    <audio controls className="w-full max-w-md" src={activeLesson.content} />
                  </div>
                )}
                {/* Texte */}
                {activeLesson.type === 'text' && (
                  <div className="p-8 prose prose-slate max-w-none text-dark-secondary leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                )}
                
                <div className="p-8 bg-white">
                  <h2 className="text-2xl font-extrabold text-dark-primary mb-3">{activeLesson.title}</h2>
                  {activeLesson.description && <p className="text-dark-secondary font-medium leading-relaxed">{activeLesson.description}</p>}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-[var(--border)] p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-[rgba(6,17,31,0.03)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                 <BookOpen className="w-10 h-10 text-dark-secondary" />
              </div>
              <h3 className="text-xl font-bold text-dark-primary mb-2">Prêt à apprendre ?</h3>
              <p className="text-dark-secondary font-medium">Sélectionnez une leçon dans le programme pour commencer votre formation.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

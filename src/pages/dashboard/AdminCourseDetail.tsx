import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Eye, EyeOff, Link as LinkIcon, Save, 
  BarChart, BookOpen, Users, Settings, Plus,
  Trash2, CreditCard, Filter, Heart, Copy, X, UploadCloud, Video, FileText, Image as ImageIcon,
  Headphones, CheckCircle, AlignLeft, Globe
} from 'lucide-react';
import { getCourse, updateCourse, updateModule, createModule, deleteModule, createLesson, updateLesson, deleteLesson } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function AdminCourseDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('stats');
  const [isPublished, setIsPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings sync
  const [courseTitle, setCourseTitle]           = useState('');
  const [coursePrice, setCoursePrice]           = useState('');
  const [courseType, setCourseType]             = useState('native');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseImageUrl, setCourseImageUrl]     = useState('');
  const [courseExternalLink, setCourseExternalLink] = useState('');
  const [courseCategory, setCourseCategory]     = useState('Général');
  const [courseFormat, setCourseFormat]         = useState('en ligne');
  const [courseDuration, setCourseDuration]     = useState('');
  const [courseHasCertificate, setCourseHasCertificate] = useState('Aucun');
  const [coursePrerequisites, setCoursePrerequisites] = useState('');
  const [courseObjectives, setCourseObjectives] = useState('');

  const fetchCourseData = async () => {
    try {
      const data = await getCourse(id!);
      setCourse(data);
      setIsPublished(data.status === 'published');
      setCourseTitle(data.title);
      setCoursePrice(data.price?.replace(/\s*FCFA|€/g, '').trim() || '0');
      setCourseType(data.type || 'native');
      setCourseDescription(data.description || '');
      setCourseImageUrl(data.image_url || '');
      setCourseExternalLink(data.external_link || '');
      setCourseCategory(data.category || 'Général');
      setCourseFormat(data.format || 'en ligne');
      setCourseDuration(data.duration || '');
      setCourseHasCertificate(data.has_certificate || 'Aucun');
      setCoursePrerequisites(data.prerequisites || '');
      setCourseObjectives(data.objectives || '');
      setIsLoading(false);
    } catch(e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCourse(id!, {
        title:         courseTitle,
        description:   courseDescription,
        price:         coursePrice + " FCFA",
        type:          courseType,
        status:        isPublished ? 'published' : 'draft',
        category:      courseCategory || 'Général',
        image_url:     courseImageUrl || null,
        external_link: courseExternalLink || null,
        format:        courseFormat,
        duration:      courseDuration,
        has_certificate: courseHasCertificate,
        prerequisites: coursePrerequisites,
        objectives:    courseObjectives,
      });
      toast('success', 'Formation enregistrée avec succès !');
      fetchCourseData();
    } catch(e: any) {
      toast('error', 'Erreur : ' + (e.message || 'Impossible de sauvegarder'));
      console.error(e);
    }
    setIsSaving(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/courses/${id}`);
    toast('success', 'Lien copié dans le presse-papier !');
  };

  if (isLoading || !course) {
    return <div className="text-center p-12 text-slate-500 font-medium">Chargement de la formation...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6 max-w-6xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-8">
        <div className="flex items-center space-x-4">
          <Link to="/admin/courses" className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-white transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-heading font-extrabold tracking-tight text-white">{courseTitle}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center space-x-1.5 ${
                isPublished ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
              }`}>
                {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{isPublished ? 'Publié' : 'Brouillon'}</span>
              </span>
            </div>
            <p className="text-slate-400 font-medium text-sm mt-1">Gérez le contenu, les apprenants et analysez les performances.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={copyLink} className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm font-bold">
            <LinkIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm hidden sm:inline">Lien direct</span>
          </button>
          <button 
            onClick={async () => {
              const newState = !isPublished;
              try {
                await updateCourse(id!, {
                  title: courseTitle,
                  description: courseDescription,
                  price: coursePrice + " FCFA",
                  type: courseType,
                  status: newState ? 'published' : 'draft',
                  category: course.category || "Général"
                });
                setIsPublished(newState);
                toast(newState ? 'success' : 'warning', newState ? 'Formation publiée !' : 'Formation mise en brouillon.');
              } catch {
                toast('error', 'Erreur lors de la mise à jour du statut.');
              }
            }}
            className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm font-bold"
          >
            {isPublished ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
            <span className="text-sm hidden sm:inline">{isPublished ? 'Désactiver' : 'Activer'}</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 btn-primary px-5 py-2.5 shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm font-bold">{isSaving ? 'Enregistrement...' : 'Enregistrer les modifs'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-xl w-fit border border-white/10">
        {[
          { id: 'stats', label: 'Statistiques', icon: BarChart },
          { id: 'content', label: 'Programme & Contenu', icon: BookOpen },
          { id: 'students', label: 'Apprenants', icon: Users },
          { id: 'settings', label: 'Paramètres', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-sm border border-white/10' 
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-gold' : ''}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'stats' && <CourseStats stats={{ visits: course.visits, likes: course.likes, revenue: course.revenue, conversionRate: course.visits > 0 ? ((course.paidSignups / course.visits) * 100).toFixed(1) + '%' : '0%', freeSignups: course.freeSignups, paidSignups: course.paidSignups }} />}
          {activeTab === 'content' && <CourseContent courseId={course.id} curriculum={course.curriculum || []} courseType={courseType} onUpdate={fetchCourseData} />}
          {activeTab === 'students' && <CourseStudents courseId={course.id} />}
          {activeTab === 'settings' && (
             <div className="premium-card p-8 space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Paramètres généraux de la formation</h3>

                {/* Titre + Prix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Titre de la formation</label>
                    <input type="text" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Prix (FCFA)</label>
                    <input type="number" value={coursePrice} onChange={e => setCoursePrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                  </div>
                </div>

                {/* Catégorie */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Catégorie</label>
                  <input type="text" value={courseCategory} onChange={e => setCourseCategory(e.target.value)}
                    placeholder="Ex: Développement Web, Marketing, Finance..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                </div>

                {/* Format, Durée, Certificat */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Format</label>
                    <select value={courseFormat} onChange={e => setCourseFormat(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm">
                      <option value="en ligne">En ligne</option>
                      <option value="présentiel">Présentiel</option>
                      <option value="hybride">Hybride</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Durée estimée</label>
                    <input type="text" value={courseDuration} onChange={e => setCourseDuration(e.target.value)} placeholder="Ex: 4 semaines, 30 heures" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Certification</label>
                    <select value={courseHasCertificate} onChange={e => setCourseHasCertificate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm">
                      <option value="Aucun">Aucun</option>
                      <option value="Attestation">Attestation de suivi</option>
                      <option value="Certificat">Certificat</option>
                      <option value="Diplôme">Diplôme</option>
                    </select>
                  </div>
                </div>

                {/* Objectifs et Prérequis */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Objectifs pédagogiques</label>
                  <textarea rows={3} value={courseObjectives} onChange={e => setCourseObjectives(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-y" placeholder="À la fin de cette formation, l'apprenant sera capable de..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Prérequis</label>
                  <textarea rows={2} value={coursePrerequisites} onChange={e => setCoursePrerequisites(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-y" placeholder="Connaissances ou matériel requis avant de commencer..." />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Description de la formation</label>
                  <textarea rows={5} value={courseDescription} onChange={e => setCourseDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-y"
                    placeholder="Une description convaincante affichée sur la page vitrine..." />
                </div>



                {/* Image de couverture */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Image de couverture</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 flex flex-col items-center justify-center relative hover:border-primary hover:bg-primary/5 transition-all group">
                    <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-primary mb-3 transition-colors" />
                    <span className="text-sm font-bold text-slate-900 mb-1">Cliquer pour importer une image</span>
                    <span className="text-xs font-medium text-slate-500 mb-4">JPG, PNG, WebP</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={async (e) => {
                        if (!e.target.files?.length) return;
                        const file = e.target.files[0];
                        try {
                          const { uploadFile } = await import('../../services/api');
                          const res = await uploadFile(file);
                          setCourseImageUrl(res.url);
                        } catch (err: any) {
                          alert("Erreur lors de l'upload : " + (err.message || "Erreur inconnue"));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  {courseImageUrl && (
                    <img src={courseImageUrl} alt="Aperçu" className="mt-2 h-32 w-full object-cover rounded-xl border border-slate-200 shadow-sm" />
                  )}
                </div>

                {/* Type de distribution */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-900 block">Type de distribution</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-colors ${courseType === 'native' ? 'border-2 border-primary bg-primary/5' : 'border border-slate-200 bg-slate-50 hover:bg-slate-50'}`}>
                      <input type="radio" name="type" value="native" checked={courseType === 'native'} onChange={(e) => setCourseType(e.target.value)} className="text-primary focus:ring-primary w-4 h-4" />
                      <span className="text-slate-900 font-bold text-sm">🎬 Contenu Natif</span>
                    </label>
                    <label className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-colors ${courseType === 'package' ? 'border-2 border-primary bg-primary/5' : 'border border-slate-200 bg-slate-50 hover:bg-slate-50'}`}>
                      <input type="radio" name="type" value="package" checked={courseType === 'package'} onChange={(e) => setCourseType(e.target.value)} className="text-primary focus:ring-primary w-4 h-4" />
                      <span className="text-slate-900 font-bold text-sm">📦 Dossier ZIP</span>
                    </label>
                    <label className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-colors ${courseType === 'external' ? 'border-2 border-primary bg-primary/5' : 'border border-slate-200 bg-slate-50 hover:bg-slate-50'}`}>
                      <input type="radio" name="type" value="external" checked={courseType === 'external'} onChange={(e) => setCourseType(e.target.value)} className="text-primary focus:ring-primary w-4 h-4" />
                      <span className="text-slate-900 font-bold text-sm">🔗 Lien Externe</span>
                    </label>
                  </div>
                </div>

                {/* Lien externe (Zoom, etc.) — visible seulement si type = external */}
                {courseType === 'external' && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Lien de session (Zoom, Meet, etc.)</label>
                    <input type="url" value={courseExternalLink} onChange={e => setCourseExternalLink(e.target.value)}
                      placeholder="https://zoom.us/j/123456789"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium font-mono focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                    <p className="text-xs text-slate-500 font-medium">Ce lien sera débloqué uniquement pour les apprenants ayant payé.</p>
                  </div>
                )}
              </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function CourseContent({ courseId, curriculum, courseType, onUpdate }: any) {
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [localCurriculum, setLocalCurriculum] = useState<any[]>([]);

  useEffect(() => {
    setLocalCurriculum(curriculum || []);
  }, [curriculum]);

  const { toast } = useToast();

  const handleAddModule = async () => {
    try {
      await createModule({
        id:          'm_' + Date.now(),
        course_id:   courseId,
        title:       'Nouveau module',
        description: '',
        order_index: localCurriculum.length,
      });
      onUpdate();
    } catch (err: any) {
      console.error('Erreur ajout module:', err);
      toast('error', 'Impossible d\'ajouter le module : ' + (err.message || 'Vérifiez le serveur'));
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!window.confirm('Supprimer ce module et toutes ses leçons définitivement ?')) return;
    try {
      await deleteModule(id);
      toast('success', 'Module supprimé avec succès');
      onUpdate();
    } catch (e: any) {
      toast('error', e.message || 'Erreur lors de la suppression du module');
    }
  };

  const handleUpdateModule = async (id: string, title: string, description: string) => {
    await updateModule(id, { title, description });
  };

  const handleLocalModuleChange = (moduleId: string, field: string, value: string) => {
    setLocalCurriculum(prev => prev.map(m => m.id === moduleId ? { ...m, [field]: value } : m));
  };

  const handleAddLesson = async (moduleId: string) => {
    try {
      const mod = localCurriculum.find((m: any) => m.id === moduleId);
      await createLesson({
        id:          'l_' + Date.now(),
        module_id:   moduleId,
        title:       'Nouveau contenu',
        description: '',
        type:        'video',
        duration:    '0 min',
        is_free:     false,
        content:     '',
        order_index: mod?.lessons?.length ?? 0,
      });
      onUpdate();
    } catch (err: any) {
      console.error('Erreur ajout leçon:', err);
      toast('error', 'Impossible d\'ajouter le contenu : ' + (err.message || 'Vérifiez le serveur'));
    }
  };

  const handleLocalLessonChange = (moduleId: string, lessonId: string, field: string, value: string) => {
    setLocalCurriculum(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        lessons: m.lessons?.map((l: any) => l.id === lessonId ? { ...l, [field]: value } : l)
      };
    }));
  };

  const handleUpdateLesson = async (l: any) => {
    await updateLesson(l.id, l);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Supprimer cette leçon définitivement ?')) return;
    try {
      await deleteLesson(lessonId);
      toast('success', 'Leçon supprimée avec succès');
      onUpdate();
    } catch (e: any) {
      toast('error', e.message || 'Erreur lors de la suppression de la leçon');
    }
  };

  return (
    <div className="premium-card p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Structure de la formation</h3>
          <p className="text-slate-500 font-medium text-sm mt-1">Organisez vos modules, leçons, textes, et vidéos.</p>
        </div>
        <button onClick={handleAddModule} className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-900 px-4 py-2.5 rounded-xl transition-colors font-bold shadow-sm">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Ajouter un module</span>
        </button>
      </div>

      <div className="space-y-6">
        {localCurriculum.map((module: any) => (
          <div key={module.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="p-5 flex flex-col space-y-3 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <input 
                  type="text" 
                  value={module.title}
                  onChange={(e) => handleLocalModuleChange(module.id, 'title', e.target.value)}
                  onBlur={(e) => handleUpdateModule(module.id, e.target.value, module.description)}
                  className="font-bold text-lg text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 flex-1 placeholder-slate-400" 
                  placeholder="Titre du module"
                />
                <button onClick={() => handleDeleteModule(module.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
              </div>
              <textarea 
                value={module.description}
                onChange={(e) => handleLocalModuleChange(module.id, 'description', e.target.value)}
                onBlur={(e) => handleUpdateModule(module.id, module.title, e.target.value)}
                placeholder="Description du module. Quels sont les objectifs ?"
                className="w-full text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-4 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                rows={2}
              />
            </div>
            
            <div className="p-3 space-y-2">
              {module.lessons?.map((lesson: any) => (
                <div key={lesson.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                  <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)}>
                    <div className="flex items-center space-x-3 flex-1">
                      {lesson.type === 'video' ? <Video className="w-5 h-5 text-primary" /> : lesson.type === 'audio' ? <Headphones className="w-5 h-5 text-amber-500" /> : <FileText className="w-5 h-5 text-emerald-600" />}
                      <span className="text-sm font-bold text-slate-900">{lesson.title}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{lesson.duration}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedLessonId === lesson.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-slate-200 p-5 bg-slate-50 space-y-5">
                        <LessonEditor 
                          lesson={lesson} 
                          moduleId={module.id} 
                          handleLocalLessonChange={handleLocalLessonChange} 
                          handleUpdateLesson={handleUpdateLesson} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <button onClick={() => handleAddLesson(module.id)} className="w-full py-3 flex items-center justify-center space-x-2 text-sm font-bold text-slate-500 hover:text-primary hover:bg-primary/5 hover:border-primary/30 rounded-lg border-2 border-dashed border-slate-200 transition-colors mt-2">
                <Plus className="w-4 h-4" />
                <span>Ajouter un chapitre / contenu</span>
              </button>
            </div>
          </div>
        ))}
        {localCurriculum.length === 0 && (
          <div className="text-center py-16 text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            Aucun module. Cliquez sur "Ajouter un module" pour construire votre formation de A à Z.
          </div>
        )}
      </div>
    </div>
  );
}

function CourseStats({ stats }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="Visites de la page" value={stats.visits} icon={Eye} color="text-primary" bg="bg-primary/10" />
      <StatCard title="Inscrits Gratuits (Prospects)" value={stats.freeSignups} icon={Users} color="text-amber-500" bg="bg-amber-50" />
      <StatCard title="Inscrits Payants" value={stats.paidSignups} icon={CreditCard} color="text-emerald-500" bg="bg-emerald-50" />
      <StatCard title="Revenus Générés" value={stats.revenue} icon={BarChart} color="text-blue-500" bg="bg-blue-500/10" />
      <StatCard title="Taux de Conversion" value={stats.conversionRate} icon={Filter} color="text-purple-500" bg="bg-purple-50" />
      <StatCard title="Mentions J'aime" value={stats.likes} icon={Heart} color="text-pink-500" bg="bg-pink-50" />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="premium-card p-6 flex items-center space-x-5">
      <div className={`p-4 rounded-xl ${bg}`}><Icon className={`w-8 h-8 ${color}`} /></div>
      <div>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-heading font-extrabold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

function CourseStudents({ courseId }: any) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../../services/api').then(({ getStudentsByCourse }) => {
      getStudentsByCourse(courseId)
        .then((data: any[]) => { setStudents(data); setLoading(false); })
        .catch(() => setLoading(false));
    });
  }, [courseId]);

  if (loading) return <div className="premium-card p-12 text-center text-slate-500 font-medium animate-pulse">Chargement...</div>;

  if (students.length === 0) return (
    <div className="premium-card p-12 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200">
      Aucun apprenant inscrit à cette formation.
    </div>
  );

  return (
    <div className="premium-card p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Apprenants de cette formation ({students.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tl-xl">Nom</th>
              <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Téléphone</th>
              <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
              <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Montant</th>
              <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tr-xl">Lien d'accès</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s: any) => (
              <tr key={s.enrollment_id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4 text-slate-900 font-bold">{s.name}</td>
                <td className="py-4 px-4 text-slate-600 font-medium">{s.phone}</td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    s.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>{s.status === 'paid' ? 'Payé' : 'Prospect'}</span>
                </td>
                <td className="py-4 px-4 text-slate-900 font-extrabold">{s.price}</td>
                <td className="py-4 px-4 font-mono text-xs text-primary font-semibold">
                  {s.access_token ? (
                    <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/access/${s.access_token}`)} className="hover:text-blue-600 transition-colors underline underline-offset-4 flex items-center gap-1">
                      <Copy className="w-3.5 h-3.5" /> Copier le lien
                    </button>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LessonEditor({ lesson, moduleId, handleLocalLessonChange, handleUpdateLesson, onDelete }: any) {
  const [contentMode, setContentMode] = useState<'upload' | 'link'>(lesson.content?.startsWith('/uploads/') ? 'upload' : 'link');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setIsUploading(true);
    try {
      const { uploadFile } = await import('../../services/api');
      const res = await uploadFile(file);
      handleLocalLessonChange(moduleId, lesson.id, 'content', res.url);
      handleUpdateLesson({ ...lesson, content: res.url });
    } catch(err) {
      console.error(err);
      window.alert('Erreur lors de l\'upload : ' + (err instanceof Error ? err.message : err));
    }
    setIsUploading(false);
  };

  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="col-span-2 md:col-span-1">
        <label className="text-xs font-bold text-slate-900 mb-1.5 block uppercase tracking-wider">Titre de la leçon</label>
        <input type="text" value={lesson.title} onChange={(e) => handleLocalLessonChange(moduleId, lesson.id, 'title', e.target.value)} onBlur={() => handleUpdateLesson(lesson)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
      </div>
      <div className="col-span-2 md:col-span-1 flex space-x-4">
        <div className="flex-1">
          <label className="text-xs font-bold text-slate-900 mb-1.5 block uppercase tracking-wider">Format du contenu</label>
          <select value={lesson.type} onChange={(e) => handleLocalLessonChange(moduleId, lesson.id, 'type', e.target.value)} onBlur={() => handleUpdateLesson(lesson)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none cursor-pointer">
            <option value="video">🎬 Vidéo (.mp4, .mov)</option>
            <option value="pdf">📄 Document PDF</option>
            <option value="audio">🎵 Audio (.mp3, .wav)</option>
            <option value="text">📝 Texte / Article</option>
            <option value="image">🖼️ Image</option>
            <option value="link">🔗 Lien externe</option>
          </select>
        </div>
        <div className="w-24">
          <label className="text-xs font-bold text-slate-900 mb-1.5 block uppercase tracking-wider">Durée</label>
          <input type="text" value={lesson.duration} onChange={(e) => handleLocalLessonChange(moduleId, lesson.id, 'duration', e.target.value)} onBlur={() => handleUpdateLesson(lesson)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-center" />
        </div>
        <div className="flex flex-col items-center justify-center pt-5">
          <label className="text-xs font-bold text-slate-900 mb-1.5 block whitespace-nowrap uppercase tracking-wider">Gratuit ?</label>
          <button
            type="button"
            onClick={() => {
              const newVal = !lesson.is_free;
              handleLocalLessonChange(moduleId, lesson.id, 'is_free', newVal as any);
              handleUpdateLesson({ ...lesson, is_free: newVal });
            }}
            className={`w-12 h-6 rounded-full transition-colors duration-200 relative shadow-inner ${
              lesson.is_free ? 'bg-emerald-500' : 'bg-slate-100'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              lesson.is_free ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      <div className="col-span-2">
        <label className="text-xs font-bold text-slate-900 mb-1.5 block uppercase tracking-wider">Détails / Instructions</label>
        <textarea value={lesson.description} onChange={(e) => handleLocalLessonChange(moduleId, lesson.id, 'description', e.target.value)} onBlur={() => handleUpdateLesson(lesson)} placeholder="Ajoutez un texte explicatif..." rows={3} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-y" />
      </div>

      <div className="col-span-2">
        {/* Éditeur de texte riche pour le type 'text' */}
        {lesson.type === 'text' ? (
          <div>
            <label className="text-xs font-bold text-slate-900 mb-1.5 block uppercase tracking-wider">Contenu Texte / Article</label>
            <textarea
              value={lesson.content}
              onChange={(e) => handleLocalLessonChange(moduleId, lesson.id, 'content', e.target.value)}
              onBlur={() => handleUpdateLesson(lesson)}
              placeholder="Rédigez ici votre contenu texte, article ou transcription..."
              rows={10}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-y"
            />
          </div>
        ) : lesson.type === 'link' ? (
          <div>
            <label className="text-xs font-bold text-slate-900 mb-1.5 block uppercase tracking-wider">URL du lien externe</label>
            <input
              type="url"
              value={lesson.content}
              onChange={(e) => handleLocalLessonChange(moduleId, lesson.id, 'content', e.target.value)}
              onBlur={() => handleUpdateLesson(lesson)}
              placeholder="https://zoom.us/j/... ou https://drive.google.com/..."
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-primary font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            {lesson.content && (
              <a href={lesson.content} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 text-xs text-primary font-bold hover:underline">
                <Globe className="w-3.5 h-3.5" /> Tester le lien
              </a>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-900 block uppercase tracking-wider">Source du contenu</label>
              <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200 shadow-sm">
                <button onClick={() => setContentMode('upload')} className={`px-4 py-1.5 text-xs rounded-md font-bold transition-colors ${contentMode === 'upload' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-900'}`}>⬆ Importer Fichier</button>
                <button onClick={() => setContentMode('link')} className={`px-4 py-1.5 text-xs rounded-md font-bold transition-colors ${contentMode === 'link' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-900'}`}>🔗 URL Directe</button>
              </div>
            </div>

            {contentMode === 'link' ? (
              <input type="text" value={lesson.content} onChange={(e) => handleLocalLessonChange(moduleId, lesson.id, 'content', e.target.value)} onBlur={() => handleUpdateLesson(lesson)} placeholder="https://..." className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-center text-primary font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 flex flex-col items-center justify-center relative hover:border-primary hover:bg-primary/5 transition-all group">
                {isUploading ? (
                  <div className="text-sm font-bold text-primary animate-pulse">Importation en cours...</div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-primary mb-3 transition-colors" />
                    <span className="text-sm font-bold text-slate-900 mb-1">Cliquer pour importer un fichier</span>
                    <span className="text-xs font-medium text-slate-500 mb-4">
                      {lesson.type === 'video' ? 'MP4, MOV, AVI — max 500 MB' :
                       lesson.type === 'pdf'   ? 'Fichier PDF' :
                       lesson.type === 'audio' ? 'MP3, WAV' :
                       lesson.type === 'image' ? 'JPG, PNG, WebP, GIF' : 'Tout format'}
                    </span>
                    {lesson.content && lesson.content.startsWith('/uploads/') && (
                      <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg text-xs flex items-center space-x-2 font-bold shadow-sm mb-3">
                        <CheckCircle className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{lesson.content.split('/').pop()}</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept={
                        lesson.type === 'video' ? 'video/*' :
                        lesson.type === 'pdf'   ? 'application/pdf' :
                        lesson.type === 'audio' ? 'audio/*' :
                        lesson.type === 'image' ? 'image/*' : '*/*'
                      }
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, Eye, EyeOff,
  PlayCircle, Download, Link as LinkIcon,
  MoreVertical, X, CheckCircle, AlertTriangle, ChevronDown
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCourses, createCourse, deleteCourse, updateCourse } from '../../services/api';

/* ── Confirmation modal ──────────────────────── */
function ConfirmModal({
  title, message, onConfirm, onCancel
}: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(4,13,28,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}>
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md p-7 rounded-2xl shadow-2xl"
        style={{ background: '#0d2347', border: '1px solid rgba(239,68,68,0.3)' }}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.12)' }}>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm" style={{ color: 'rgba(248,250,252,0.6)' }}>{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' }}>
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-900 transition-colors"
            style={{ background: '#ef4444' }}>
            Supprimer définitivement
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── 3-dot dropdown ──────────────────────────── */
function CourseMenu({
  course, onDelete, onToggleStatus, onEdit
}: { course: any; onDelete: () => void; onToggleStatus: () => void; onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className="p-2 rounded-lg transition-colors"
        style={{ color: open ? '#dcb32f' : 'rgba(15,23,42,0.35)', background: open ? 'rgba(220,179,47,0.1)' : 'transparent' }}>
        <MoreVertical className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-48 rounded-xl shadow-2xl z-30 overflow-hidden"
            style={{ background: '#0d2347', border: '1px solid rgba(15,23,42,0.1)' }}>

            {/* Modifier */}
            <button
              onClick={() => { setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-colors"
              style={{ color: '#f8fafc' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <Edit className="w-4 h-4" style={{ color: '#dcb32f' }} />
              Modifier
            </button>

            {/* Publier / Masquer */}
            <button
              onClick={() => { setOpen(false); onToggleStatus(); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-colors"
              style={{ color: '#f8fafc' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {course.status === 'published'
                ? <><EyeOff className="w-4 h-4 text-amber-600" /> Masquer</>
                : <><Eye className="w-4 h-4 text-green-400" /> Publier</>}
            </button>

            {/* Séparateur */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '2px 0' }} />

            {/* Supprimer */}
            <button
              onClick={() => { setOpen(false); onDelete(); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-colors text-red-400"
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main component ──────────────────────────── */
export default function AdminCourses() {
  const [courses, setCourses]           = useState<any[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete]         = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string; type: 'success'|'error'} | null>(null);

  // Create modal state
  const [modalTitle, setModalTitle]         = useState('');
  const [modalPrice, setModalPrice]         = useState('');
  const [modalCourseType, setModalCourseType] = useState('native');

  const navigate = useNavigate();

  /* Show toast */
  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      setCourses(await getCourses());
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  /* Create */
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;
    const id = 'c_' + Date.now();
    try {
      await createCourse({
        id, title: modalTitle, description: '',
        price: (modalPrice.trim() || '0') + ' FCFA',
        type: modalCourseType, status: 'draft', category: 'Général'
      });
      setIsCreateModalOpen(false);
      navigate(`/admin/courses/${id}`);
    } catch (err: any) {
      showToast(err.message ?? 'Erreur lors de la création', 'error');
    }
  };

  /* Delete (triggered from confirm modal) */
  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    try {
      await deleteCourse(confirmDelete);
      showToast('Formation supprimée avec succès');
      fetchCourses();
    } catch (err: any) {
      showToast(err.message ?? 'Erreur lors de la suppression', 'error');
    }
    setConfirmDelete(null);
  };

  /* Toggle publish/draft */
  const handleToggleStatus = async (course: any) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    try {
      await updateCourse(course.id, { ...course, status: newStatus });
      showToast(newStatus === 'published' ? 'Formation publiée !' : 'Formation masquée');
      fetchCourses();
    } catch (err: any) {
      showToast(err.message ?? 'Erreur lors de la mise à jour', 'error');
    }
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl font-semibold text-sm"
            style={{
              background: toast.type === 'success' ? '#0d2347' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.4)'}`,
              color: toast.type === 'success' ? '#34d399' : '#f87171'
            }}>
            {toast.type === 'success'
              ? <CheckCircle className="w-4 h-4" />
              : <AlertTriangle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Vos Formations</h2>
          <p className="mt-1 text-sm" style={{ color: 'rgba(248,250,252,0.45)' }}>
            Gérez votre catalogue, vos prix et le contenu de vos offres.
          </p>
        </div>
        <motion.button
          onClick={() => setIsCreateModalOpen(true)}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="btn-gold flex items-center gap-2 py-3 px-6">
          <Plus className="w-4 h-4" />
          Nouvelle Formation
        </motion.button>
      </div>

      {/* Table card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#040d1c', border: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(248,250,252,0.3)' }} />
            <input
              type="text" placeholder="Rechercher une formation..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="input-dark w-full pl-11 pr-4 py-2.5 rounded-xl text-sm" />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'published', 'draft'].map(s => (
              <button key={s}
                onClick={() => setStatusFilter(s)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-200"
                style={statusFilter === s
                  ? { background: '#dcb32f', color: '#071529' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(248,250,252,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {s === 'all' ? 'Tous' : s === 'published' ? 'Publiés' : 'Brouillons'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 text-center text-sm animate-pulse" style={{ color: 'rgba(248,250,252,0.35)' }}>
              Chargement…
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Formation', 'Type', 'Statut', 'Prix', 'Visites', 'Actions'].map(h => (
                    <th key={h}
                      className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'rgba(248,250,252,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(course => (
                  <tr key={course.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                    {/* Title */}
                    <td className="py-4 px-5">
                      <Link to={`/admin/courses/${course.id}`}
                        className="font-bold text-white text-sm transition-colors"
                        style={{ textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#dcb32f')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#f8fafc')}>
                        {course.title}
                      </Link>
                    </td>

                    {/* Type */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(248,250,252,0.55)' }}>
                        {course.type === 'native'   && <><PlayCircle className="w-3.5 h-3.5 text-blue-400" /> Natif</> }
                        {course.type === 'package'  && <><Download   className="w-3.5 h-3.5 text-amber-400" /> Package</> }
                        {course.type === 'external' && <><LinkIcon   className="w-3.5 h-3.5 text-green-400" /> Externe</> }
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-5">
                      {course.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                          <Eye className="w-3 h-3" /> Publié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(248,250,252,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <EyeOff className="w-3 h-3" /> Brouillon
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-5">
                      <span className="font-bold text-sm" style={{ color: '#dcb32f' }}>{course.price}</span>
                    </td>

                    {/* Visits */}
                    <td className="py-4 px-5 text-sm" style={{ color: 'rgba(248,250,252,0.5)' }}>
                      {course.visits || 0}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1">
                        {/* Edit shortcut */}
                        <Link to={`/admin/courses/${course.id}`}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: 'rgba(248,250,252,0.35)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#dcb32f'; (e.currentTarget as HTMLElement).style.background = 'rgba(220,179,47,0.08)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(248,250,252,0.35)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete shortcut */}
                        <button
                          onClick={() => setConfirmDelete(course.id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: 'rgba(248,250,252,0.35)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(248,250,252,0.35)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* 3-dot menu */}
                        <CourseMenu
                          course={course}
                          onEdit={() => navigate(`/admin/courses/${course.id}`)}
                          onDelete={() => setConfirmDelete(course.id)}
                          onToggleStatus={() => handleToggleStatus(course)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm" style={{ color: 'rgba(248,250,252,0.35)' }}>
                      Aucune formation trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Confirm delete modal ── */}
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmModal
            title="Supprimer la formation ?"
            message="Cette action est irréversible. Tout le contenu, les modules et les leçons associés seront définitivement supprimés."
            onConfirm={handleDeleteConfirmed}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Create course modal ── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(4,13,28,0.8)', backdropFilter: 'blur(6px)' }}
            onClick={() => setIsCreateModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="p-8 max-w-xl w-full rounded-2xl shadow-2xl"
              style={{ background: '#0d2347', border: '1px solid rgba(220,179,47,0.2)' }}>

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-extrabold text-white">Créer une nouvelle formation</h3>
                  <p className="text-sm mt-1" style={{ color: 'rgba(248,250,252,0.45)' }}>
                    Initialisez la fiche descriptive de votre nouvelle offre.
                  </p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 rounded-full transition-colors"
                  style={{ color: 'rgba(248,250,252,0.5)', background: 'rgba(255,255,255,0.06)' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="text-sm font-bold text-slate-200 block mb-2">Titre de la formation *</label>
                  <input
                    value={modalTitle} onChange={e => setModalTitle(e.target.value)}
                    placeholder="Ex: Leadership & Gouvernance Publique"
                    className="input-dark w-full rounded-xl px-4 py-3" required />
                </div>

                {/* Type */}
                <div>
                  <label className="text-sm font-bold text-slate-200 block mb-3">Type de distribution</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'native',   label: 'Natif (Vidéos)' },
                      { value: 'package',  label: 'Dossier ZIP/PDF' },
                      { value: 'external', label: 'Externe (Zoom)' },
                    ].map(opt => (
                      <label key={opt.value}
                        className="flex items-center gap-2.5 p-3.5 rounded-xl cursor-pointer transition-all text-sm font-semibold"
                        style={modalCourseType === opt.value
                          ? { border: '2px solid #dcb32f', background: 'rgba(220,179,47,0.08)', color: '#dcb32f' }
                          : { border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'rgba(248,250,252,0.6)' }}>
                        <input type="radio" name="type" value={opt.value}
                          checked={modalCourseType === opt.value}
                          onChange={e => setModalCourseType(e.target.value)}
                          className="sr-only" />
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                          style={{ borderColor: modalCourseType === opt.value ? '#dcb32f' : 'rgba(255,255,255,0.2)' }}>
                          {modalCourseType === opt.value && (
                            <div className="w-2 h-2 rounded-full" style={{ background: '#dcb32f' }} />
                          )}
                        </div>
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="text-sm font-bold text-slate-200 block mb-2">Prix (FCFA)</label>
                  <input type="number" value={modalPrice} onChange={e => setModalPrice(e.target.value)}
                    placeholder="Ex: 150000"
                    className="input-dark w-full rounded-xl px-4 py-3 font-bold" />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button type="button" onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' }}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-gold py-2.5 px-6 flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" />
                    Créer la formation
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

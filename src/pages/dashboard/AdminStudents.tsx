import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Download, ChevronDown, ChevronRight,
  Copy, Check, Phone, BookOpen, Loader2, MessageCircle
} from 'lucide-react';
import { getStudents, getStudentsExportUrl, validatePayment } from '../../services/api';
import { useToast } from '../../components/Toast';

interface Enrollment {
  enrollment_id: string; course_id: string; course_title: string; status: string;
  price: string; joined_at: string; access_token: string | null; access_url: string | null;
}
interface Student {
  id: string; name: string; phone: string; created_at: string;
  status: 'paid' | 'prospect'; total_spent: string;
  courses_count: number; enrollments: Enrollment[];
}

export default function AdminStudents() {
  const { toast } = useToast();
  const [students, setStudents]   = useState<Student[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<'all' | 'paid' | 'prospect'>('all');
  const [expanded, setExpanded]   = useState<Record<string, boolean>>({});
  const [copied, setCopied]       = useState<Record<string, boolean>>({});

  useEffect(() => {
    getStudents()
      .then(setStudents)
      .catch(() => toast('error', 'Impossible de charger les apprenants'))
      .finally(() => setLoading(false));
  }, []);

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(p => ({ ...p, [id]: true }));
    toast('success', 'Lien copié dans le presse-papiers');
    setTimeout(() => setCopied(p => ({ ...p, [id]: false })), 3000);
  };

  const handleValidatePayment = async (studentId: string, enrollmentId: string) => {
    try {
      const res = await validatePayment(enrollmentId);
      toast('success', res.message);
      
      // Update local state to reflect the paid status and new access_url
      setStudents(prev => prev.map(s => {
        if (s.id !== studentId) return s;
        let newStatus = s.status;
        const newEnrollments = s.enrollments.map(e => {
          if (e.enrollment_id === enrollmentId) {
            newStatus = 'paid';
            return { ...e, status: 'paid', access_token: res.access_token, access_url: res.access_url };
          }
          return e;
        });
        return { ...s, status: newStatus, enrollments: newEnrollments };
      }));
    } catch (e: any) {
      toast('error', e.message || 'Erreur lors de la validation');
    }
  };



  const filtered = students.filter(s => {
    const matchFilter = filter === 'all' || s.status === filter;
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);
    return matchFilter && matchSearch;
  });

  const paid     = students.filter(s => s.status === 'paid').length;
  const prospect = students.filter(s => s.status === 'prospect').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-extrabold text-white">Apprenants &amp; CRM</h2>
          <p className="mt-1 font-medium" style={{ color: 'rgba(248,250,252,0.45)' }}>
            <span style={{ color: '#34d399' }} className="font-bold">{paid} payants</span>
            {' · '}
            <span style={{ color: '#f59e0b' }} className="font-bold">{prospect} prospects</span>
          </p>
        </div>
        <motion.a
          href={getStudentsExportUrl()}
          download
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' }}
        >
          <Download className="w-4 h-4" style={{ color: 'rgba(248,250,252,0.45)' }} /> Exporter CSV
        </motion.a>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(248,250,252,0.35)' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou téléphone..."
            className="input-dark w-full rounded-xl pl-12 pr-4 py-3 text-sm"
          />
        </div>
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
        >
          {(['all', 'paid', 'prospect'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-5 py-3 text-sm font-bold transition-colors"
              style={{
                borderRight: '1px solid rgba(255,255,255,0.08)',
                ...(filter === f
                  ? { background: 'rgba(255,199,44,0.1)', color: '#FFC72C' }
                  : { background: 'transparent', color: 'rgba(248,250,252,0.5)' }
                )
              }}
            >
              {f === 'all' ? 'Tous' : f === 'paid' ? '💳 Payants' : '👤 Prospects'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="p-12 text-center rounded-2xl"
          style={{ border: '2px dashed rgba(16,36,26,0.12)', background: 'rgba(255,255,255,0.02)' }}
        >
          <Users className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(248,250,252,0.2)' }} />
          <p className="font-medium" style={{ color: 'rgba(248,250,252,0.45)' }}>Aucun apprenant trouvé</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(s => (
            <div
              key={s.id}
              className="dashboard-card overflow-hidden transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Ligne principale */}
              <div className="flex items-center gap-4 p-5">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,199,44,0.15)', border: '1px solid rgba(255,199,44,0.2)' }}
                >
                  <span className="font-bold text-sm" style={{ color: '#FFC72C' }}>
                    {s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-white truncate text-lg">{s.name}</p>
                  <div className="flex items-center gap-2 text-sm font-medium mt-0.5" style={{ color: 'rgba(248,250,252,0.45)' }}>
                    <Phone className="w-3.5 h-3.5" />
                    <span>{s.phone}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-8 text-sm">
                  <div className="text-center">
                    <p className="text-white font-extrabold">{s.courses_count}</p>
                    <p className="font-medium text-xs uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.35)' }}>formation{s.courses_count > 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-extrabold" style={{ color: '#34d399' }}>{s.total_spent}</p>
                    <p className="font-medium text-xs uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.35)' }}>dépensé</p>
                  </div>
                </div>

                {/* Badge statut */}
                <span
                  className="shrink-0 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider"
                  style={
                    s.status === 'paid'
                      ? { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }
                      : { background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }
                  }
                >
                  {s.status === 'paid' ? '✓ Payant' : '◎ Prospect'}
                </span>

                {/* Expand */}
                <button
                  onClick={() => setExpanded(p => ({ ...p, [s.id]: !p[s.id] }))}
                  className="shrink-0 transition-colors p-2 rounded-full"
                  style={{ color: 'rgba(248,250,252,0.35)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FFC72C'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,199,44,0.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(185,214,198,0.35)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {expanded[s.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>

              {/* Détail formations + liens */}
              <AnimatePresence>
                {expanded[s.id] && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden"
                    style={{ borderTop: '1px solid rgba(15,23,42,0.06)', background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div className="p-5 space-y-3">
                      {(!s.enrollments || s.enrollments.length === 0) && (
                        <p className="text-sm text-center py-4" style={{ color: 'rgba(248,250,252,0.35)' }}>Aucune formation associée.</p>
                      )}
                      {(s.enrollments || []).map((enr: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl transition-colors"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,199,44,0.1)' }}>
                               <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-bold text-sm truncate">{enr.course_title}</p>
                              <p className="font-medium text-xs mt-0.5" style={{ color: 'rgba(248,250,252,0.45)' }}>{enr.price} · {new Date(enr.joined_at).toLocaleDateString('fr-FR')}</p>
                            </div>
                          </div>

                          {enr.status === 'paid' && enr.access_url && (
                            <div className="mt-3 sm:mt-0 flex flex-col items-end gap-2 shrink-0">
                              <div className="flex items-center gap-2 max-w-[250px] sm:max-w-xs">
                                <input 
                                  readOnly
                                  value={enr.access_url}
                                  className="text-xs bg-black/20 border border-white/10 rounded-md px-2 py-1.5 text-white/70 w-full focus:outline-none"
                                  onClick={(e) => (e.target as HTMLInputElement).select()}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <motion.a
                                  href={`https://wa.me/${s.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${s.name}, voici votre lien personnel d'accès pour la formation "${enr.course_title}" : ${enr.access_url}`)}`}
                                  target="_blank" rel="noopener noreferrer"
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                >
                                  <MessageCircle className="w-4 h-4" /> Envoyer
                                </motion.a>
                                <motion.button
                                  onClick={() => copyLink(enr.access_url!, `${s.id}-${idx}`)}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                                  style={
                                    copied[`${s.id}-${idx}`]
                                      ? { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }
                                      : { background: 'rgba(255,255,255,0.06)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.08)' }
                                  }
                                >
                                  {copied[`${s.id}-${idx}`] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" style={{ color: 'rgba(248,250,252,0.45)' }} />}
                                  Copier
                                </motion.button>
                              </div>
                            </div>
                          )}

                          {enr.status === 'prospect' && (
                            <div className="flex flex-col items-end gap-2 shrink-0 mt-3 sm:mt-0">
                              <span
                                className="text-xs px-3 py-1.5 rounded-lg font-bold"
                                style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
                              >
                                Paiement en attente
                              </span>
                              <button
                                onClick={() => handleValidatePayment(s.id, enr.enrollment_id)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-[#FFC72C]/20 hover:bg-[#FFC72C]/30 text-[#FFC72C] border border-[#FFC72C]/30"
                              >
                                <Check className="w-4 h-4" /> Forcer paiement & Générer lien
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, CreditCard, Eye, TrendingUp, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStats, getChartData, getTopCourses } from '../../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16,1,0.3,1] } },
};

export default function Overview() {
  const [timeRange, setTimeRange] = useState('7j');
  const [stats,     setStats]     = useState<any>({ totalRevenue: '0 FCFA', paidStudents: 0, prospects: 0, uniqueVisitors: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    Promise.all([getStats(timeRange), getChartData(timeRange), getTopCourses()])
      .then(([s, c, t]) => {
        setStats(s);
        setChartData(Array.isArray(c) ? c : []);
        setTopCourses(Array.isArray(t) ? t : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAll(true);
    const interval = setInterval(() => fetchAll(false), 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Vue d'ensemble</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(248,250,252,0.45)' }}>
            Suivez les performances de vos formations en temps réel.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {['24h', '7j', '30j', '90j', 'Tous'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className="px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200"
              style={timeRange === range
                ? { background: '#dcb32f', color: '#071529' }
                : { color: 'rgba(248,250,252,0.5)' }}>
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <motion.div
        variants={containerVariants}
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 transition-opacity ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
        <KpiCard title="Revenus Totaux"     value={stats.totalRevenue}    icon={CreditCard} accent="#dcb32f" delay={0.05} />
        <KpiCard title="Inscriptions Payées" value={stats.paidStudents}   icon={Users}      accent="#34d399" delay={0.1}  />
        <KpiCard title="Prospects"           value={stats.prospects}       icon={Filter}     accent="#60a5fa" delay={0.15} />
        <KpiCard title="Visiteurs Uniques"   value={stats.uniqueVisitors}  icon={Eye}        accent="#a78bfa" delay={0.2}  />
      </motion.div>

      {/* ── Chart + Top courses ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area chart */}
        <motion.div
          variants={itemVariants}
          className={`lg:col-span-2 rounded-2xl p-6 transition-opacity ${isLoading ? 'opacity-60' : 'opacity-100'}`}
          style={{ background: '#040d1c', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-white">Évolution des métriques</h3>
              <div className="flex gap-4 mt-2">
                {[
                  { label: 'Revenus',   color: '#dcb32f' },
                  { label: 'Prospects', color: '#60a5fa' },
                  { label: 'Visiteurs', color: '#34d399' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                    <span className="text-xs font-medium" style={{ color: 'rgba(248,250,252,0.5)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              style={{ color: '#dcb32f', background: 'rgba(220,179,47,0.08)', border: '1px solid rgba(220,179,47,0.15)' }}>
              <TrendingUp className="w-3.5 h-3.5" />
              Rapport
            </button>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#dcb32f" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#dcb32f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gProspects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#34d399" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(248,250,252,0.25)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left"  stroke="rgba(248,250,252,0.25)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v.toLocaleString()} F`} />
                <YAxis yAxisId="right" orientation="right" stroke="rgba(248,250,252,0.25)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0d2347', border: '1px solid rgba(220,179,47,0.2)', borderRadius: '12px', color: '#f8fafc', fontSize: '13px' }}
                  itemStyle={{ color: '#f8fafc' }}
                  labelStyle={{ color: '#dcb32f', fontWeight: 700 }}
                />
                <Area yAxisId="left"  type="monotone" dataKey="revenue"   name="Revenus (FCFA)" stroke="#dcb32f" strokeWidth={2} fillOpacity={1} fill="url(#gRevenue)" />
                <Area yAxisId="right" type="monotone" dataKey="visitors"  name="Visiteurs"      stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#gVisitors)" />
                <Area yAxisId="right" type="monotone" dataKey="prospects" name="Prospects"      stroke="#60a5fa" strokeWidth={2} fillOpacity={1} fill="url(#gProspects)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top courses */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6"
          style={{ background: '#040d1c', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white">Top Formations</h3>
            <span className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(220,179,47,0.1)', color: '#dcb32f' }}>
              Vues
            </span>
          </div>
          <div className="space-y-2">
            {topCourses.length === 0 && (
              <p className="text-sm py-8 text-center" style={{ color: 'rgba(248,250,252,0.3)' }}>
                Aucune formation disponible.
              </p>
            )}
            {topCourses.map((c, i) => (
              <div key={i}
                className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 group"
                style={{ border: '1px solid transparent' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: 'rgba(220,179,47,0.12)', color: '#dcb32f' }}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(248,250,252,0.4)' }}>
                      {(c.visits ?? 0).toLocaleString()} visites
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── KPI Card ────────────────────────────────────── */
function KpiCard({ title, value, icon: Icon, accent, delay }: any) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 25 },
        show:   { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.16,1,0.3,1] } },
      }}
      whileHover={{ y: -5, scale: 1.01 }}
      className="p-6 rounded-2xl relative overflow-hidden"
      style={{ background: '#040d1c', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-6 right-6 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }} />

      <div className="flex justify-between items-start mb-5">
        <p className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'rgba(248,250,252,0.45)' }}>
          {title}
        </p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18` }}>
          <Icon className="w-4.5 h-4.5" style={{ color: accent, width: '1.1rem', height: '1.1rem' }} />
        </div>
      </div>
      <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
    </motion.div>
  );
}

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, CreditCard, Eye, TrendingUp, Filter, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStats, getChartData, getTopCourses } from '../../services/api';

const COLORS = {
  yellow: '#FFC72C',
  green:  '#22C55E',
  red:    '#F87171',
};

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
          <h2 className="text-2xl font-heading font-extrabold text-white tracking-tight">Vue d'ensemble</h2>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>
            Les performances de vos formations en temps réel — actualisé toutes les 30 s.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 p-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
          {['24h', '7j', '30j', '90j', 'Tous'].map(range => (
            <motion.button
              key={range}
              whileTap={{ scale: 0.92 }}
              onClick={() => setTimeRange(range)}
              className="px-4 py-2 text-xs font-bold rounded-full transition-all duration-200"
              style={timeRange === range
                ? { background: COLORS.yellow, color: '#04180F', boxShadow: '0 3px 0 rgba(255,199,44,.3)' }
                : { color: 'var(--text-muted)' }}>
              {range}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <motion.div
        variants={containerVariants}
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 transition-opacity ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
        <KpiCard title="Revenus Totaux"     value={stats.totalRevenue}   icon={CreditCard} accent={COLORS.yellow} delay={0.05} />
        <KpiCard title="Inscriptions Payées" value={stats.paidStudents}  icon={Users}      accent={COLORS.green}  delay={0.1}  />
        <KpiCard title="Prospects"           value={stats.prospects}     icon={Filter}     accent={COLORS.red}    delay={0.15} />
        <KpiCard title="Visiteurs Uniques"   value={stats.uniqueVisitors} icon={Eye}       accent={COLORS.yellow} delay={0.2}  />
      </motion.div>

      {/* ── Chart + Top courses ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area chart */}
        <motion.div
          variants={itemVariants}
          className={`lg:col-span-2 rounded-3xl p-6 transition-opacity ${isLoading ? 'opacity-60' : 'opacity-100'}`}
          style={{ background: 'var(--green-950)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-bold text-white">Évolution des métriques</h3>
              <div className="flex gap-4 mt-2.5">
                {[
                  { label: 'Revenus',   color: COLORS.yellow },
                  { label: 'Prospects', color: COLORS.red },
                  { label: 'Visiteurs', color: COLORS.green },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <motion.button
              whileHover={{ y: -2 }}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full"
              style={{ color: COLORS.yellow, background: 'rgba(255,199,44,0.08)', border: '1px solid rgba(255,199,44,0.2)' }}>
              <TrendingUp className="w-3.5 h-3.5" />
              Rapport
            </motion.button>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={COLORS.yellow} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={COLORS.yellow} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gProspects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={COLORS.red} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={COLORS.red} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={COLORS.green} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(185,214,198,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left"  stroke="rgba(185,214,198,0.4)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v.toLocaleString()} F`} />
                <YAxis yAxisId="right" orientation="right" stroke="rgba(185,214,198,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--green-900)', border: '1px solid rgba(255,199,44,0.25)', borderRadius: '14px', color: '#F6FFF9', fontSize: '13px' }}
                  itemStyle={{ color: '#F6FFF9' }}
                  labelStyle={{ color: COLORS.yellow, fontWeight: 700 }}
                />
                <Area yAxisId="left"  type="monotone" dataKey="revenue"   name="Revenus (FCFA)" stroke={COLORS.yellow} strokeWidth={2.5} fillOpacity={1} fill="url(#gRevenue)" />
                <Area yAxisId="right" type="monotone" dataKey="visitors"  name="Visiteurs"      stroke={COLORS.green}  strokeWidth={2}   fillOpacity={1} fill="url(#gVisitors)" />
                <Area yAxisId="right" type="monotone" dataKey="prospects" name="Prospects"      stroke={COLORS.red}    strokeWidth={2}   fillOpacity={1} fill="url(#gProspects)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top courses */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-6"
          style={{ background: 'var(--green-950)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-white">Top Formations</h3>
            <span className="text-xs px-3 py-1 rounded-full font-bold"
              style={{ background: 'rgba(255,199,44,0.1)', color: COLORS.yellow }}>
              Vues
            </span>
          </div>
          <div className="space-y-2">
            {topCourses.length === 0 && (
              <p className="text-sm py-8 text-center font-medium" style={{ color: 'var(--text-muted)' }}>
                Aucune formation disponible.
              </p>
            )}
            {topCourses.map((c, i) => {
              const medal = i === 0 ? COLORS.yellow : i === 1 ? COLORS.green : COLORS.red;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 rounded-2xl transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: `${medal}22`, color: medal, border: `1.5px solid ${medal}55` }}>
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{c.title}</p>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                        {(c.visits ?? 0).toLocaleString()} visites
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Badge live */}
          <div className="mt-6 flex items-center gap-2 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: COLORS.green }} />
            <span className="text-xs font-bold" style={{ color: COLORS.green }}>Données en direct</span>
            <Zap className="w-3.5 h-3.5 ml-auto" style={{ color: COLORS.green }} />
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
        hidden: { opacity: 0, y: 25, rotate: -0.6 },
        show:   { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.7, delay, ease: [0.16,1,0.3,1] } },
      }}
      whileHover={{ y: -6, scale: 1.015 }}
      className="p-6 rounded-3xl relative overflow-hidden"
      style={{ background: 'var(--green-950)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Halo coloré */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: `${accent}14`, filter: 'blur(30px)' }} />

      <div className="flex justify-between items-start mb-5 relative">
        <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
          {title}
        </p>
        <motion.div
          whileHover={{ rotate: -8, scale: 1.1 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}1c`, border: `1px solid ${accent}33` }}>
          <Icon className="w-4.5 h-4.5" style={{ color: accent, width: '1.1rem', height: '1.1rem' }} />
        </motion.div>
      </div>
      <h3 className="text-3xl font-heading font-black text-white tracking-tight">{value}</h3>
    </motion.div>
  );
}

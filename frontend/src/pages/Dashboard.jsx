import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CountUpRaw from 'react-countup';
const CountUp = CountUpRaw.default || CountUpRaw;
import { FileCheck, AlertTriangle, TrendingUp, Users, PieChart as PieIcon, BarChart2, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import API from '../api/axios';

const STATUS_COLORS = { submitted: '#0d9488', pending: '#f59e0b', late: '#ef4444' };

const glassTooltipStyle = {
    contentStyle: {
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
        fontSize: '12px',
        color: '#f1f5f9',
    },
    itemStyle: { color: '#f1f5f9', fontWeight: '500' },
    labelStyle: { color: '#94a3b8', fontWeight: 'bold' }
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([API.get('/reports/stats'), API.get('/reports')])
            .then(([statsRes, reportsRes]) => {
                setStats(statsRes.data);
                setReports(reportsRes.data);
            })
            .catch((err) => console.error('Dashboard data load failed:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading || !stats) {
        return (
            <div className="space-y-8 max-w-6xl">
                <div className="flex flex-col gap-2">
                    <div className="h-9 w-48 bg-slate-900/40 border border-white/5 rounded-2xl animate-pulse" />
                    <div className="h-4 w-72 bg-slate-900/40 border border-white/5 rounded-2xl animate-pulse" />
                </div>
                <div className="h-20 bg-slate-900/40 border border-white/5 rounded-3xl animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 bg-slate-900/40 border border-white/5 rounded-3xl animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-slate-900/40 border border-white/5 rounded-3xl animate-pulse" />
                    <div className="h-80 bg-slate-900/40 border border-white/5 rounded-3xl animate-pulse" />
                </div>
            </div>
        );
    }

    // Build chart data from reports
    const statusCounts = { submitted: 0, pending: 0, late: 0 };
    reports.forEach((r) => statusCounts[r.status]++);
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    const projectWorkload = {};
    reports.forEach((r) => {
        const name = r.project?.name || 'General';
        projectWorkload[name] = (projectWorkload[name] || 0) + 1;
    });
    const workloadData = Object.entries(projectWorkload).map(([name, count]) => ({ name, count }));

    const trendMap = {};
    reports.forEach((r) => {
        const week = new Date(r.weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        trendMap[week] = (trendMap[week] || 0) + 1;
    });
    const trendData = Object.entries(trendMap).map(([week, count]) => ({ week, count }));

    const summaryCards = [
        { label: 'Compliance Rate', value: stats.complianceRate, suffix: '%', icon: TrendingUp, color: 'bg-teal-500/20 text-teal-400 border border-teal-500/30', featured: true },
        { label: 'Total Reports', value: stats.totalReports, icon: FileCheck, color: 'bg-brand-500/20 text-brand-400 border border-brand-500/30' },
        { label: 'Open Blockers', value: stats.openBlockers, icon: AlertTriangle, color: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
        { label: 'Pending Action', value: stats.pendingCount, icon: Users, color: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
    ];

    return (
        <div className="space-y-10 max-w-6xl">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400">Team Dashboard</h1>
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" /> Active Workspace
                        </span>
                    </div>
                    <p className="text-sm text-slate-400 font-medium mt-1.5">Review team compilation and project activity trendings</p>
                </div>
            </div>

            {/* Hero AI Status Banner - Signature SaaS Detail */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-5 rounded-3xl bg-gradient-to-r from-brand-600/25 to-teal-500/10 border border-brand-500/20 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg shadow-brand-500/5 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-brand-500/10 blur-[50px] pointer-events-none" />
                <div className="flex items-center gap-3.5 relative z-10">
                    <div className="p-3 bg-brand-500/20 text-brand-400 rounded-2xl border border-brand-500/30">
                        <TrendingUp size={22} className="animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-100">AI Weekly Insights</h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Your team's report submission rate is at <span className="text-teal-400 font-extrabold">{stats.complianceRate}%</span>. {stats.openBlockers > 0 ? `${stats.openBlockers} open blockers require management support.` : 'Zero critical roadblocks reported.'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/team-reports')}
                    className="glass-btn glass-btn-primary glass-btn-sm whitespace-nowrap hidden sm:flex shrink-0"
                >
                    Inspect Logs
                </button>
            </motion.div>

            {/* Summary cards with Visual Anchor (Featured card) */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
                {summaryCards.map((card) => (
                    <motion.div
                        key={card.label}
                        variants={itemVariants}
                        whileHover={{ y: -4, scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={`glass-card rounded-3xl p-6 flex items-center justify-between transition-all relative overflow-hidden ${
                            card.featured 
                                ? 'bg-gradient-to-br from-brand-600/40 to-slate-900/60 border-brand-500/60 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/30' 
                                : 'hover:border-white/10'
                        }`}
                    >
                        {card.featured && (
                            <div className="absolute top-[-30%] right-[-10%] w-[120px] h-[120px] rounded-full bg-brand-500/10 blur-[30px] pointer-events-none" />
                        )}
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${card.featured ? 'text-brand-300' : 'text-slate-400'}`}>{card.label}</p>
                            <h3 className={`font-extrabold tracking-tight mt-1.5 ${
                                card.featured 
                                    ? 'text-4xl text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-teal-200' 
                                    : 'text-3xl text-slate-100'
                            }`}>
                                <CountUp end={card.value} duration={1.2} />{card.suffix || ''}
                            </h3>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                            <card.icon size={22} />
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="glass-card rounded-3xl p-6 flex flex-col justify-between hover:border-white/10 transition-all duration-300"
                >
                    <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                        <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
                            <PieIcon size={16} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-100 text-sm">Submission Status Breakdown</h3>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Report verification distribution</p>
                        </div>
                    </div>
                    
                    <div className="h-[220px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={statusData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    innerRadius={55} 
                                    outerRadius={85} 
                                    paddingAngle={5}
                                    isAnimationActive
                                >
                                    {statusData.map((entry) => (
                                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip {...glassTooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="flex justify-center gap-6 mt-4 border-t border-white/5 pt-4">
                        {statusData.map((s) => (
                            <div key={s.name} className="flex items-center gap-2 text-xs text-slate-400 font-bold capitalize">
                                <span className="w-3 h-3 rounded-full border border-[#090d16] shadow-sm" style={{ backgroundColor: STATUS_COLORS[s.name] }} />
                                <span>{s.name} ({s.value})</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Workload by Project */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="glass-card rounded-3xl p-6 flex flex-col justify-between hover:border-white/10 transition-all duration-300"
                >
                    <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                        <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
                            <BarChart2 size={16} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-100 text-sm">Workload by Project</h3>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Report distribution across projects</p>
                        </div>
                    </div>

                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={workloadData} margin={{ left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} />
                                <Tooltip {...glassTooltipStyle} />
                                <Bar dataKey="count" fill="#0d9488" radius={[8, 8, 0, 0]} isAnimationActive>
                                    {workloadData.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill="#0d9488" fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Reports Trend */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="glass-card rounded-3xl p-6 hover:border-white/10 transition-all duration-300"
            >
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                    <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
                        <Calendar size={16} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-100 text-sm">Reports Trend Over Time</h3>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Historical report submission timeline</p>
                    </div>
                </div>

                <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ left: -20, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} />
                            <Tooltip {...glassTooltipStyle} />
                            <Line 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#f59e0b" 
                                strokeWidth={3} 
                                dot={{ r: 4, stroke: '#090d16', strokeWidth: 2, fill: '#f59e0b' }} 
                                activeDot={{ r: 6 }}
                                isAnimationActive 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
}

export default Dashboard;
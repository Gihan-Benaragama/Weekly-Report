import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, X, Calendar, User, Folder, ShieldCheck } from 'lucide-react';
import API from '../api/axios';

const statusStyles = {
    submitted: 'bg-brand-500/20 text-brand-400 border border-brand-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    late: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } }
};

const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 80, damping: 12 } }
};

function TeamReports() {
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ member: '', project: '', status: '', startDate: '', endDate: '' });

    const fetchReports = async (activeFilters = filters) => {
        setLoading(true);
        const params = Object.fromEntries(Object.entries(activeFilters).filter(([, v]) => v));
        try {
            const res = await API.get('/reports', { params });
            setReports(res.data);
        } catch (err) {
            console.error('Failed to load team reports:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        API.get('/projects').then((res) => setProjects(res.data)).catch(console.error);
        fetchReports();
    }, []);

    useEffect(() => {
        const map = {};
        reports.forEach((r) => { if (r.user) map[r.user._id] = r.user.name; });
        setUsers(Object.entries(map).map(([id, name]) => ({ id, name })));
    }, [reports.length]);

    const handleFilterChange = (key, value) => {
        const updated = { ...filters, [key]: value };
        setFilters(updated);
        fetchReports(updated);
    };

    const clearFilters = () => {
        const cleared = { member: '', project: '', status: '', startDate: '', endDate: '' };
        setFilters(cleared);
        fetchReports(cleared);
    };

    const hasActiveFilters = Object.values(filters).some(Boolean);
    const selectClass = 'px-4 py-2.5 glass-input rounded-xl text-xs font-semibold focus:outline-none bg-slate-900/60 text-slate-200 cursor-pointer';

    return (
        <div className="max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-100 tracking-tight">Team Reports</h1>
                <p className="text-sm text-slate-400 font-medium mt-1">Browse, filter, and inspect weekly logs across your entire team</p>
            </div>

            {/* Filter bar */}
            <div className="glass-card rounded-3xl p-5 flex flex-wrap items-center gap-3.5">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mr-1">
                    <Filter size={14} className="text-brand-500" /> Filters:
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select value={filters.member} onChange={(e) => handleFilterChange('member', e.target.value)} className={selectClass}>
                        <option value="" className="bg-slate-950 text-slate-400">All Members</option>
                        {users.map((u) => <option key={u.id} value={u.id} className="bg-slate-950 text-slate-200">{u.name}</option>)}
                    </select>
                    <select value={filters.project} onChange={(e) => handleFilterChange('project', e.target.value)} className={selectClass}>
                        <option value="" className="bg-slate-950 text-slate-400">All Projects</option>
                        {projects.map((p) => <option key={p._id} value={p._id} className="bg-slate-950 text-slate-200">{p.name}</option>)}
                    </select>
                    <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className={selectClass}>
                        <option value="" className="bg-slate-950 text-slate-400">All Statuses</option>
                        <option value="submitted" className="bg-slate-950 text-slate-200">Submitted</option>
                        <option value="pending" className="bg-slate-950 text-slate-200">Pending</option>
                        <option value="late" className="bg-slate-950 text-slate-200">Late</option>
                    </select>
                    <div className="flex items-center gap-2">
                        <input type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} className={selectClass} />
                        <span className="text-slate-400 text-xs font-bold uppercase">to</span>
                        <input type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} className={selectClass} />
                    </div>
                </div>

                {hasActiveFilters && (
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={clearFilters}
                        className="glass-btn glass-btn-danger glass-btn-sm"
                    >
                        <X size={14} /> Clear Filters
                    </motion.button>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-900/40 border border-white/5 rounded-3xl animate-pulse" />)}
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-3xl border border-dashed border-slate-700/60 text-slate-400 font-semibold text-sm">
                    No reports match the selected filters.
                </div>
            ) : (
                <motion.div layout className="glass-card rounded-3xl overflow-hidden border border-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/40 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-white/5">
                                    <th className="px-6 py-4"><span className="flex items-center gap-1.5"><User size={13} className="text-brand-500" /> Member</span></th>
                                    <th className="px-6 py-4"><span className="flex items-center gap-1.5"><Folder size={13} className="text-brand-500" /> Project</span></th>
                                    <th className="px-6 py-4"><span className="flex items-center gap-1.5"><Calendar size={13} className="text-brand-500" /> Week</span></th>
                                    <th className="px-6 py-4">Completed Tasks Summary</th>
                                    <th className="px-6 py-4"><span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-brand-500" /> Status</span></th>
                                </tr>
                            </thead>
                            <motion.tbody variants={containerVariants} initial="hidden" animate="show">
                                {reports.map((r) => (
                                    <motion.tr
                                        key={r._id}
                                        variants={rowVariants}
                                        className="border-t border-white/5 hover:bg-brand-500/5 transition duration-150 text-xs font-medium text-slate-300"
                                    >
                                        <td className="px-6 py-4 font-bold text-slate-100">{r.user?.name}</td>
                                        <td className="px-6 py-4 text-brand-400 font-semibold">{r.project?.name || 'General'}</td>
                                        <td className="px-6 py-4 text-slate-500 font-semibold">
                                            {new Date(r.weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(r.weekEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{r.tasksCompleted}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusStyles[r.status]}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default TeamReports;
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Calendar, User, Folder, ShieldCheck, Clock, AlertOctagon, FileText, CheckCircle, Search, FileDown, Loader2 } from 'lucide-react';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);

    const downloadPDF = async (reportId) => {
        setDownloadingId(reportId);
        try {
            const res = await API.get(`/reports/${reportId}/pdf`, {
                responseType: 'blob',
            });
            const file = new Blob([res.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            
            const link = document.createElement('a');
            link.href = fileURL;
            link.setAttribute('download', `report-${reportId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(fileURL);
        } catch (err) {
            console.error('Failed to download PDF:', err);
            alert('Failed to download PDF report. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

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
        API.get('/auth/members').then((res) => setUsers(res.data)).catch(console.error);
        fetchReports();
    }, []);

    const handleFilterChange = (key, value) => {
        const updated = { ...filters, [key]: value };
        setFilters(updated);
        fetchReports(updated);
    };

    const clearFilters = () => {
        const cleared = { member: '', project: '', status: '', startDate: '', endDate: '' };
        setFilters(cleared);
        setSearchQuery('');
        fetchReports(cleared);
    };

    const filteredReports = reports.filter((r) => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
            r.user?.name?.toLowerCase().includes(q) ||
            r.project?.name?.toLowerCase().includes(q) ||
            r.tasksCompleted?.toLowerCase().includes(q) ||
            r.tasksPlanned?.toLowerCase().includes(q) ||
            r.blockers?.toLowerCase().includes(q) ||
            r.notes?.toLowerCase().includes(q)
        );
    });

    const hasActiveFilters = Object.values(filters).some(Boolean) || searchQuery !== '';
    const selectClass = 'px-4 py-2.5 glass-input rounded-xl text-xs font-semibold focus:outline-none bg-slate-900/60 text-slate-200 cursor-pointer';

    return (
        <div className="max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-100 tracking-tight">Team Reports</h1>
                <p className="text-sm text-slate-400 font-medium mt-1">Browse, filter, and inspect weekly logs across your entire team</p>
            </div>

            {/* Filter & Search bar */}
            <div className="glass-card rounded-3xl p-5 flex flex-col gap-4">
                {/* Row 1: Filter Options */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3.5 flex-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mr-1">
                            <Filter size={14} className="text-brand-500" /> Filters:
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <select value={filters.member} onChange={(e) => handleFilterChange('member', e.target.value)} className={selectClass}>
                                <option value="" className="bg-slate-950 text-slate-400">All Members</option>
                                {users.map((u) => <option key={u._id} value={u._id} className="bg-slate-950 text-slate-200">{u.name}</option>)}
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
                    </div>

                    {hasActiveFilters && (
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={clearFilters}
                            className="glass-btn glass-btn-danger glass-btn-sm whitespace-nowrap"
                        >
                            <X size={14} /> Clear
                        </motion.button>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-white/5" />

                {/* Row 2: Search Bar */}
                <div className="relative w-full">
                    <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks, blockers, notes, projects or member names..."
                        className="w-full pl-10 pr-10 py-2.5 glass-input rounded-xl text-xs font-semibold focus:outline-none bg-slate-900/60 text-slate-200"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-100 transition"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-900/40 border border-white/5 rounded-3xl animate-pulse" />)}
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-3xl border border-dashed border-slate-700/60 text-slate-400 font-semibold text-sm">
                    No reports match the selected filters or search queries.
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
                                {filteredReports.map((r) => (
                                    <motion.tr
                                        key={r._id}
                                        variants={rowVariants}
                                        onClick={() => setSelectedReport(r)}
                                        className="border-t border-white/5 hover:bg-brand-500/5 transition duration-150 text-xs font-medium text-slate-300 cursor-pointer"
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

            {/* Detail modal for report detail view */}
            <AnimatePresence>
                {selectedReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedReport(null)}
                        className="fixed inset-0 bg-[#090d16]/70 backdrop-blur-md flex items-center justify-center z-50 px-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 w-full max-w-2xl border border-white/10 flex flex-col max-h-[85vh] overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-100">Weekly Report Details</h2>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Submitted by {selectedReport.user?.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedReport(null)} className="glass-btn glass-btn-ghost glass-btn-icon">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="space-y-5 overflow-y-auto flex-1 pr-1.5 scrollbar-thin">
                                {/* Profile & Meta Bar */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/45 p-4 border border-white/5 rounded-2xl">
                                    <div className="space-y-1.5">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Team Member</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/30 text-[10px] font-bold text-teal-400 flex items-center justify-center uppercase">
                                                {selectedReport.user?.name?.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-200 truncate">{selectedReport.user?.name}</p>
                                                <p className="text-[10px] text-slate-500 font-medium truncate">{selectedReport.user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Status & Log</span>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusStyles[selectedReport.status]}`}>
                                                {selectedReport.status}
                                            </span>
                                            {selectedReport.hoursWorked && (
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-white/5 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <Clock size={10} className="text-brand-500" /> {selectedReport.hoursWorked} hours
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Project & Timeframe */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-950/20 border border-white/5 rounded-2xl">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Project / Category</span>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                                            <Folder size={14} className="text-brand-500" />
                                            <span>{selectedReport.project?.name || 'General'}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-950/20 border border-white/5 rounded-2xl">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Week Period</span>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                                            <Calendar size={14} className="text-brand-500" />
                                            <span>
                                                {new Date(selectedReport.weekStart).toLocaleDateString()} — {new Date(selectedReport.weekEnd).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tasks Completed */}
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Completed Tasks</span>
                                    <div className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                                        {selectedReport.tasksCompleted}
                                    </div>
                                </div>

                                {/* Tasks Planned */}
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Planned for Next Week</span>
                                    <div className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                                        {selectedReport.tasksPlanned}
                                    </div>
                                </div>

                                {/* Blockers / Obstacles */}
                                {selectedReport.blockers && (
                                    <div className="space-y-1.5">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Active Blockers</span>
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs leading-relaxed flex items-start gap-2 font-medium">
                                            <AlertOctagon size={14} className="mt-0.5 flex-shrink-0" />
                                            <span>{selectedReport.blockers}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Notes / Comments */}
                                {selectedReport.notes && (
                                    <div className="space-y-1.5">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Additional Notes</span>
                                        <div className="p-4 bg-slate-950/20 border border-white/5 rounded-2xl text-xs text-slate-400 leading-relaxed whitespace-pre-wrap font-medium">
                                            {selectedReport.notes}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-5 flex-shrink-0 w-full">
                                <button
                                    onClick={() => downloadPDF(selectedReport._id)}
                                    disabled={downloadingId === selectedReport._id}
                                    className="glass-btn glass-btn-primary glass-btn-sm flex items-center gap-1.5"
                                >
                                    {downloadingId === selectedReport._id ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" /> Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <FileDown size={14} /> Download Report
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="glass-btn glass-btn-ghost glass-btn-sm flex items-center gap-1.5"
                                >
                                    <CheckCircle size={14} /> Close details
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default TeamReports;
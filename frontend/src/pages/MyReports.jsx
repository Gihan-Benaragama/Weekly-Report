import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, AlertCircle, Calendar, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

const statusStyles = {
    submitted: 'bg-brand-500/20 text-brand-400 border border-brand-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    late: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

function MyReports() {
    const [reports, setReports] = useState(() => {
        const cached = localStorage.getItem('cached_my_reports');
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(() => !localStorage.getItem('cached_my_reports'));
    const navigate = useNavigate();

    const fetchReports = () => {
        API.get('/reports/my-reports')
            .then((res) => {
                setReports(res.data);
                localStorage.setItem('cached_my_reports', JSON.stringify(res.data));
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Delete this report? This cannot be undone.')) return;
        try {
            await API.delete(`/reports/${id}`);
            setReports((prev) => {
                const updated = prev.filter((r) => r._id !== id);
                localStorage.setItem('cached_my_reports', JSON.stringify(updated));
                return updated;
            });
            toast.success('Report deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete report');
        }
    };

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">My Weekly Reports</h1>
                    <p className="text-slate-400 mt-1">Track your progress week by week</p>
                </div>
                <Link to="/my-reports/new">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="glass-btn glass-btn-primary"
                    >
                        <Plus size={16} /> New Report
                    </motion.button>
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-slate-900/40 border border-white/5 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : reports.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 glass-card rounded-3xl border border-white/5"
                >
                    <Calendar className="mx-auto text-slate-400 mb-3" size={32} />
                    <p className="text-slate-300 font-medium">No reports yet — create your first weekly report.</p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {reports.map((report, i) => (
                        <motion.div
                            key={report._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.06 }}
                            className="relative glass-card rounded-3xl border border-white/5 pl-6 pr-6 py-5 overflow-hidden hover:border-white/10 transition"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-500" />

                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-semibold text-slate-100">
                                        {new Date(report.weekStart).toLocaleDateString()} — {new Date(report.weekEnd).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-brand-400 font-medium">{report.project?.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusStyles[report.status]}`}>
                                        {report.status}
                                    </span>
                                    <button
                                        onClick={() => navigate(`/my-reports/edit/${report._id}`)}
                                        className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition"
                                        title="Edit report"
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(report._id)}
                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                        title="Delete report"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-slate-300 mb-2">
                                <span className="font-bold text-slate-400">Completed: </span>
                                {report.tasksCompleted}
                            </p>

                            {report.blockers && (
                                <div className="flex items-start gap-1.5 text-sm text-amber-400/90 mt-2">
                                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                                    <span>{report.blockers}</span>
                                </div>
                            )}

                            {report.hoursWorked && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3">
                                    <Clock size={13} /> {report.hoursWorked}h logged
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyReports;
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Loader2, Save, Send, Calendar, Clock, BookOpen, Ban } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

function ReportForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState({
        project: '', weekStart: '', weekEnd: '',
        tasksCompleted: '', tasksPlanned: '', blockers: '', hoursWorked: '', notes: '', status: 'pending',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        API.get('/projects').then((res) => setProjects(res.data)).catch(console.error);
        if (isEditing) {
            API.get('/reports/my-reports').then((res) => {
                const existing = res.data.find((r) => r._id === id);
                if (existing) {
                    setForm({
                        project: existing.project?._id || '',
                        weekStart: existing.weekStart?.slice(0, 10) || '',
                        weekEnd: existing.weekEnd?.slice(0, 10) || '',
                        tasksCompleted: existing.tasksCompleted || '',
                        tasksPlanned: existing.tasksPlanned || '',
                        blockers: existing.blockers || '',
                        hoursWorked: existing.hoursWorked || '',
                        notes: existing.notes || '',
                        status: existing.status || 'pending',
                    });
                }
            }).catch(console.error);
        }
    }, [id, isEditing]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFormSubmit = async (e, submitStatus) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = { ...form, status: submitStatus, hoursWorked: form.hoursWorked === '' ? null : Number(form.hoursWorked) };
            if (isEditing) await API.put(`/reports/${id}`, payload);
            else await API.post('/reports', payload);
            setSuccess(true);
            setTimeout(() => navigate('/my-reports'), 1000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save report';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full px-4 py-3 glass-input rounded-xl outline-none text-slate-200 text-sm';
    const labelClass = 'block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2';

    if (success) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center p-8 glass-card rounded-3xl max-w-sm text-center"
                >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}>
                        <CheckCircle2 className="text-brand-500 mb-4 animate-bounce" size={60} />
                    </motion.div>
                    <h2 className="text-xl font-bold text-slate-100 mb-1">Report Saved!</h2>
                    <p className="text-sm text-slate-400 font-medium">Redirecting you to dashboard...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/my-reports" className="glass-btn glass-btn-ghost glass-btn-icon">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-black text-slate-100 tracking-tight">
                            {isEditing ? 'Edit Weekly Report' : 'New Weekly Report'}
                        </h1>
                        {isEditing && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md uppercase tracking-wider">
                                Editing
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Fill in your work progress and upcoming activities</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl px-4 py-3 font-semibold">
                    {error}
                </div>
            )}

            <form className="space-y-6">
                <div className="glass-card rounded-3xl p-6 md:p-8 space-y-8">
                    {/* Section 1 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-2">
                            <Calendar size={16} className="text-brand-500" /> Project & Duration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Project / Area</label>
                                <select name="project" value={form.project} onChange={handleChange} required className={`${inputClass} bg-slate-900`}>
                                    <option value="" className="bg-slate-950 text-slate-400">Select project</option>
                                    {projects.map((p) => (
                                        <option key={p._id} value={p._id} className="bg-slate-950 text-slate-200">{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Hours Logged (Optional)</label>
                                <div className="relative">
                                    <span className="absolute right-3.5 top-3.5 text-slate-400"><Clock size={16} /></span>
                                    <input type="number" name="hoursWorked" value={form.hoursWorked} onChange={handleChange} placeholder="e.g. 40" className={inputClass} />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Week Start Date</label>
                                <input
                                    type="date"
                                    name="weekStart"
                                    value={form.weekStart}
                                    onChange={handleChange}
                                    onClick={(e) => { try { e.target.showPicker(); } catch (err) { } }}
                                    required
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Week End Date</label>
                                <input
                                    type="date"
                                    name="weekEnd"
                                    value={form.weekEnd}
                                    onChange={handleChange}
                                    onClick={(e) => { try { e.target.showPicker(); } catch (err) { } }}
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-2">
                            <BookOpen size={16} className="text-brand-500" /> Work Breakdown
                        </h3>
                        <div>
                            <label className={labelClass}>Tasks Completed</label>
                            <textarea name="tasksCompleted" value={form.tasksCompleted} onChange={handleChange} required rows={3}
                                placeholder="Detail what you've achieved during this week..." className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Tasks Planned (Next Week)</label>
                            <textarea name="tasksPlanned" value={form.tasksPlanned} onChange={handleChange} required rows={3}
                                placeholder="Detail the specific tasks planned for next week..." className={inputClass} />
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-2">
                            <Ban size={16} className="text-brand-500" /> Blockers & Additional Details
                        </h3>
                        <div>
                            <label className={labelClass}>Blockers (Optional)</label>
                            <textarea name="blockers" value={form.blockers} onChange={handleChange} rows={2}
                                placeholder="Specify any roadblocks currently holding you back..." className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Additional Notes (Optional)</label>
                            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                                placeholder="Add comments, links, or context files..." className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3.5">
                    <button type="button" onClick={() => navigate('/my-reports')} className="glass-btn glass-btn-ghost">
                        Cancel
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        type="button" disabled={loading}
                        onClick={(e) => handleFormSubmit(e, 'pending')}
                        className="glass-btn glass-btn-ghost disabled:opacity-50"
                    >
                        <Save size={16} /> Save Draft
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        type="button" disabled={loading}
                        onClick={(e) => handleFormSubmit(e, 'submitted')}
                        className="glass-btn glass-btn-primary disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Submit Report
                    </motion.button>
                </div>
            </form>
        </div>
    );
}

export default ReportForm;
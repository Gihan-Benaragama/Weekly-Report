import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, FolderKanban, X, Calendar, PlusCircle, CheckCircle } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [error, setError] = useState('');

    const fetchProjects = () => {
        API.get('/projects').then((res) => setProjects(res.data)).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { fetchProjects(); }, []);

    const openNewForm = () => { setForm({ name: '', description: '' }); setEditingId(null); setShowForm(true); setError(''); };
    const openEditForm = (p) => { setForm({ name: p.name, description: p.description || '' }); setEditingId(p._id); setShowForm(true); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await API.put(`/projects/${editingId}`, form);
                toast.success('Project updated');
            } else {
                await API.post('/projects', form);
                toast.success('Project created');
            }
            setShowForm(false);
            fetchProjects();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save project';
            setError(msg);
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this project? This cannot be undone.')) return;
        await API.delete(`/projects/${id}`);
        fetchProjects();
        toast.success('Project deleted');
    };

    return (
        <div className="max-w-4xl space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-100 tracking-tight">Projects & Categories</h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">Manage the work areas your team logs reports against</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={openNewForm}
                    className="glass-btn glass-btn-primary"
                >
                    <Plus size={16} /> New Project
                </motion.button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-slate-900/40 border border-white/5 rounded-3xl animate-pulse" />)}
                </div>
            ) : projects.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 glass-card rounded-3xl border border-dashed border-slate-700/60"
                >
                    <div className="w-16 h-16 bg-slate-900/50 rounded-2xl flex items-center justify-center text-brand-500 mx-auto mb-4">
                        <FolderKanban size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">No projects found</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-6 font-medium">Create projects to allow team members to log reports against them.</p>
                    <button onClick={openNewForm} className="glass-btn glass-btn-primary glass-btn-sm">Create First Project</button>
                </motion.div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {projects.map((project) => (
                        <motion.div
                            key={project._id}
                            variants={cardVariants}
                            whileHover={{ y: -3 }}
                            className="glass-card rounded-3xl p-6 relative flex flex-col justify-between transition group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0 border border-brand-500/30">
                                    <FolderKanban size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-slate-100 text-base">{project.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
                                        {project.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar size={11} className="text-brand-500" />
                                    Created {new Date(project.createdAt).toLocaleDateString()}
                                </span>
                                <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition">
                                    <button onClick={() => openEditForm(project)} className="glass-btn glass-btn-ghost glass-btn-icon">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(project._id)} className="glass-btn glass-btn-danger glass-btn-icon">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#090d16]/60 backdrop-blur-md flex items-center justify-center z-50 px-4"
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900/85 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 w-full max-w-md border border-white/10"
                        >
                            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                    <PlusCircle className="text-brand-500" size={20} />
                                    {editingId ? 'Edit Project' : 'New Project'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="glass-btn glass-btn-ghost glass-btn-icon">
                                    <X size={16} />
                                </button>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-2.5 mb-4 font-semibold">{error}</div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Name</label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 glass-input rounded-xl outline-none text-slate-200 text-sm"
                                        placeholder="e.g. Client Portal Redesign"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 glass-input rounded-xl outline-none text-slate-200 text-sm"
                                        placeholder="Add goals, details, or scope descriptions..."
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5 mt-6">
                                    <button type="button" onClick={() => setShowForm(false)} className="glass-btn glass-btn-ghost glass-btn-sm">
                                        Cancel
                                    </button>
                                    <button type="submit" className="glass-btn glass-btn-primary glass-btn-sm">
                                        <CheckCircle size={14} />
                                        {editingId ? 'Save Changes' : 'Create Project'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Projects;
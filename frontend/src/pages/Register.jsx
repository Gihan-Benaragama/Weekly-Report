import { useState } from 'react';
import logo from '../assets/Logo.png';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, User, Mail, Lock, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('member');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await register(name, email, password, role);
            toast.success(`Welcome to WeeklyFlow, ${user.name}!`);
            navigate(user.role === 'manager' ? '/dashboard' : '/my-reports');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-[130px] animate-float-slow pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[700px] h-[700px] rounded-full bg-teal-500/10 blur-[150px] animate-float-delay pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', damping: 20, stiffness: 120 }}
                className="w-full max-w-md glass-card rounded-3xl p-8 relative z-10"
            >
                <div className="flex justify-center mb-0">
                    <img src={logo} alt="WeeklyFlow Logo" className="h-40 w-auto object-contain" />
                </div>

                <h1 className="text-2xl font-black text-slate-100 mb-6">Create an account</h1>

                {error && (
                    <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: [0, -6, 6, -6, 0] }}
                        transition={{ duration: 0.4 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-2.5 mb-4 font-semibold"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3.5 text-slate-400"><User size={16} /></span>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                                className="w-full pl-10 pr-4 py-3.5 glass-input rounded-xl outline-none text-sm text-slate-200" placeholder="Jane Doe" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3.5 text-slate-400"><Mail size={16} /></span>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                className="w-full pl-10 pr-4 py-3.5 glass-input rounded-xl outline-none text-sm text-slate-200" placeholder="you@company.com" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3.5 text-slate-400"><Lock size={16} /></span>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                                className="w-full pl-10 pr-4 py-3.5 glass-input rounded-xl outline-none text-sm text-slate-200" placeholder="••••••••" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Role</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3.5 text-slate-400"><Briefcase size={16} /></span>
                            <select value={role} onChange={(e) => setRole(e.target.value)}
                                className="w-full pl-10 pr-4 py-3.5 glass-input rounded-xl outline-none text-sm text-slate-200 bg-slate-900">
                                <option value="member">Team Member</option>
                                <option value="manager">Manager</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="glass-btn glass-btn-primary w-full mt-6 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-400 mt-6 font-semibold">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-500 hover:text-teal-300 hover:underline transition">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}

export default Register;
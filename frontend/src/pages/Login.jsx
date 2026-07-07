import { useState } from 'react';
import logo from '../assets/Logo.png';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.name}!`);
            navigate(user.role === 'manager' ? '/dashboard' : '/my-reports');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError('');
            try {
                const user = await loginWithGoogle(tokenResponse.access_token);
                toast.success(`Welcome back, ${user.name}! (Signed in via Google)`);
                navigate(user.role === 'manager' ? '/dashboard' : '/my-reports');
            } catch (err) {
                const msg = err.response?.data?.message || 'Google login failed';
                setError(msg);
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            setError('Google login failed or cancelled');
            toast.error('Google login failed');
        }
    });

    return (
        <div className="min-h-screen bg-[#090d16] flex relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[700px] h-[700px] rounded-full bg-teal-500/5 blur-[180px] pointer-events-none" />

            {/* Left Side: Branding / Illustration Panel */}
            <div className="hidden md:flex md:w-1/2 bg-[#0b0f19] relative flex-col justify-center items-center px-16 overflow-hidden border-r border-white/5">
                {/* Subtle ambient orbs */}
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />

                {/* Grid overlay pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center max-w-md space-y-0">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex justify-center items-center gap-3"
                    >
                        <img src={logo} alt="WeeklyFlow Logo" className="h-72 w-auto object-contain" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="space-y-4"
                    >
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-100 tracking-tight leading-tight font-display">
                            Streamline your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-teal-400">Weekly Reports</span>.
                        </h2>
                        <p className="text-sm lg:text-base text-slate-400 font-medium leading-relaxed">
                            Generate, review, and analyze weekly reports with Gemini AI insights, track team progress, and resolve blockers effortlessly.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Form Panel */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring', damping: 20, stiffness: 120 }}
                    className="w-full max-w-md glass-card rounded-3xl p-8 relative"
                >
                    {/* Mobile Logo display */}
                    <div className="flex justify-center mb-6 md:hidden">
                        <img src={logo} alt="WeeklyFlow Logo" className="h-10 w-auto object-contain" />
                    </div>

                    <h1 className="text-3xl font-black text-slate-100 mb-1 tracking-tight">Welcome back</h1>
                    <p className="text-sm text-slate-400 mb-6 font-medium">Please enter your credentials to login</p>

                    {error && (
                        <motion.div
                            initial={{ x: 0 }}
                            animate={{ x: [0, -6, 6, -6, 0] }}
                            transition={{ duration: 0.4 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-2.5 mb-5 font-semibold"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3.5 text-slate-400"><Mail size={16} /></span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3.5 glass-input rounded-xl outline-none text-sm text-slate-200"
                                    placeholder="you@company.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3.5 text-slate-400"><Lock size={16} /></span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3.5 glass-input rounded-xl outline-none text-sm text-slate-200"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-btn glass-btn-primary w-full mt-6 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="relative my-6 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <span className="relative bg-[#0d1629] px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Or continue with
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 shadow-md shadow-black/10 transition-all duration-200 disabled:opacity-50"
                    >
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-6 font-semibold">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-brand-500 hover:text-teal-300 hover:underline transition">
                            Register
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export default Login;
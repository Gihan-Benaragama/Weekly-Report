import { useState } from 'react';
import logo from '../assets/download.png';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LayoutDashboard, FileText, FolderKanban, Bot, Send, X, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import NotificationBell from '../components/NotificationBell';

function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ai', text: "Hello! I am your AI assistant. You can ask me questions like: 'Who has blockers?', 'Show a summary of work completed', or 'Compare workloads'." }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [loadingChat, setLoadingChat] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || loadingChat) return;
        const userMsg = chatInput.trim();
        setChatInput('');
        setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
        setLoadingChat(true);
        try {
            const res = await API.post('/chat/ask', { question: userMsg });
            setMessages((prev) => [...prev, { sender: 'ai', text: res.data.answer }]);
        } catch (err) {
            setMessages((prev) => [...prev, { sender: 'ai', text: err.response?.data?.message || 'Sorry, I encountered an error. Make sure your GEMINI_API_KEY is configured.' }]);
        } finally {
            setLoadingChat(false);
        }
    };

    const navItemClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-200 ${isActive
            ? 'bg-brand-600/80 text-white shadow-md shadow-brand-500/20 border border-brand-500/40 backdrop-blur-md'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
        }`;

    return (
        <div className="h-screen bg-[#090d16] flex relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-500/10 blur-[120px] animate-float-slow pointer-events-none z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[140px] animate-float-delay pointer-events-none z-0" />

            {/* Mobile Header Bar */}
            <div className="md:hidden flex items-center justify-between p-4 bg-[#090d16]/80 backdrop-blur-md border-b border-white/5 z-20 w-full fixed top-0 left-0">
                <div className="flex items-center gap-2.5">
                    <img src={logo} alt="WeeklyFlow Logo" className="w-8 h-8 rounded-lg object-contain shadow-lg" />
                    <span className="font-bold text-base text-slate-100 tracking-tight">WeeklyFlow</span>
                </div>
                <div className="flex items-center gap-2">
                    <NotificationBell />
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="glass-btn glass-btn-ghost glass-btn-icon"
                    >
                        <svg className="w-6 h-6 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Backdrop for Mobile Sidebar Menu */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-35 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 glass-panel flex flex-col p-5 z-40 transition-transform duration-300 transform md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:flex`}>
                <div className="flex items-center justify-between px-2 py-4 mb-6">
                    <div className="flex items-center gap-2.5">
                        <img src={logo} alt="WeeklyFlow Logo" className="w-9 h-9 rounded-xl object-contain shadow-lg" />
                        <span className="font-bold text-lg text-slate-100 tracking-tight">WeeklyFlow</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden md:block">
                            <NotificationBell />
                        </div>
                        {/* Close button for mobile */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="glass-btn glass-btn-ghost glass-btn-icon"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1.5">
                    {user?.role === 'member' && (
                        <NavLink to="/my-reports" className={navItemClass} onClick={() => setMobileMenuOpen(false)}>
                            <FileText size={18} /> My Reports
                        </NavLink>
                    )}
                    {user?.role === 'manager' && (
                        <>
                            <NavLink to="/dashboard" className={navItemClass} onClick={() => setMobileMenuOpen(false)}>
                                <LayoutDashboard size={18} /> Dashboard
                            </NavLink>
                            <NavLink to="/projects" className={navItemClass} onClick={() => setMobileMenuOpen(false)}>
                                <FolderKanban size={18} /> Projects
                            </NavLink>
                            <NavLink to="/team-reports" className={navItemClass} onClick={() => setMobileMenuOpen(false)}>
                                <FileText size={18} /> Team Reports
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="border-t border-white/5 pt-5 mt-4">
                    <div className="px-3 py-2.5 mb-3 bg-slate-900/40 border border-white/5 rounded-2xl">
                        <p className="text-sm font-bold text-slate-100 leading-tight">{user?.name}</p>
                        <p className="text-[11px] text-brand-500 font-bold capitalize mt-0.5">{user?.role}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="glass-btn glass-btn-danger glass-btn-sm w-full justify-start gap-2.5"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 h-full overflow-y-auto z-10 relative pt-16 md:pt-0">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="p-4 sm:p-8"
                >
                    <Outlet />
                </motion.div>
            </main>

            {/* Manager Floating AI Assistant */}
            {user?.role === 'manager' && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                    <AnimatePresence>
                        {chatOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                                className="w-full max-w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] mb-4 bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                            >
                                <div className="p-4 bg-[#0d9488]/80 backdrop-blur-md text-white flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bot size={20} className="text-teal-100" />
                                        <div>
                                            <h3 className="font-bold text-sm">Report Assistant</h3>
                                            <p className="text-[10px] text-teal-100 flex items-center gap-1 font-semibold">
                                                <Sparkles size={8} /> Powered by Gemini
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setChatOpen(false)} className="glass-btn glass-btn-ghost glass-btn-icon">
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${msg.sender === 'user'
                                                    ? 'bg-brand-600/80 backdrop-blur-sm text-white rounded-br-none border border-brand-500/40'
                                                    : 'bg-slate-950 text-slate-100 rounded-bl-none border border-white/5'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {loadingChat && (
                                        <div className="flex justify-start">
                                            <div className="bg-slate-950 text-slate-400 rounded-2xl rounded-bl-none px-4 py-2.5 border border-white/5 flex items-center gap-2 text-xs">
                                                <Loader2 size={12} className="animate-spin text-brand-500" />
                                                Analyzing team reports...
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSendChat} className="p-3 bg-slate-950/45 border-t border-white/5 flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Ask about blockers, workload..."
                                        disabled={loadingChat}
                                        className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loadingChat || !chatInput.trim()}
                                        className="glass-btn glass-btn-primary glass-btn-icon disabled:opacity-40"
                                    >
                                        <Send size={14} />
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setChatOpen(!chatOpen)}
                        className="flex items-center justify-center w-14 h-14 rounded-full shadow-2xl shadow-brand-500/35 text-white bg-brand-500 hover:bg-brand-600 border border-brand-400/30 transition-all duration-200 cursor-pointer z-50"
                        aria-label="AI Assistant"
                    >
                        {chatOpen ? <X size={22} className="opacity-100" /> : <MessageSquare size={22} className="opacity-100" />}
                    </motion.button>
                </div>
            )}
        </div>
    );
}

export default AppLayout;
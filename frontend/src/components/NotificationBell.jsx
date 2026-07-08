import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, FolderKanban, CheckCheck, X } from 'lucide-react';
import API from '../api/axios';

const typeStyles = {
    project_assigned: {
        icon: <FolderKanban size={15} />,
        color: 'text-brand-400',
        bg: 'bg-brand-500/10 border-brand-500/20',
        dot: 'bg-brand-400',
    },
    project_removed: {
        icon: <X size={15} />,
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/20',
        dot: 'bg-red-400',
    },
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount]     = useState(0);
    const [open, setOpen]                   = useState(false);
    const ref                               = useRef(null);

    const fetchNotifications = async () => {
        try {
            const [notifRes, countRes] = await Promise.all([
                API.get('/notifications'),
                API.get('/notifications/unread-count'),
            ]);
            setNotifications(notifRes.data);
            setUnreadCount(countRes.data.count);
        } catch {
            // silent fail — notification is non-critical
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds to pick up new assignments
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => {
        setOpen((prev) => !prev);
    };

    const markAllRead = async () => {
        await API.put('/notifications/read-all');
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const markOneRead = async (id) => {
        await API.put(`/notifications/${id}/read`);
        setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins  = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days  = Math.floor(diff / 86400000);
        if (mins < 1)  return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="relative" ref={ref}>
            {/* Bell Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpen}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl glass-btn glass-btn-ghost glass-btn-icon"
                aria-label="Notifications"
            >
                <Bell size={17} />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-brand-500 text-white text-[9px] font-black min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 shadow-lg shadow-brand-500/40"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </motion.button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 md:left-0 md:right-auto top-12 w-80 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                            <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <Bell size={14} className="text-brand-500" />
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="text-[9px] font-black bg-brand-500 text-white px-1.5 py-0.5 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </span>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-[10px] font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition"
                                >
                                    <CheckCheck size={11} /> Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto scrollbar-thin">
                            {notifications.length === 0 ? (
                                <div className="py-10 text-center text-xs text-slate-500 font-medium">
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const style = typeStyles[n.type] || typeStyles.project_assigned;
                                    return (
                                        <motion.div
                                            key={n._id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex gap-3 px-4 py-3 border-b border-white/5 cursor-pointer transition-colors ${n.read ? 'opacity-50' : 'hover:bg-white/5'}`}
                                            onClick={() => !n.read && markOneRead(n._id)}
                                        >
                                            {/* Icon */}
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${style.bg} ${style.color}`}>
                                                {style.icon}
                                            </div>
                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-[11px] font-bold text-slate-100 leading-snug">
                                                        {n.title}
                                                    </p>
                                                    {!n.read && (
                                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${style.dot}`} />
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-relaxed">
                                                    {n.message}
                                                </p>
                                                <span className="text-[9px] text-slate-600 font-semibold mt-1 block">
                                                    {timeAgo(n.createdAt)}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

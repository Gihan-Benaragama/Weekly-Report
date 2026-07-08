import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/**
 * Decode the JWT payload locally without any network call.
 * This is safe because we only use the payload to restore UI state,
 * not to make authorization decisions (the server still validates the token on each API request).
 */
const decodeTokenLocally = (token) => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    // Hydrate user immediately from the stored token — zero network round-trip
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const decoded = decodeTokenLocally(token);
        // If token is expired, treat as logged out
        if (!decoded || decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            return null;
        }
        // Return the shape expected by the app
        return { _id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role };
    });
    const [loading, setLoading] = useState(false); // no spinner since we already have user from token

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Silently validate token in background and refresh full user object from server
        API.get('/auth/me')
            .then((res) => setUser(res.data))
            .catch(() => {
                localStorage.removeItem('token');
                setUser(null);
            });
    }, []);

    const login = async (email, password) => {
        const res = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const loginWithGoogle = async (googleAccessToken) => {
        const res = await API.post('/auth/google', { token: googleAccessToken });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const register = async (name, email, password, role) => {
        const res = await API.post('/auth/register', { name, email, password, role });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('cached_dashboard_stats');
        localStorage.removeItem('cached_dashboard_reports');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
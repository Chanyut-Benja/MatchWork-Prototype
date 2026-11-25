import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../services/api';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getRoleDisplay(role) {
  switch ((role || '').toLowerCase()) {
    case 'recruiter':
    case 'company':
      return 'Company';
    case 'admin':
      return 'Admin';
    case 'candidate':
    default:
      return 'Candidate';
  }
}

function extractErrorMessage(err, fallback = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์') {
  return err?.response?.data?.message || err?.message || fallback;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || null);
  const [user, setUser] = useState(() => readStoredUser());
  const [isInitializing, setIsInitializing] = useState(() => Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const persistSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    setAuthError('');
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Verify existing JWT token on initial app load
  useEffect(() => {
    let active = true;
    async function verifySession() {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        if (active) setIsInitializing(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (active && res?.success && res?.user) {
          persistSession(storedToken, res.user);
        } else if (active) {
          clearSession();
        }
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setIsInitializing(false);
      }
    }

    verifySession();
    return () => {
      active = false;
    };
  }, [clearSession, persistSession]);

  // Listen for global 401 unauthorized events from Axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
    };
    window.addEventListener('matchwork:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('matchwork:unauthorized', handleUnauthorized);
  }, [clearSession]);

  const login = useCallback(
    async ({ email, password }) => {
      setIsSubmitting(true);
      setAuthError('');
      try {
        const res = await authApi.login({ email: email.trim(), password });
        if (res?.success && res?.token && res?.user) {
          persistSession(res.token, res.user);
          return { success: true, user: res.user, message: res.message };
        }
        const msg = res?.message || 'เข้าสู่ระบบไม่สำเร็จ';
        setAuthError(msg);
        return { success: false, message: msg };
      } catch (err) {
        const msg = extractErrorMessage(err, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        setAuthError(msg);
        return { success: false, message: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistSession]
  );

  const quickLogin = useCallback(
    async (targetRole) => {
      setIsSubmitting(true);
      setAuthError('');
      try {
        const res = await authApi.login({ role: targetRole });
        if (res?.success && res?.token && res?.user) {
          persistSession(res.token, res.user);
          return { success: true, user: res.user, message: res.message };
        }
        const msg = res?.message || 'ไม่สามารถสลับบัญชีได้';
        setAuthError(msg);
        return { success: false, message: msg };
      } catch (err) {
        const msg = extractErrorMessage(err, 'ไม่สามารถเข้าสู่ระบบด่วนได้');
        setAuthError(msg);
        return { success: false, message: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistSession]
  );

  const switchAccount = useCallback(
    async ({ personaId, role: targetRole }) => {
      setIsSubmitting(true);
      setAuthError('');
      try {
        const res = await authApi.switchAccount({
          persona_id: personaId || undefined,
          role: targetRole || undefined,
        });
        if (res?.success && res?.token && res?.user) {
          persistSession(res.token, res.user);
          return { success: true, user: res.user, message: res.message };
        }
        const msg = res?.message || 'ไม่สามารถสลับบัญชีได้';
        setAuthError(msg);
        return { success: false, message: msg };
      } catch (err) {
        const msg = extractErrorMessage(err, 'ไม่สามารถสลับบัญชีได้');
        setAuthError(msg);
        return { success: false, message: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistSession]
  );

  const register = useCallback(
    async (payload) => {
      setIsSubmitting(true);
      setAuthError('');
      try {
        const res = await authApi.register(payload);
        if (res?.success && res?.token && res?.user) {
          persistSession(res.token, res.user);
          return { success: true, user: res.user, message: res.message };
        }
        const msg = res?.message || 'ลงทะเบียนไม่สำเร็จ';
        setAuthError(msg);
        return { success: false, message: msg };
      } catch (err) {
        const msg = extractErrorMessage(err, 'ไม่สามารถสมัครสมาชิกได้');
        setAuthError(msg);
        return { success: false, message: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout; clear local session regardless
    } finally {
      clearSession();
      setAuthError('');
    }
  }, [clearSession]);

  const role = user?.role || null;
  const roleDisplay = useMemo(() => getRoleDisplay(role), [role]);
  const isAuthenticated = Boolean(token && user);

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      roleDisplay,
      isAuthenticated,
      isInitializing,
      isSubmitting,
      authError,
      clearError: () => setAuthError(''),
      login,
      quickLogin,
      switchAccount,
      register,
      logout,
    }),
    [
      user,
      token,
      role,
      roleDisplay,
      isAuthenticated,
      isInitializing,
      isSubmitting,
      authError,
      login,
      quickLogin,
      switchAccount,
      register,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

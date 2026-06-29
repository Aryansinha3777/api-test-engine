import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('ate_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const saved = localStorage.getItem('ate_user');
      if (saved) setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('ate_token', jwtToken);
    localStorage.setItem('ate_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ate_token');
    localStorage.removeItem('ate_user');
  };

  return (
    <AuthCtx.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
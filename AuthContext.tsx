
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch current user data using token
  const checkAuth = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      // If we are using a mock token (from demo login), trust local storage if backend is unavailable
      if (storedToken.startsWith('mock_jwt_token_')) {
          if (storedUser) {
              try {
                setUser(JSON.parse(storedUser));
              } catch(e) {
                console.error("Failed to parse stored user", e);
              }
          }
          setToken(storedToken);
          setIsLoading(false);
          return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser({ ...response.data, id: response.data._id }); // Map _id to id
        setToken(storedToken);
      } catch (error) {
        console.error("Auth check failed:", error);
        // If the token was real but check failed (expired or invalid), log out
        logout();
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser({ ...newUser, id: newUser._id }); // Map _id to id
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

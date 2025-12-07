
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

// Export the Context object itself in case it's needed directly
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
                const parsedUser = JSON.parse(storedUser);
                // Normalize role to enum if it's a string
                const normalizedUser: User = {
                  ...parsedUser,
                  id: parsedUser._id || parsedUser.id,
                  role: typeof parsedUser.role === 'string' 
                    ? (parsedUser.role.toLowerCase() === 'admin' ? UserRole.ADMIN : UserRole.USER)
                    : parsedUser.role
                };
                setUser(normalizedUser);
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
        const userData = response.data;
        // Normalize role to enum if it's a string
        const normalizedUser: User = {
          ...userData,
          id: userData._id || userData.id,
          role: typeof userData.role === 'string' 
            ? (userData.role.toLowerCase() === 'admin' ? UserRole.ADMIN : UserRole.USER)
            : userData.role
        };
        setUser(normalizedUser);
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
    // Normalize role to enum if it's a string
    const normalizedUser: User = {
      ...newUser,
      id: newUser._id || newUser.id,
      role: typeof newUser.role === 'string' 
        ? (newUser.role.toLowerCase() === 'admin' ? UserRole.ADMIN : UserRole.USER)
        : newUser.role
    };
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setToken(newToken);
    setUser(normalizedUser);
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

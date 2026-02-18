import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile, UserRole } from '@/types';
import api from '@/services/api'; 

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  errorMessage: string | null; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('tradedata_user');
    const savedToken = localStorage.getItem('tradedata_token');
    console.log(savedUser)

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setErrorMessage(null);
    try {
      const response = await api.post('/login', { 
        username: email, 
        password: password 
      });

      const data = response.data;

      if (data.status === 'ERROR') {
        setErrorMessage(data.error_message || 'Erro ao realizar login');
        return false;
      }

      if (data.status === 'SUCCESS' && data.userdata) {
        const backendUser = data.userdata;

        const derivedRole: UserRole = backendUser.profile_name?.toLowerCase().includes('admin') 
          ? 'admin' 
          : 'client';

        const userAdapted: User = {
          id: backendUser.id.toString(),
          email: backendUser.email,
          name: backendUser.name,
          role: derivedRole,
          company_id: backendUser.company_id?.toString(),
          createdAt: new Date().toISOString(), 
        };

        localStorage.setItem('tradedata_token', data.sessionToken);
        localStorage.setItem('tradedata_user', JSON.stringify(userAdapted));
        
        if (data.groups) {
           localStorage.setItem('tradedata_groups', JSON.stringify(data.groups));
        }

        setUser(userAdapted);
        return true;
      }

      return false;

    } catch (error) {
      console.error('Erro na requisição:', error);
      setErrorMessage('Falha de conexão com o servidor.');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('tradedata_user');
    localStorage.removeItem('tradedata_token');
    localStorage.removeItem('tradedata_groups');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
        errorMessage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
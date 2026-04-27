import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Shield, Lock, ArrowRight } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={loginWithGoogle} />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const Login: React.FC<{ onLogin: () => Promise<void> }> = ({ onLogin }) => {
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await onLogin();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="max-w-md w-full space-y-8 bg-[#161a1e] p-8 border border-[#2d333b] rounded-lg shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
        
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-widest uppercase">AuraTrade <span className="text-blue-500">AI</span></h1>
          <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">Institutional Grade Trading Entry</p>
        </div>

        <div className="space-y-6 pt-4">
          <div className="bg-[#0b0e11] p-4 rounded border border-[#2d333b] flex items-center gap-4">
             <Lock className="w-5 h-5 text-gray-600" />
             <div className="text-[10px] text-gray-500 font-mono uppercase leading-tight">
                Authentication required to access the real-time AI signal terminal.
             </div>
          </div>

          <button 
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded text-sm uppercase flex items-center justify-center gap-3 transition-all active:scale-[0.98] group"
          >
            Sign in with Google Account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {error && (
            <p className="text-red-500 text-[10px] text-center font-mono uppercase bg-red-500/10 p-2 border border-red-500/20 rounded">
              {error}
            </p>
          )}
        </div>

        <div className="pt-8 text-center">
          <p className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.2em]">
            Secured by Firebase Enterprise Auth • v2.4.0
          </p>
        </div>
      </div>
    </div>
  );
};

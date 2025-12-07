
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
        if (username.toLowerCase() === 'admin') {
            onLogin();
            navigate('/dashboard');
        } else {
            setError('Invalid credentials. Try username: admin');
            setIsLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f97316]/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl relative z-10 overflow-hidden">
         <div className="h-1.5 w-full bg-gradient-to-r from-[#f97316] via-yellow-500 to-[#f97316]"></div>
         
         <div className="p-8">
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-[#f97316] rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-[#f97316]/20">
                    <span className="font-bold text-2xl font-serif italic">W</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
                <p className="text-gray-400 text-sm">Enter your credentials to access the dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Username</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#f97316] transition-colors">
                            <User size={18} />
                        </div>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-all placeholder-gray-600"
                            placeholder="admin"
                            autoFocus
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#f97316] transition-colors">
                            <Lock size={18} />
                        </div>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-all placeholder-gray-600"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-red-400 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#f97316]/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
                </button>
            </form>
         </div>
         
         <div className="p-4 bg-[#0a0a0a] border-t border-white/5 text-center">
             <p className="text-xs text-gray-500">Don't have an account? <span className="text-[#f97316] hover:underline cursor-pointer">Contact Sales</span></p>
         </div>
      </div>
    </div>
  );
};

export default LoginPage;

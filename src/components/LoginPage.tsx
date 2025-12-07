import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { Loader2, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay
    setTimeout(() => {
        // Check credentials against AppContext user (demo logic)
        const validUsername = user.username || 'admin';
        const validPassword = user.password || 'admin';

        if (username === validUsername && password === validPassword) {
            navigate('/dashboard');
        } else {
            setError('Invalid username or password');
        }
        setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020202] text-white p-4">
      <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#f97316] rounded-xl flex items-center justify-center text-white font-serif italic font-bold text-2xl shadow-lg shadow-orange-500/20 mx-auto mb-4">W</div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-gray-400 text-sm mt-2">Enter your credentials to access your dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm text-center">
                    {error}
                </div>
            )}
            
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Username</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-xl text-white outline-none focus:border-[#f97316] transition-colors"
                    placeholder="admin"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-xl text-white outline-none focus:border-[#f97316] transition-colors"
                    placeholder="admin"
                />
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white dark:text-black font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-[#f97316]/20 flex items-center justify-center gap-2 mt-4"
            >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
            </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
            <p>Demo Credentials: admin / admin</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

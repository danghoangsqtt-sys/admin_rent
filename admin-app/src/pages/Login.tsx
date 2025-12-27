
import React, { useState } from 'react';
import { ShieldAlert, Lock, LogIn } from 'lucide-react';
import { loginAdmin } from '../services/FirebaseService';

const Login: React.FC = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await loginAdmin();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-900 rounded-[1.75rem] flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">ADMIN CONSOLE</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">RentMaster Pro Ecosystem</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            {loading ? "Đang xử lý..." : <><LogIn size={18} /> Đăng nhập bằng Google</>}
          </button>
          
          {error && <p className="text-rose-500 text-[10px] font-black text-center uppercase tracking-wider">{error}</p>}
        </div>

        <div className="pt-8 border-t border-slate-50 flex items-center justify-center gap-2 text-slate-300">
           <Lock size={12} />
           <span className="text-[10px] font-black uppercase tracking-widest">Truy cập giới hạn cho Admin</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

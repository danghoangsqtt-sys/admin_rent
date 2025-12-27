
import React, { useState, useEffect } from 'react';
import { 
  Users, Award, Zap, Search, RefreshCw, 
  ChevronRight, LogOut, CheckCircle, XCircle 
} from 'lucide-react';
import { fetchAllUsers, updateProStatus, auth } from '../services/FirebaseService';
import { signOut } from 'firebase/auth';

const Dashboard: React.FC<{ user: any }> = ({ user }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleTogglePro = async (uid: string, current: boolean) => {
    if (window.confirm(`Xác nhận ${current ? 'HỦY' : 'KÍCH HOẠT'} gói Pro cho người dùng này?`)) {
      await updateProStatus(uid, !current);
      loadUsers();
    }
  };

  const filtered = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 p-8 flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic">R</div>
          <h2 className="text-white font-black italic text-lg tracking-tight">Admin Master</h2>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={Users} label="Quản lý User" active />
          <NavItem icon={Award} label="Gói đăng ký" />
          <NavItem icon={Zap} label="Hoạt động" />
        </nav>

        <button 
          onClick={() => signOut(auth)}
          className="mt-auto flex items-center gap-3 text-slate-500 hover:text-rose-500 font-bold text-sm transition-colors"
        >
          <LogOut size={18} /> Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Quản Trị</h1>
            <p className="text-slate-400 font-medium mt-1">Theo dõi và quản lý người dùng app điện thoại.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
               <img src={user.photoURL} className="w-8 h-8 rounded-full" />
               <span className="text-sm font-black uppercase text-slate-700">{user.displayName}</span>
             </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <StatCard label="Tổng người dùng" value={users.length} color="bg-blue-600" icon={Users} />
          <StatCard label="Gói Pro Active" value={users.filter(u => u.isPro).length} color="bg-amber-500" icon={Award} />
          <StatCard label="Đang chờ" value={users.filter(u => !u.isPro).length} color="bg-slate-400" icon={RefreshCw} />
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Danh sách khách hàng</h3>
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                className="w-full bg-slate-50 rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 ring-blue-500/10" 
                placeholder="Tìm email, tên người dùng..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Người dùng</th>
                  <th className="px-8 py-4">Ngày tham gia</th>
                  <th className="px-8 py-4">Trạng thái</th>
                  <th className="px-8 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="p-12 text-center text-slate-300 font-bold">Đang tải dữ liệu...</td></tr>
                ) : filtered.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={u.photoURL} className="w-10 h-10 rounded-xl shadow-sm" />
                        <div>
                          <p className="font-black text-slate-800 text-sm">{u.displayName}</p>
                          <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-500">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${u.isPro ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                        {u.isPro ? 'Gói Pro' : 'Free'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleTogglePro(u.uid, u.isPro)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${u.isPro ? 'bg-rose-50 text-rose-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'}`}
                      >
                        {u.isPro ? 'Hủy gói' : 'Kích hoạt Pro'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active }: any) => (
  <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
    <Icon size={20} /> {label}
  </button>
);

const StatCard = ({ label, value, color, icon: Icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <h3 className="text-4xl font-black text-slate-900 italic">{value}</h3>
    </div>
    <div className={`w-16 h-16 ${color} rounded-[1.75rem] flex items-center justify-center text-white shadow-lg`}>
      <Icon size={32} />
    </div>
  </div>
);

export default Dashboard;

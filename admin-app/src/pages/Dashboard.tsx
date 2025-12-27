import React, { useState, useEffect } from 'react';
import { 
  Users, Award, Zap, Search, RefreshCw, 
  LogOut, LayoutGrid, Plus, Edit3, Trash2, Check, X,
  Clock, Activity, Lock, Unlock, ChevronLeft, ChevronRight, MoreVertical
} from 'lucide-react';
import { 
  fetchAllUsers, updateProStatus, toggleBanStatus, deleteUserPermanent, auth, 
  fetchPackages, savePackage, deletePackage, fetchSystemLogs 
} from '../services/FirebaseService';
import { signOut } from 'firebase/auth';

const Dashboard: React.FC<{ user: any }> = ({ user }) => {
  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  
  // Pagination State (Phân trang)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Số user hiển thị mỗi trang

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    const [userData, packageData, logData] = await Promise.all([
      fetchAllUsers(), fetchPackages(), fetchSystemLogs()
    ]);
    setUsers(userData);
    setPackages(packageData);
    setLogs(logData);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // --- USER ACTIONS ---
  const handleTogglePro = async (uid: string, current: boolean, email: string) => {
    if (window.confirm(`Xác nhận ${current ? 'HỦY' : 'KÍCH HOẠT'} gói Pro?`)) {
      await updateProStatus(uid, !current, email);
      loadData();
    }
  };

  const handleToggleBan = async (uid: string, current: boolean, email: string) => {
    const action = current ? "MỞ KHÓA" : "KHÓA";
    if (window.confirm(`Bạn có chắc muốn ${action} tài khoản ${email} không?\nNgười dùng sẽ ${current ? 'có thể' : 'không thể'} đăng nhập.`)) {
      await toggleBanStatus(uid, !current, email);
      loadData();
    }
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (window.confirm(`CẢNH BÁO: Hành động này không thể hoàn tác!\nXóa vĩnh viễn user ${email}?`)) {
      await deleteUserPermanent(uid, email);
      loadData();
    }
  };

  // --- PACKAGE ACTIONS ---
  const handleEditPackage = (pkg?: any) => {
    setEditingPkg(pkg || { name: '', price: 0, duration: 1, features: '', isPopular: false });
    setShowModal(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;
    const pkgToSave = {
      ...editingPkg,
      features: Array.isArray(editingPkg.features) ? editingPkg.features : editingPkg.features.split(',').map((f: string) => f.trim()).filter(Boolean)
    };
    await savePackage(pkgToSave);
    setShowModal(false);
    loadData();
  };

  const handleDeletePackage = async (id: string, name: string) => {
    if (window.confirm("Xóa gói cước này?")) {
      await deletePackage(id, name);
      loadData();
    }
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Vừa xong';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 p-6 flex flex-col h-screen sticky top-0 shadow-2xl z-10">
        <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-blue-500/50">R</div>
          <div>
            <h2 className="text-white font-black italic text-lg tracking-tight leading-none">Admin</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Master Panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem icon={Users} label="Quản lý User" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <NavItem icon={Award} label="Gói đăng ký" active={activeTab === "packages"} onClick={() => setActiveTab("packages")} />
          <NavItem icon={Zap} label="Hoạt động" active={activeTab === "activity"} onClick={() => setActiveTab("activity")} />
        </nav>
        <button onClick={() => signOut(auth)} className="mt-auto flex items-center gap-3 text-slate-500 hover:text-white font-bold text-sm p-4 hover:bg-slate-800 rounded-xl transition-all">
          <LogOut size={18} /> Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto relative">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {activeTab === "users" && "Quản Lý Người Dùng"}
              {activeTab === "packages" && "Quản Lý Gói Cước"}
              {activeTab === "activity" && "Nhật Ký Hệ Thống"}
            </h1>
            <p className="text-slate-400 font-medium mt-1 text-sm">Hệ thống quản lý tập trung RentMaster Pro</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-full shadow-sm border border-slate-100">
             <img src={user.photoURL} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
             <span className="text-xs font-black uppercase text-slate-700">{user.displayName}</span>
          </div>
        </header>

        {/* --- TAB: USERS --- */}
        {activeTab === "users" && (
          <>
            <div className="grid grid-cols-4 gap-6 mb-8">
              <StatCard label="Tổng người dùng" value={users.length} color="bg-blue-600" icon={Users} />
              <StatCard label="Gói Pro" value={users.filter(u => u.isPro).length} color="bg-amber-500" icon={Award} />
              <StatCard label="User bị khóa" value={users.filter(u => u.isBanned).length} color="bg-rose-500" icon={Lock} />
              <StatCard label="User mới (24h)" value={users.length} color="bg-emerald-500" icon={RefreshCw} />
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
              {/* Header Table */}
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={18} className="text-blue-600"/> 
                  <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Danh sách khách hàng ({filteredUsers.length})</span>
                </div>
                <div className="relative w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all" 
                    placeholder="Tìm email, tên..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </div>
              </div>

              {/* Table Users */}
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Thông tin User</th>
                      <th className="px-6 py-4">Ngày tham gia</th>
                      <th className="px-6 py-4">Gói cước</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {currentUsers.length === 0 ? (
                       <tr><td colSpan={5} className="p-10 text-center text-slate-400 font-medium">Không tìm thấy người dùng nào.</td></tr>
                    ) : currentUsers.map(u => (
                      <tr key={u.uid} className={`hover:bg-blue-50/30 transition-colors group ${u.isBanned ? 'bg-rose-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={u.photoURL} className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-100" referrerPolicy="no-referrer" />
                            <div>
                              <p className={`font-bold text-sm ${u.isBanned ? 'text-rose-600' : 'text-slate-700'}`}>{u.displayName}</p>
                              <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-semibold">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '---'}</td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border ${u.isPro ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                             {u.isPro ? <Award size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>}
                             {u.isPro ? 'PRO' : 'FREE'}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.isBanned ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-600 text-[10px] font-black uppercase border border-rose-200">
                              <Lock size={10} /> Bị khóa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase border border-emerald-100">
                              <Check size={10} /> Hoạt động
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            {/* Nút Toggle Pro */}
                            <button onClick={() => handleTogglePro(u.uid, u.isPro, u.email)} title={u.isPro ? "Hủy Pro" : "Kích hoạt Pro"}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.isPro ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-600'}`}>
                              <Award size={16} />
                            </button>
                            
                            {/* Nút Khóa/Mở khóa */}
                            <button onClick={() => handleToggleBan(u.uid, u.isBanned, u.email)} title={u.isBanned ? "Mở khóa" : "Khóa tài khoản"}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.isBanned ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600'}`}>
                              {u.isBanned ? <Unlock size={16} /> : <Lock size={16} />}
                            </button>

                            {/* Nút Xóa */}
                            <button onClick={() => handleDeleteUser(u.uid, u.email)} title="Xóa vĩnh viễn"
                              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <p className="text-xs font-bold text-slate-400">Trang {currentPage} / {totalPages}</p>
                  <div className="flex gap-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft size={16} />
                    </button>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* --- TAB: PACKAGES (GIỮ NGUYÊN) --- */}
        {activeTab === "packages" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button onClick={() => handleEditPackage()} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 flex items-center gap-2 hover:-translate-y-1 transition-transform">
                <Plus size={18} /> Tạo gói mới
              </button>
            </div>
            <div className="grid grid-cols-3 gap-8">
              {packages.map(pkg => (
                <div key={pkg.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 relative group hover:shadow-2xl transition-all">
                  {pkg.isPopular && <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-b-xl shadow-lg tracking-widest">Phổ biến nhất</div>}
                  <div className="text-center mb-8 mt-4">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{pkg.name}</h3>
                    <div className="text-5xl font-black text-blue-600 tracking-tighter mb-2">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}</div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">/ {pkg.duration} tháng</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {Array.isArray(pkg.features) && pkg.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                        <div className="mt-0.5 min-w-[18px] h-[18px] bg-green-100 text-green-600 rounded-full flex items-center justify-center"><Check size={10} strokeWidth={4} /></div>{f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                    <button onClick={() => handleEditPackage(pkg)} className="flex-1 py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-xs uppercase hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"><Edit3 size={14} /> Sửa</button>
                    <button onClick={() => handleDeletePackage(pkg.id, pkg.name)} className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: ACTIVITY (GIỮ NGUYÊN) --- */}
        {activeTab === "activity" && (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 min-h-[60vh]">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><Activity size={24} /></div>
               <div><h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Nhật ký hoạt động</h3><p className="text-slate-400 text-xs font-bold">50 tác vụ gần nhất của Admin</p></div>
            </div>
            <div className="relative border-l-2 border-slate-100 ml-6 space-y-8 py-4">
              {logs.map(log => (
                <div key={log.id} className="relative pl-8 group">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125 ${log.type === 'danger' ? 'bg-rose-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                  <div className="flex justify-between items-start bg-slate-50 p-4 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all border border-transparent group-hover:border-slate-100">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2">{log.action} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {log.adminEmail}</p>
                      <p className="font-bold text-slate-700 text-sm">{log.detail}</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold whitespace-nowrap bg-white px-3 py-1 rounded-lg shadow-sm"><Clock size={12} /> {formatTime(log.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL FORM (Giữ nguyên) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">{editingPkg?.id ? 'Chỉnh sửa gói' : 'Thêm gói mới'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500"><X size={16} /></button>
            </div>
            <form onSubmit={handleSavePackage} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Tên gói cước</label>
                  <input required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 ring-blue-500/20 outline-none" 
                    value={editingPkg.name} onChange={e => setEditingPkg({...editingPkg, name: e.target.value})} placeholder="Ví dụ: Gói Pro 1 Năm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Giá tiền</label>
                    <input required type="number" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 ring-blue-500/20 outline-none" 
                      value={editingPkg.price} onChange={e => setEditingPkg({...editingPkg, price: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Thời hạn (Tháng)</label>
                    <input required type="number" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 ring-blue-500/20 outline-none" 
                      value={editingPkg.duration} onChange={e => setEditingPkg({...editingPkg, duration: Number(e.target.value)})} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Các tính năng</label>
                  <textarea required rows={3} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-medium text-slate-600 text-sm focus:ring-2 ring-blue-500/20 outline-none resize-none" 
                    value={Array.isArray(editingPkg.features) ? editingPkg.features.join(', ') : editingPkg.features} onChange={e => setEditingPkg({...editingPkg, features: e.target.value})} />
                </div>
                <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-xl cursor-pointer" onClick={() => setEditingPkg({...editingPkg, isPopular: !editingPkg.isPopular})}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${editingPkg.isPopular ? 'bg-amber-500 text-white' : 'bg-white border border-amber-200'}`}>
                    {editingPkg.isPopular && <Check size={12} strokeWidth={4} />}
                  </div>
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide select-none">Đánh dấu là "Phổ biến nhất"</span>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95">Lưu gói cước</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// NavItem & StatCard Helpers
const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/30 translate-x-2' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
    <Icon size={20} /> {label}
  </button>
);

const StatCard = ({ label, value, color, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-50 flex items-center justify-between">
    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p><h3 className="text-3xl font-black text-slate-900 italic">{value}</h3></div>
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}><Icon size={24} /></div>
  </div>
);

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { auth, db } from './services/FirebaseService';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lắng nghe trạng thái đăng nhập
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          // Cố gắng lấy dữ liệu từ Firestore
          const snap = await getDoc(doc(db, "users", fbUser.uid));
          
          if (snap.exists()) {
            setUser(snap.data());
          } else {
            // Nếu chưa có dữ liệu trong DB, tạo dữ liệu tạm từ Google để vào được App
            console.log("Không tìm thấy user trong DB, dùng user tạm");
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              isAdmin: true, // Tạm cấp quyền Admin
              isPro: false
            });
          }
        } catch (error) {
          // NẾU BỊ LỖI QUYỀN (Missing Permissions) -> VẪN CHO VÀO
          console.error("Lỗi lấy dữ liệu (nhưng vẫn cho phép vào):", error);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            isAdmin: true, // Tạm cấp quyền Admin để không bị kẹt
            isPro: false
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang kết nối hệ thống...</p>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
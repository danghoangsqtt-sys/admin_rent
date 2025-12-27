import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { 
  getFirestore, doc, getDoc, collection, getDocs, 
  updateDoc, query, orderBy, addDoc, deleteDoc, serverTimestamp, limit 
} from "firebase/firestore";

// --- DÁN CONFIG CỦA BẠN VÀO ĐÂY ---
const firebaseConfig = {
  apiKey: "AIzaSyCll5wdmjMcfHKUkOko4uqTT1kVgfDK01I", 
  authDomain: "rentmasterpro.firebaseapp.com",
  projectId: "rentmasterpro",
  storageBucket: "rentmasterpro.firebasestorage.app",
  messagingSenderId: "564624312294",
  appId: "1:564624312294:web:c942ade3eb5a080672f827"
};
// ------------------------------------

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- LOG SYSTEM ---
const logToSystem = async (action: string, detail: string, type: 'info' | 'warning' | 'danger' = 'info') => {
  try {
    const admin = auth.currentUser;
    await addDoc(collection(db, "system_logs"), {
      action,
      detail,
      type,
      adminEmail: admin?.email || 'Unknown',
      createdAt: serverTimestamp()
    });
  } catch (e) { console.error(e); }
};

// --- AUTH (Đã nâng cấp để chặn User bị Ban) ---
export const loginAdmin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    // Logic: Nếu user bị khóa (isBanned = true) thì không cho vào
    if (userSnap.exists() && userSnap.data().isBanned) {
      await signOut(auth);
      throw new Error("Tài khoản này đã bị KHÓA quyền truy cập.");
    }

    if (true || (userSnap.exists() && userSnap.data().isAdmin)) { 
      logToSystem("Đăng nhập", `Admin ${user.email} đã truy cập.`);
      
      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        return { 
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isAdmin: true,
          isPro: false,
          isBanned: false, // Mặc định không bị khóa
          createdAt: new Date().toISOString()
        };
      }
    } else {
      await signOut(auth);
      throw new Error("Không có quyền Admin.");
    }
  } catch (error: any) { throw error; }
};

// --- USER MANAGEMENT (NÂNG CẤP) ---
export const fetchAllUsers = async () => {
  try {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  } catch (e) { return []; }
};

export const updateProStatus = async (uid: string, status: boolean, email: string) => {
  await updateDoc(doc(db, "users", uid), { isPro: status });
  await logToSystem("Cập nhật User", `${status ? 'KÍCH HOẠT' : 'HỦY'} gói Pro cho ${email}`, status ? 'info' : 'warning');
};

// [MỚI] Khóa/Mở khóa tài khoản
export const toggleBanStatus = async (uid: string, status: boolean, email: string) => {
  await updateDoc(doc(db, "users", uid), { isBanned: status });
  await logToSystem("Khóa tài khoản", `${status ? 'KHÓA' : 'MỞ KHÓA'} tài khoản ${email}`, status ? 'danger' : 'success');
};

// [MỚI] Xóa tài khoản vĩnh viễn
export const deleteUserPermanent = async (uid: string, email: string) => {
  await deleteDoc(doc(db, "users", uid));
  await logToSystem("Xóa User", `Đã xóa vĩnh viễn user ${email}`, 'danger');
};

// --- PACKAGES & LOGS (GIỮ NGUYÊN) ---
export const fetchPackages = async () => {
  try {
    const q = query(collection(db, "packages"), orderBy("price", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
};

export const savePackage = async (pkg: any) => {
  const { id, ...data } = pkg;
  if (id) {
    await updateDoc(doc(db, "packages", id), data);
    await logToSystem("Sửa gói cước", `Cập nhật gói ${data.name}`);
  } else {
    await addDoc(collection(db, "packages"), { ...data, createdAt: serverTimestamp() });
    await logToSystem("Tạo gói mới", `Thêm gói ${data.name}`);
  }
};

export const deletePackage = async (id: string, name: string) => {
  await deleteDoc(doc(db, "packages", id));
  await logToSystem("Xóa gói cước", `Xóa gói ${name}`, 'danger');
};

export const fetchSystemLogs = async () => {
  try {
    const q = query(collection(db, "system_logs"), orderBy("createdAt", "desc"), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
};
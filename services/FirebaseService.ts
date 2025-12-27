
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, getDocs, updateDoc, query, orderBy } from "firebase/firestore";

// DÙNG CHUNG CONFIG VỚI APP ĐIỆN THOẠI
const firebaseConfig = {
  apiKey: "AIzaSyCll5wdmjMcfHKUkOko4uqTT1kVgfDK01I", 
  authDomain: "rentmasterpro.firebaseapp.com",
  projectId: "rentmasterpro",
  storageBucket: "rentmasterpro.firebasestorage.app",
  messagingSenderId: "564624312294",
  appId: "1:564624312294:web:c942ade3eb5a080672f827"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const loginAdmin = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists() && userSnap.data().isAdmin) {
    return userSnap.data();
  } else {
    await signOut(auth);
    throw new Error("Tài khoản của bạn không có quyền Admin.");
  }
};

export const fetchAllUsers = async () => {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data());
};

export const updateProStatus = async (uid: string, status: boolean) => {
  await updateDoc(doc(db, "users", uid), { isPro: status });
};

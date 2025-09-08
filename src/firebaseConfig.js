// src/firebaseConfig.js
// Firebase SDK'lardan gerekli fonksiyonları içeri aktarın
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";        // Firebase Authentication servisi için EKLENDİ
import { getFirestore } from "firebase/firestore"; // Firebase Firestore servisi için EKLENDİ

// Firebase konsolunuzdan aldığınız proje yapılandırma bilgileriniz
const firebaseConfig = {
  apiKey: "AIzaSyB0O7PZZ1CGiu9lSHAes68BQGizv3CQKF0", // Sizin API anahtarınız
  authDomain: "teknoproje-b82a3.firebaseapp.com",    // Sizin Auth Domain'iniz
  databaseURL: "https://teknoproje-b82a3-default-rtdb.firebaseio.com", // Realtime Database kullanıyorsanız kalsın
  projectId: "teknoproje-b82a3",                      // Sizin Project ID'niz
  storageBucket: "teknoproje-b82a3.firebasestorage.app",
  messagingSenderId: "1058253513184",
  appId: "1:1058253513184:web:70292b94a170dcb2010b85",
  measurementId: "G-179CJ3S4JQ"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerini başlat ve dışa aktar
const auth = getAuth(app);      // Authentication servisi başlatıldı
const db = getFirestore(app);   // Firestore servisi başlatıldı
const analytics = getAnalytics(app);

// Diğer Vue bileşenlerinizde kullanabilmek için servisleri dışarı aktarın
export { auth, db, analytics };
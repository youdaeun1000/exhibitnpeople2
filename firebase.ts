
// Firebase SDK import
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5nMWqCN-HpTqaU4BoMbYcksfFynHUSLw",
  authDomain: "exhibitnpeople-27927.firebaseapp.com",
  projectId: "exhibitnpeople-27927",
  storageBucket: "exhibitnpeople-27927.firebasestorage.app",
  messagingSenderId: "188039734624",
  appId: "1:188039734624:web:cf069b85d34de3d9246a05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 인증 모듈
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Firestore 모듈 초기화
 * experimentalForceLongPolling 설정을 활성화하여 네트워크 연결 안정성을 높입니다.
 */
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Storage 모듈
export const storage = getStorage(app);

/**
 * [제거됨] formatToFirebasePhone: 휴대폰 인증을 사용하지 않으므로 제거합니다.
 */

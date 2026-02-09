
/**
 * Firebase 인증용 전화번호 포맷터
 * 한국 로컬 번호를 E.164 국제 표준 형식으로 변환합니다.
 */
export const formatToFirebasePhone = (phone: string): string => {
  // 숫자만 추출
  const cleaned = phone.replace(/[^0-9]/g, '');
  
  // 0으로 시작하는 경우 국가코드 +82로 치환
  if (cleaned.startsWith('0')) {
    return '+82' + cleaned.slice(1);
  }
  
  // 이미 국가코드가 포함된 경우(예: 8210...)
  if (cleaned.startsWith('82')) {
    return '+' + cleaned;
  }

  return cleaned;
};

// Firebase SDK import
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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

/**
 * Firestore 모듈 초기화
 * [수정] 일부 네트워크 환경(프록시, 샌드박스 등)에서 gRPC 연결이 차단되어 
 * 'Could not reach Cloud Firestore backend' 에러가 발생하는 경우를 대비해 
 * experimentalForceLongPolling 설정을 활성화합니다.
 */
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Storage 모듈
export const storage = getStorage(app);

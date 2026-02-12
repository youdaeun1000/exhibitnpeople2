
import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface LoginViewProps {
  onVerifyComplete: (userData: { uid: string; email: string; name: string }, isExisting: boolean) => void;
}

export default function LoginView({ onVerifyComplete }: LoginViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDevOption, setShowDevOption] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setShowDevOption(false);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email) {
        throw new Error("이메일 정보를 가져올 수 없습니다.");
      }

      const userDoc = await getDoc(doc(db, "Users", user.uid));
      const isExisting = userDoc.exists();

      onVerifyComplete({
        uid: user.uid,
        email: user.email,
        name: user.displayName || '익명'
      }, isExisting);
    } catch (err: any) {
      console.error("Login Error Details:", err);
      
      if (err.code === 'auth/unauthorized-domain') {
        const hostname = window.location.hostname;
        setError(`Firebase 설정 필요: 현재 도메인(${hostname})이 승인된 도메인 목록에 없습니다. Firebase 콘솔 > Authentication > Settings에서 추가해 주세요.`);
        setShowDevOption(true); // 에러 발생 시 임시 로그인 버튼 노출
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("로그인 창이 닫혔습니다. 다시 시도해 주세요.");
      } else {
        setError("로그인 중 오류가 발생했습니다. (" + (err.message || err.code) + ")");
      }
    } finally {
      setLoading(false);
    }
  };

  // 테스트를 위한 임시 로그인 (Firebase 설정 전 단계용)
  const handleMockLogin = () => {
    onVerifyComplete({
      uid: "mock_user_123",
      email: "tester@example.com",
      name: "테스터"
    }, false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-8 max-w-lg mx-auto animate-in fade-in duration-500">
      <div className="mb-12 mt-16 text-center">
        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-teal-50 overflow-hidden border border-slate-50">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
            <rect x="8" y="4" width="24" height="32" rx="5" fill="#F1F5F9" />
            <rect x="10" y="6" width="20" height="28" rx="4" fill="#2DD4BF" />
            <path d="M16 14H24C24.5523 14 25 14.4477 25 15V20C25 20.5523 24.5523 21 24 21H20.5L18.5 23.5V21H16C15.4477 21 15 20.5523 15 20V15C15 14.4477 15.4477 14 16 14Z" fill="white" />
            <circle cx="27" cy="30" r="2.5" fill="#FDA4AF" />
          </svg>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl tracking-[-0.05em] leading-none flex items-center">
            <span className="font-extrabold text-teal-500">전시</span>
            <span className="font-bold text-slate-700 ml-1">와 사람들</span>
          </h1>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">
            Eye & Connection Community
          </p>
        </div>
      </div>

      <div className="space-y-6 flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-5 bg-white border border-slate-100 text-slate-800 font-black rounded-[2rem] shadow-xl shadow-slate-100 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-4 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Google로 시작하기
              </>
            )}
          </button>
          
          {error && (
            <div className="p-5 bg-red-50 rounded-2xl border border-red-100 animate-in slide-in-from-top-2">
              <p className="text-[11px] font-bold text-red-600 leading-relaxed">
                <i className="fa-solid fa-circle-exclamation mr-1.5"></i>
                {error}
              </p>
              
              {showDevOption && (
                <button 
                  onClick={handleMockLogin}
                  className="mt-4 w-full py-3 bg-red-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-red-100 active:scale-95 transition-all"
                >
                  임시 계정으로 기능 테스트하기
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="py-8 text-center mt-auto px-6">
        <p className="text-[10px] font-bold text-slate-300 leading-relaxed">
          Google 계정으로 간편하게 가입하고<br/>전시 문화를 함께 즐겨보세요.
        </p>
      </div>
    </div>
  );
}

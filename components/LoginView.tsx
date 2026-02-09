
import React, { useState } from 'react';

interface LoginViewProps {
  onVerifyComplete: (phoneNumber: string, isExisting: boolean) => void;
  suspendedNumbers: string[];
  existingPhoneNumbers: string[];
}

export default function LoginView({ onVerifyComplete, suspendedNumbers, existingPhoneNumbers }: LoginViewProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleQuickAuth = () => {
    setIsAuthenticating(true);
    
    // 실제 인증 프로세스를 시뮬레이션하는 약간의 지연 시간
    setTimeout(() => {
      // 데모를 위한 고정 번호 혹은 임의 번호 생성
      const mockPhone = '01012341234'; 
      const isExisting = existingPhoneNumbers.includes(mockPhone);
      
      onVerifyComplete(mockPhone, isExisting);
      setIsAuthenticating(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-8 max-w-lg mx-auto animate-in fade-in duration-500">
      <div className="mb-16 mt-20 text-center">
        {/* Brand Logo Container */}
        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-slate-100 overflow-hidden border border-slate-50">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
            <rect x="8" y="4" width="24" height="32" rx="5" fill="#F1F5F9" />
            <rect x="10" y="6" width="20" height="28" rx="4" fill="#2DD4BF" />
            <path d="M16 14H24C24.5523 14 25 14.4477 25 15V20C25 20.5523 24.5523 21 24 21H20.5L18.5 23.5V21H16C15.4477 21 15 20.5523 15 20V15C15 14.4477 15.4477 14 16 14Z" fill="white" />
            <circle cx="27" cy="30" r="2.5" fill="#FDA4AF" />
          </svg>
        </div>
        
        {/* Brand Title */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl tracking-[-0.05em] leading-none flex items-center">
            <span className="font-extrabold text-slate-800">전시</span>
            <span className="font-bold text-slate-400 ml-1">와 사람들</span>
          </h1>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-3">
            Simple & Art Life
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-start pt-10">
        <div className="text-center mb-12">
          <h2 className="text-xl font-black text-slate-800 leading-tight mb-3">
            휴대폰 본인 확인만으로<br/>
            간편하게 시작하세요
          </h2>
          <p className="text-sm font-medium text-slate-400">
            별도의 가입 절차 없이 인증 후 바로 이용 가능합니다.
          </p>
        </div>

        <button 
          onClick={handleQuickAuth}
          disabled={isAuthenticating}
          className={`w-full py-6 rounded-[2rem] font-black text-sm tracking-tight transition-all flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden ${
            isAuthenticating 
            ? 'bg-slate-100 text-slate-400 shadow-none' 
            : 'bg-slate-800 text-white active:scale-95'
          }`}
        >
          {isAuthenticating ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
              <span>본인 확인 중...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-mobile-screen-button text-lg"></i>
              <span>휴대폰 본인 확인으로 시작하기</span>
            </>
          )}
          
          {!isAuthenticating && (
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          )}
        </button>

        <div className="mt-8 grid grid-cols-3 gap-4 opacity-40 grayscale">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xs font-bold">SKT</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xs font-bold">KT</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xs font-bold">LG U+</div>
          </div>
        </div>
      </div>

      <div className="py-8 text-center mt-auto px-6">
        <p className="text-[9px] font-bold text-slate-300 leading-relaxed uppercase tracking-widest">
          Secure Authentication powered by Exhibireg
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

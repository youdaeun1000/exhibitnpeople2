
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface LoginViewProps {
  onVerifyComplete: (userData: { phoneNumber: string; name?: string; id?: string }, isExisting: boolean) => void;
}

export default function LoginView({ onVerifyComplete }: LoginViewProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(180); // 3분 타이머

  useEffect(() => {
    let interval: any;
    if (step === 'code' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setError("인증 시간이 만료되었습니다. 다시 시도해 주세요.");
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 10) {
      setError("올바른 휴대폰 번호를 입력해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    
    // 실제 환경에서는 여기서 Firebase signInWithPhoneNumber를 호출합니다.
    setTimeout(() => {
      setStep('code');
      setTimer(180);
      setLoading(false);
    }, 1000);
  };

  const handleCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setError("6자리 인증번호를 입력해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. 기존 유저 확인
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      const q = query(collection(db, "Users"), where("phone", "==", `+8210${formattedPhone.substring(3)}`));
      const querySnapshot = await getDocs(q);
      
      const isExisting = !querySnapshot.empty;
      let existingData = {};
      
      if (isExisting) {
        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data();
        existingData = {
          id: userDoc.id,
          name: data.nickname || data.name,
          phoneNumber: phoneNumber
        };
      }

      onVerifyComplete({ phoneNumber, ...existingData }, isExisting);
    } catch (err) {
      setError("인증 확인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-8 max-w-lg mx-auto animate-in fade-in duration-500">
      <div className="mb-12 mt-16 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 mx-auto shadow-sm border border-slate-100">
           <i className="fa-solid fa-mobile-screen-button text-2xl text-slate-800"></i>
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          {step === 'phone' ? '휴대폰 번호 로그인' : '인증번호 입력'}
        </h1>
        <p className="text-xs font-bold text-slate-400 leading-relaxed">
          {step === 'phone' 
            ? '본인 확인을 위해 휴대폰 번호를 입력해 주세요.' 
            : `${phoneNumber}번으로 전송된 인증번호를 입력해 주세요.`}
        </p>
      </div>

      <div className="flex-1">
        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div className="relative group">
              <input 
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`))}
                placeholder="010-0000-0000"
                className="w-full px-6 py-5 bg-slate-50 border-none rounded-3xl font-black text-lg focus:ring-4 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-200"
              />
            </div>
            <button 
              type="submit"
              disabled={loading || phoneNumber.length < 12}
              className="w-full py-5 bg-slate-800 text-white font-black rounded-[2rem] shadow-xl shadow-slate-100 active:scale-[0.98] transition-all text-sm disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
            >
              {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : '인증문자 받기'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeVerify} className="space-y-6">
            <div className="relative group">
              <input 
                type="number"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                placeholder="6자리 숫자 입력"
                className="w-full px-6 py-5 bg-slate-50 border-none rounded-3xl font-black text-center text-2xl tracking-[0.5em] focus:ring-4 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-200 placeholder:tracking-normal placeholder:text-sm"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-500">
                {formatTime(timer)}
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setStep('phone')}
                className="flex-1 py-5 bg-slate-50 text-slate-400 font-black rounded-[2rem] active:scale-[0.98] transition-all text-sm"
              >
                뒤로
              </button>
              <button 
                type="submit"
                disabled={loading || verificationCode.length !== 6 || timer === 0}
                className="flex-[2] py-5 bg-slate-800 text-white font-black rounded-[2rem] shadow-xl shadow-slate-100 active:scale-[0.98] transition-all text-sm disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
              >
                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : '인증 완료'}
              </button>
            </div>
          </form>
        )}

        {error && (
          <p className="text-[10px] font-bold text-red-500 text-center mt-6 flex items-center justify-center gap-1 animate-in shake duration-300">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </p>
        )}
      </div>

      <div className="py-8 text-center mt-auto">
        <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase tracking-widest">
          Secured by Firebase Auth
        </p>
      </div>
    </div>
  );
}


import React, { useState, useEffect, useRef } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface LoginViewProps {
  onVerifyComplete: (userData: { uid: string; email: string | null; name: string; phoneNumber: string | null }, isExisting: boolean) => void;
}

export default function LoginView({ onVerifyComplete }: LoginViewProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // 컴포넌트 언마운트 시 reCAPTCHA 정리
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.error("Cleanup error:", e);
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const initRecaptcha = () => {
    try {
      // 이미 인스턴스가 있다면 리셋 시도 후 재사용하거나 새로 생성
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError('인증 세션이 만료되었습니다. 다시 시도해 주세요.');
        }
      });
    } catch (err) {
      console.error("Recaptcha Init Error:", err);
      setError('인증 시스템 초기화에 실패했습니다.');
    }
  };

  const handleSendCode = async () => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNumber.match(/^010\d{8}$/)) {
      setError('올바른 휴대폰 번호를 입력해 주세요. (010으로 시작하는 11자리 숫자)');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      initRecaptcha();
      const appVerifier = recaptchaVerifierRef.current;
      if (!appVerifier) throw new Error("인증기 초기화 실패");

      const formattedPhone = `+82${cleanNumber.slice(1)}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      
      setConfirmationResult(result);
      setTimer(180);
    } catch (err: any) {
      console.error("Send Code Error:", err);
      // internal-error 대응: recaptcha 초기화 실패 시 인스턴스 초기화
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch(e) {}
        recaptchaVerifierRef.current = null;
      }
      
      if (err.code === 'auth/invalid-phone-number') {
        setError('유효하지 않은 번호 형식입니다.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('너무 많은 인증 시도가 있었습니다. 잠시 후 다시 시도해 주세요.');
      } else if (err.code === 'auth/internal-error') {
        setError('서버 내부 오류가 발생했습니다. 번호를 확인하거나 네트워크 연결을 확인해 주세요.');
      } else {
        setError(`인증 실패: ${err.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('인증번호 6자리를 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!confirmationResult) throw new Error('인증 세션이 만료되었습니다.');
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "Users", user.uid));
      const isExisting = userDoc.exists();

      onVerifyComplete({
        uid: user.uid,
        email: user.email,
        name: user.displayName || '익명',
        phoneNumber: user.phoneNumber
      }, isExisting);
    } catch (err: any) {
      console.error("Verify Code Error:", err);
      if (err.code === 'auth/code-expired') {
        setError('인증번호가 만료되었습니다. 다시 전송해 주세요.');
      } else if (err.code === 'auth/invalid-verification-code') {
        setError('인증번호가 일치하지 않습니다.');
      } else {
        setError('인증번호 확인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-8 max-w-lg mx-auto animate-in fade-in duration-500">
      <div id="recaptcha-container"></div>
      
      <div className="mb-12 mt-16 text-center">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-indigo-100 overflow-hidden border border-white">
          <i className="fa-solid fa-phone-volume text-white text-3xl"></i>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl tracking-[-0.05em] leading-none flex items-center">
            <span className="font-extrabold text-indigo-600">전시</span>
            <span className="font-bold text-slate-700 ml-1">와 사람들</span>
          </h1>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">
            Mobile Phone Authentication
          </p>
        </div>
      </div>

      <div className="space-y-6 flex-1 flex flex-col justify-center">
        {!confirmationResult ? (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">휴대폰 번호</label>
              <div className="relative">
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="01012345678"
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] font-black text-lg focus:outline-none focus:ring-4 focus:ring-indigo-100/30 focus:bg-white transition-all placeholder:text-slate-200"
                />
              </div>
            </div>
            
            <button 
              onClick={handleSendCode}
              disabled={loading || phoneNumber.length < 10}
              className="w-full py-5 bg-slate-800 text-white font-black rounded-[2rem] shadow-xl shadow-slate-100 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-4 disabled:bg-slate-100 disabled:text-slate-300"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
              ) : '인증번호 받기'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in zoom-in-95 duration-500">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">인증번호 6자리</label>
                {timer > 0 && (
                  <span className="text-[10px] font-black text-red-400">
                    {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                  </span>
                )}
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] font-black text-2xl tracking-[0.5em] text-center focus:outline-none focus:ring-4 focus:ring-indigo-100/30 focus:bg-white transition-all placeholder:text-slate-100"
                />
              </div>
            </div>
            
            <button 
              onClick={handleVerifyCode}
              disabled={loading || verificationCode.length !== 6}
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-4 disabled:bg-slate-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : '인증 완료'}
            </button>
            
            <button 
              onClick={() => {
                setConfirmationResult(null);
                if (recaptchaVerifierRef.current) {
                  try { recaptchaVerifierRef.current.clear(); } catch(e) {}
                  recaptchaVerifierRef.current = null;
                }
              }}
              className="w-full py-3 text-[11px] font-black text-slate-300 uppercase tracking-widest active:opacity-60"
            >
              번호 다시 입력하기
            </button>
          </div>
        )}

        {error && (
          <div className="p-5 bg-red-50 rounded-2xl border border-red-100 animate-in slide-in-from-top-2">
            <p className="text-[11px] font-bold text-red-600 leading-relaxed text-center">
              <i className="fa-solid fa-circle-exclamation mr-1.5"></i>
              {error}
            </p>
          </div>
        )}
      </div>

      <div className="py-8 text-center mt-auto px-6">
        <p className="text-[10px] font-bold text-slate-300 leading-relaxed">
          본인 확인을 위해 휴대폰 인증이 필요합니다.<br/>
          입력하신 정보는 안전하게 보호됩니다.<br/>
          (Internal Error 발생 시 번호를 확인해 주세요)
        </p>
      </div>
    </div>
  );
}

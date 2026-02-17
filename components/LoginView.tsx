
import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload,
  signOut
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface LoginViewProps {
  onVerifyComplete: (userData: { uid: string; email: string | null; name: string; phoneNumber: string | null }, isExisting: boolean) => void;
}

type AuthMode = 'login' | 'signup' | 'verification' | 'reset-password';

export default function LoginView({ onVerifyComplete }: LoginViewProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // 재발송 타이머 관리
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (mode === 'reset-password') {
      if (!validateEmail(trimmedEmail)) {
        setError('유효한 이메일 주소를 입력해 주세요.');
        return;
      }
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, trimmedEmail);
        alert('비밀번호 재설정 메일이 발송되었습니다. 메일함을 확인해 주세요.');
        setMode('login');
      } catch (err: any) {
        setError('비밀번호 재설정 메일 발송 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode !== 'verification') {
      if (!validateEmail(trimmedEmail)) {
        setError('유효한 이메일 주소를 입력해 주세요.');
        return;
      }
      if (password.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        const user = result.user;

        if (!user.emailVerified) {
          try {
            await sendEmailVerification(user);
            alert('인증 메일이 발송되었습니다. 메일함을 확인해주세요.');
          } catch (mailErr: any) {
            console.error("Email verification send error:", mailErr);
          }
          setMode('verification');
          setLoading(false);
          return;
        }
        
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        const isExisting = userDoc.exists();

        onVerifyComplete({
          uid: user.uid,
          email: user.email,
          name: user.displayName || '익명',
          phoneNumber: null
        }, isExisting);

      } else if (mode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        const user = result.user;

        try {
          await sendEmailVerification(user);
          alert('인증 메일이 성공적으로 발송되었습니다.');
        } catch (mailErr: any) {
          console.error("Email verification send error:", mailErr);
          setError('계정은 생성되었으나 인증 메일 발송에 실패했습니다. 재발송을 눌러주세요.');
        }
        setMode('verification');
        
      } else if (mode === 'verification') {
        const user = auth.currentUser;
        if (user) {
          await reload(user);
          if (user.emailVerified) {
            const userDoc = await getDoc(doc(db, "Users", user.uid));
            const isExisting = userDoc.exists();
            onVerifyComplete({
              uid: user.uid,
              email: user.email,
              name: user.displayName || '익명',
              phoneNumber: null
            }, isExisting);
          } else {
            setError('아직 이메일 인증이 완료되지 않았습니다. 메일함의 링크를 클릭한 뒤 이 버튼을 다시 눌러주세요.');
          }
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('이메일 또는 비밀번호가 잘못되었습니다. 정보를 다시 확인해 주세요.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('이미 가입된 이메일 주소입니다. 로그인 화면으로 이동해 주세요.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('너무 많은 시도가 있었습니다. 잠시 후 다시 시도해 주세요.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('네트워크 연결이 원활하지 않습니다. 인터넷 연결을 확인해 주세요.');
      } else {
        setError(err.message || '인증 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        await sendEmailVerification(user);
        setResendTimer(60);
        alert('인증 메일이 다시 발송되었습니다. 스팸 메일함도 꼭 확인해 보세요!');
        setError(null);
      } catch (err: any) {
        if (err.code === 'auth/too-many-requests') {
          setError('너무 자주 요청하셨습니다. 잠시 기다린 후 다시 시도해 주세요.');
        } else {
          setError('메일 발송 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = async () => {
    await signOut(auth);
    setMode('login');
    setError(null);
  };

  const switchToLogin = () => {
    setMode('login');
    setError(null);
  };

  if (mode === 'verification') {
    return (
      <div className="min-h-screen bg-white flex flex-col p-8 max-w-lg mx-auto animate-in fade-in duration-500">
        <div className="mb-12 mt-20 text-center">
          <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-indigo-100 border-2 border-white animate-pulse">
            <i className="fa-solid fa-paper-plane text-indigo-600 text-3xl"></i>
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
            메일을 확인해 주세요
          </h2>
          <p className="text-[11px] font-bold text-slate-400 mt-4 leading-relaxed max-w-[240px] mx-auto">
            <span className="text-indigo-600 font-black">{auth.currentUser?.email}</span>(으)로 인증 링크를 보냈습니다. <br/>
            링크 클릭 후 앱으로 돌아와주세요.
          </p>
        </div>

        <div className="flex-1 flex flex-col max-w-sm mx-auto w-full space-y-4">
          <button 
            onClick={handleAuth}
            disabled={loading}
            className="w-full py-5 bg-slate-800 text-white font-black rounded-[2rem] shadow-xl shadow-slate-100 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-600 border-t-white rounded-full animate-spin"></div>
            ) : '인증 완료 확인'}
          </button>

          <button 
            onClick={handleResendEmail}
            disabled={resendTimer > 0 || loading}
            className="w-full py-4 bg-white text-indigo-600 font-black rounded-[2rem] border border-indigo-100 transition-all text-[11px] disabled:text-slate-300 disabled:border-slate-100 flex items-center justify-center gap-3"
          >
            {loading && mode === 'verification' ? <div className="w-3 h-3 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div> : null}
            {resendTimer > 0 ? `재발송 가능까지 ${resendTimer}초` : '인증 메일 다시 받기'}
          </button>

          <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
               <i className="fa-solid fa-circle-question text-indigo-300"></i> 메일이 오지 않나요?
             </h4>
             <ul className="text-[10px] text-slate-400 font-bold space-y-2 leading-relaxed">
               <li className="flex items-start gap-2">
                 <span className="text-indigo-400">•</span>
                 <span>스팸 메일함 또는 프로모션 메일함을 확인해 보세요.</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-indigo-400">•</span>
                 <span>입력하신 이메일 주소가 정확한지 확인해 보세요.</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-indigo-400">•</span>
                 <span>일시적인 서버 지연일 수 있으니 1~2분 후 다시 시도해 보세요.</span>
               </li>
             </ul>
          </div>

          <button 
            onClick={handleCancel}
            className="w-full py-6 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:text-slate-500 transition-colors"
          >
            다른 이메일로 가입하기 / 취소
          </button>

          {error && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 animate-in slide-in-from-top-1">
              <p className="text-[10px] font-bold text-red-500 leading-relaxed text-center">
                {error}
              </p>
            </div>
          )}
        </div>

        <div className="py-12 text-center mt-auto">
          <p className="text-[9px] font-bold text-slate-200 leading-relaxed uppercase tracking-[0.2em]">
            Secure Verification via Firebase
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col p-8 max-w-lg mx-auto animate-in fade-in duration-500">
      <div className="mb-12 mt-16 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 mx-auto shadow-xl shadow-slate-100 border border-white">
          <i className="fa-solid fa-envelope-open-text text-slate-800 text-2xl"></i>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl tracking-[-0.05em] leading-none flex items-center">
            <span className="font-extrabold text-slate-800">전시</span>
            <span className="font-bold text-slate-300 ml-1">와 사람들</span>
          </h1>
          <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] mt-3">
            Email Authentication
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        {/* Tab Toggle */}
        {mode !== 'reset-password' && (
          <div className="flex p-1.5 bg-slate-50 rounded-2xl mb-10">
            <button 
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-3 text-[11px] font-black rounded-xl transition-all ${mode === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-300'}`}
            >
              로그인
            </button>
            <button 
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-3 text-[11px] font-black rounded-xl transition-all ${mode === 'signup' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-300'}`}
            >
              회원가입
            </button>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5 animate-in slide-in-from-bottom-2">
          {mode === 'reset-password' && (
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-800 mb-2">비밀번호 재설정</h2>
              <p className="text-xs text-slate-400 font-medium">가입하신 이메일 주소를 입력하시면 비밀번호를 바꿀 수 있는 링크를 보내드려요.</p>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">이메일 주소</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-6 py-4.5 bg-slate-50 border border-slate-50 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-slate-100/50 focus:bg-white transition-all placeholder:text-slate-200"
              required
            />
          </div>

          {mode !== 'reset-password' && (
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">비밀번호</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상 입력"
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-50 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-slate-100/50 focus:bg-white transition-all placeholder:text-slate-200"
                required
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || !email || (mode !== 'reset-password' && !password)}
            className="w-full py-5 bg-slate-800 text-white font-black rounded-[2rem] shadow-xl shadow-slate-100 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-4 disabled:bg-slate-100 disabled:text-slate-300 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-600 border-t-white rounded-full animate-spin"></div>
            ) : mode === 'login' ? '로그인하기' : mode === 'signup' ? '인증 메일 받기' : '재설정 메일 보내기'}
          </button>

          {mode === 'login' && (
            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => { setMode('reset-password'); setError(null); }}
                className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-indigo-500 transition-colors"
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>
          )}

          {mode === 'reset-password' && (
            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors"
              >
                로그인 화면으로 돌아가기
              </button>
            </div>
          )}
        </form>

        {error && (
          <div className="mt-8 p-5 bg-red-50 rounded-3xl border border-red-100 animate-in slide-in-from-top-2">
            <p className="text-[11px] font-bold text-red-500 leading-relaxed text-center mb-4">
              <i className="fa-solid fa-circle-exclamation mr-1.5"></i>
              {error}
            </p>
            {error.includes('이미 가입된 이메일') && (
              <button 
                onClick={switchToLogin}
                className="w-full py-3 bg-white border border-red-200 text-red-600 text-[10px] font-black rounded-xl active:bg-red-50 transition-colors"
              >
                지금 로그인하러 가기
              </button>
            )}
            {error.includes('이메일 또는 비밀번호가 잘못되었습니다') && mode === 'login' && (
              <button 
                onClick={() => { setMode('reset-password'); setError(null); }}
                className="w-full py-3 bg-white border border-red-200 text-red-600 text-[10px] font-black rounded-xl active:bg-red-50 transition-colors mt-2"
              >
                비밀번호 찾기
              </button>
            )}
          </div>
        )}
      </div>

      <div className="py-12 text-center mt-auto px-6">
        <p className="text-[10px] font-bold text-slate-200 leading-relaxed uppercase tracking-widest">
          Secure Email Authentication<br/>
          Protected by Firebase Auth
        </p>
      </div>
    </div>
  );
}

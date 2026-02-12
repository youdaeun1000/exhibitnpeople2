
import React, { useState } from 'react';

interface SignupViewProps {
  phoneNumber: string;
  onSignupComplete: (userData: { name: string; phoneNumber: string }) => void;
}

export default function SignupView({ phoneNumber, onSignupComplete }: SignupViewProps) {
  const [nickname, setNickname] = useState('');
  const [agreed, setAgreed] = useState({
    terms: false,
    privacy: false,
  });

  const validateNickname = (val: string) => {
    const regex = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣 ]+$/;
    if (!val.trim()) return '닉네임을 입력해주세요.';
    if (val.length < 2) return '최소 2자 이상 입력해주세요.';
    if (val.length > 10) return '최대 10자까지 입력 가능합니다.';
    if (!regex.test(val)) return '한글, 영문, 띄어쓰기만 가능합니다.';
    return '';
  };

  const handleAllAgree = (checked: boolean) => {
    setAgreed({
      terms: checked,
      privacy: checked,
    });
  };

  const isProfileValid = 
    !validateNickname(nickname) && 
    agreed.terms && 
    agreed.privacy;

  const handleComplete = () => {
    if (isProfileValid) {
      onSignupComplete({
        name: nickname.trim(),
        phoneNumber: phoneNumber,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-8 max-w-lg mx-auto animate-in fade-in duration-500">
      <div className="mb-12 mt-12">
        <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-teal-100">
          <i className="fa-solid fa-user-plus text-xl"></i>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
          반가워요!<br/>
          프로필을 설정해 주세요
        </h1>
        <p className="text-[10px] text-slate-400 mt-3 font-black uppercase tracking-widest">
          VERIFIED PHONE: <span className="text-teal-500">{phoneNumber}</span>
        </p>
      </div>

      <div className="space-y-10 flex-1 animate-in slide-in-from-bottom-4 duration-500">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">활동 닉네임</label>
          <input 
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="한글/영어 2~10자"
            className={`w-full px-6 py-5 bg-slate-50 border rounded-3xl font-bold text-sm focus:outline-none focus:ring-4 transition-all ${nickname && validateNickname(nickname) ? 'border-red-200 ring-red-50' : 'border-slate-50 focus:ring-teal-100/30 focus:bg-white'}`}
          />
          {nickname && validateNickname(nickname) && (
            <p className="text-[10px] font-bold text-red-500 ml-2 mt-2">{validateNickname(nickname)}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">약관 동의</h3>
            <label className="flex items-center gap-2 cursor-pointer group">
              <span className="text-[10px] font-black text-slate-300 group-hover:text-teal-600 transition-colors">전체 동의하기</span>
              <input 
                type="checkbox"
                checked={agreed.terms && agreed.privacy}
                onChange={(e) => handleAllAgree(e.target.checked)}
                className="w-4 h-4 rounded border-slate-200 text-teal-600 focus:ring-teal-500 transition-all"
              />
            </label>
          </div>
          
          <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100">
            <label className="flex items-center gap-3 group cursor-pointer">
              <input 
                type="checkbox"
                checked={agreed.terms}
                onChange={(e) => setAgreed({ ...agreed, terms: e.target.checked })}
                className="w-5 h-5 rounded-lg border-slate-200 text-teal-600 focus:ring-teal-500 transition-all"
              />
              <span className="text-xs font-bold text-slate-600">서비스 이용약관 동의 (필수)</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <input 
                type="checkbox"
                checked={agreed.privacy}
                onChange={(e) => setAgreed({ ...agreed, privacy: e.target.checked })}
                className="w-5 h-5 rounded-lg border-slate-200 text-teal-600 focus:ring-teal-500 transition-all"
              />
              <span className="text-xs font-bold text-slate-600">개인정보 수집 및 이용 동의 (필수)</span>
            </label>
          </div>
        </div>

        <div className="pt-4 pb-8 flex flex-col items-center">
          <button 
            onClick={handleComplete}
            disabled={!isProfileValid}
            className="w-full py-5 bg-teal-500 text-white font-black rounded-[2rem] shadow-xl shadow-teal-100 active:scale-[0.98] transition-all text-sm disabled:bg-slate-200 disabled:shadow-none mb-6"
          >
            가입 완료
          </button>
        </div>
      </div>
    </div>
  );
}

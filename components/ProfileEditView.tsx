
import React, { useState } from 'react';

interface ProfileEditViewProps {
  currentName: string;
  instagramUrl: string | null;
  lastNicknameChangedAt: number;
  onBack: () => void;
  onUpdate: (name: string, instagramUrl: string | null) => void;
}

export default function ProfileEditView({
  currentName,
  instagramUrl,
  lastNicknameChangedAt,
  onBack,
  onUpdate
}: ProfileEditViewProps) {
  const [name, setName] = useState(currentName);
  const [insta, setInsta] = useState(instagramUrl || '');
  const [error, setError] = useState('');

  const validate = (val: string, instaVal: string) => {
    const regex = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣 ]+$/;
    if (!val.trim()) return '닉네임을 입력해주세요.';
    if (val.length < 2) return '최소 2자 이상 입력해주세요.';
    if (val.length > 10) return '최대 10자까지 입력 가능합니다.';
    if (!regex.test(val)) return '닉네임에 한글, 영문, 띄어쓰기만 가능합니다.';
    
    const instaTrimmed = instaVal.trim();
    if (instaTrimmed && instaTrimmed.includes('/') && !instaTrimmed.includes('instagram.com')) {
      return '유효한 인스타그램 주소를 입력해주세요.';
    }
    return '';
  };

  const handleSubmit = () => {
    const err = validate(name, insta);
    if (err) {
      setError(err);
      return;
    }
    
    let finalInsta = insta.trim();
    if (finalInsta && !finalInsta.includes('instagram.com') && !finalInsta.startsWith('http')) {
      finalInsta = `https://www.instagram.com/${finalInsta}`;
    }
    
    onUpdate(name.trim(), finalInsta || null);
    onBack();
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-in slide-in-from-right duration-300">
      <div className="h-[64px] bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-50">
        <button onClick={onBack} className="w-10 h-10 -ml-2 flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
          <i className="fa-solid fa-chevron-left text-lg"></i>
        </button>
        <h2 className="text-[16px] font-black text-slate-900 tracking-tight">프로필 정보 수정</h2>
        <button 
          onClick={handleSubmit}
          className="text-indigo-600 font-black text-sm active:scale-90 transition-transform"
        >
          저장
        </button>
      </div>

      <div className="p-8 space-y-10 max-w-lg mx-auto">
        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">닉네임</label>
            <div className="relative">
              <input 
                type="text" 
                value={name}
                onChange={(e) => { setName(e.target.value); setError(validate(e.target.value, insta)); }}
                className={`w-full px-6 py-5 bg-white border rounded-3xl font-black text-sm focus:outline-none focus:ring-4 transition-all ${error ? 'border-red-100 ring-red-50' : 'border-slate-100 focus:ring-indigo-50'}`}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">
                {name.length}/10
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">인스타그램 주소</label>
            <div className="relative">
              <input 
                type="url" 
                value={insta}
                onChange={(e) => { setInsta(e.target.value); setError(validate(name, e.target.value)); }}
                placeholder="https://instagram.com/아이디"
                className={`w-full px-6 py-5 bg-white border rounded-3xl font-black text-sm focus:outline-none focus:ring-4 transition-all border-slate-100 focus:ring-indigo-50`}
              />
              <i className="fa-brands fa-instagram absolute right-6 top-1/2 -translate-y-1/2 text-slate-200"></i>
            </div>
          </div>

          {error && <p className="text-[10px] font-bold text-red-500 mt-2 px-2 flex items-center gap-1"><i className="fa-solid fa-circle-exclamation"></i>{error}</p>}
        </div>
      </div>
    </div>
  );
}

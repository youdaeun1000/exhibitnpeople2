
import React, { useState } from 'react';

interface WithdrawalGuideViewProps {
  onBack: () => void;
  onWithdrawalSubmit?: (reason: string) => void;
}

const WithdrawalGuideView: React.FC<WithdrawalGuideViewProps> = ({ onBack, onWithdrawalSubmit }) => {
  const [reason, setReason] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (!isAgreed) {
      alert('유의사항 확인에 동의해 주세요.');
      return;
    }
    if (window.confirm('정말 서비스를 탈퇴하시겠습니까? 탈퇴 신청 후에는 되돌릴 수 없으며 모든 데이터는 복구가 불가능합니다.')) {
      onWithdrawalSubmit?.(reason);
    }
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-white animate-in slide-in-from-bottom duration-500">
        <div className="h-[64px] bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-50 max-w-lg mx-auto">
          <button onClick={() => setShowForm(false)} className="w-10 h-10 -ml-2 flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
            <i className="fa-solid fa-chevron-left text-lg"></i>
          </button>
          <h2 className="text-[16px] font-black text-slate-900 tracking-tight">탈퇴 신청서 작성</h2>
          <div className="w-10"></div>
        </div>

        <div className="max-w-lg mx-auto p-8 space-y-12">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">탈퇴 사유 (선택)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="더 나은 서비스를 위해 탈퇴하시는 이유를 알려주시면 감사하겠습니다."
              className="w-full bg-slate-50 border-none rounded-3xl p-6 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-slate-100 outline-none resize-none min-h-[160px] transition-all"
            />
          </div>

          <div className="bg-red-50 rounded-[2rem] p-8 border border-red-100 space-y-6">
            <h4 className="text-sm font-black text-red-600 flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation"></i>
              탈퇴 전 꼭 확인해 주세요!
            </h4>
            <ul className="text-[11px] text-red-500/70 font-bold space-y-3 leading-relaxed">
              <li className="flex gap-2"><span>•</span><span>탈퇴 후에는 계정 정보 및 직접 등록한 전시, 투어, 모임 정보 등 모든 활동 데이터가 즉시 삭제되며 복구가 불가능합니다.</span></li>
              <li className="flex gap-2"><span>•</span><span>참여 중인 채팅방에서 자동으로 퇴장 처리됩니다.</span></li>
              <li className="flex gap-2"><span>•</span><span>탈퇴 후 1개월 동안은 부정 이용 방지를 위해 동일 정보로 재가입이 제한될 수 있습니다.</span></li>
            </ul>
            
            <label className="flex items-center gap-3 pt-4 border-t border-red-100 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isAgreed} 
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-red-200 text-red-600 focus:ring-red-500"
              />
              <span className="text-[11px] font-black text-red-600">위 유의사항을 모두 확인하였으며, 탈퇴에 동의합니다.</span>
            </label>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSubmit}
              disabled={!isAgreed}
              className="w-full py-5 bg-red-600 text-white font-black rounded-[2rem] shadow-xl shadow-red-100 active:scale-[0.98] transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none uppercase tracking-widest text-[11px]"
            >
              계정 삭제 및 서비스 탈퇴
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 animate-in slide-in-from-right duration-300">
      <div className="h-[64px] bg-white border-b border-slate-100 px-6 flex items-center gap-4 sticky top-0 z-50 max-w-lg mx-auto">
        <button 
          onClick={onBack} 
          className="w-10 h-10 -ml-2 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
        >
          <i className="fa-solid fa-chevron-left text-lg"></i>
        </button>
        <h2 className="text-[16px] font-black text-slate-900 tracking-tight">서비스 탈퇴 안내</h2>
      </div>

      <div className="max-w-lg mx-auto p-6 pb-20 space-y-8">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6">
            <i className="fa-solid fa-user-xmark text-2xl"></i>
          </div>
          <h3 className="text-xl font-black text-slate-900 leading-tight mb-4">
            전시와 사람들을<br/>
            떠나시려고 하나요?
          </h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            탈퇴하시면 그동안 쌓아온 전시 정보와 투어 기록, 새로운 인연들과의 모임 기록이 모두 사라집니다. 불편한 점이 있으셨다면 고객센터로 먼저 말씀해 주세요.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">탈퇴 요청 전 확인</h4>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                <i className="fa-solid fa-clock text-[10px]"></i>
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">처리 소요 시간</p>
                <p className="text-[11px] text-slate-400 font-medium">탈퇴 신청 시 운영진의 확인 후 1~3일 이내에 영구 삭제 처리됩니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                <i className="fa-solid fa-envelope text-[10px]"></i>
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">이메일 문의</p>
                <p className="text-[11px] text-slate-400 font-medium">직접 신청이 어려우신 경우 exhibitnpeople@gmail.com으로 연락 주세요.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 space-y-4">
           <button 
             onClick={() => setShowForm(true)}
             className="w-full py-5 bg-slate-800 text-white font-black rounded-[2rem] shadow-xl transition-all active:scale-[0.98] uppercase tracking-widest text-[11px]"
           >
             탈퇴 신청 계속하기
           </button>
           <button 
             onClick={onBack}
             className="w-full py-5 bg-white border border-slate-100 text-slate-400 font-black rounded-[2rem] transition-all active:scale-[0.98] uppercase tracking-widest text-[11px]"
           >
             계속 이용하기
           </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalGuideView;

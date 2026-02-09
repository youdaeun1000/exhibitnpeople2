
import React from 'react';

interface WithdrawalGuideViewProps {
  onBack: () => void;
}

const WithdrawalGuideView: React.FC<WithdrawalGuideViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 animate-in slide-in-from-right duration-300">
      {/* Header */}
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
        {/* Main Instruction Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6">
            <i className="fa-solid fa-circle-info text-2xl"></i>
          </div>
          <h3 className="text-xl font-black text-slate-900 leading-tight mb-4">
            서비스 탈퇴를 원하시면<br/>
            아래 이메일로 연락 부탁드립니다.
          </h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            위 정보를 보내주시면 확인 후 탈퇴 처리가 가능합니다. 안전한 데이터 파기를 위해 최선을 다하겠습니다.
          </p>
        </div>

        {/* Email Info Section - Removed redundant label */}
        <div className="bg-slate-100 rounded-3xl p-7 text-slate-800 border border-slate-200 flex items-center justify-center text-center">
          <p className="text-lg font-black select-all tracking-tight">exhibitnpeople@gmail.com</p>
        </div>

        {/* Required Info Section */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">탈퇴 요청 시 포함 정보</h4>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                <i className="fa-solid fa-phone text-[10px]"></i>
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">가입 시 사용한 휴대폰 번호 (필수)</p>
                <p className="text-[11px] text-slate-400 font-medium">본인 확인을 위해 반드시 필요합니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                <i className="fa-solid fa-pen-to-square text-[10px]"></i>
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">탈퇴 사유 (선택)</p>
                <p className="text-[11px] text-slate-400 font-medium">더 나은 서비스를 위한 참고용으로 활용됩니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Restriction Banner */}
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex gap-4 items-center">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 flex-shrink-0">
            <i className="fa-solid fa-clock-rotate-left"></i>
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] font-black text-slate-700">재가입 제한 안내</p>
            <p className="text-[10px] text-slate-500 font-bold leading-tight">재가입 제한: 탈퇴 후 1개월 동안 동일 휴대폰으로 재가입이 제한됩니다.</p>
          </div>
        </div>

        <div className="pt-8 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Exhibireg Support Team</p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalGuideView;

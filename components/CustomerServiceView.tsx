
import React from 'react';

interface CustomerServiceViewProps {
  onBack: () => void;
}

const CustomerServiceView: React.FC<CustomerServiceViewProps> = ({ onBack }) => {
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
        <h2 className="text-[16px] font-black text-slate-900 tracking-tight">고객센터</h2>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-8">
        {/* Main Info Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-6 shadow-inner">
            <i className="fa-solid fa-circle-info text-2xl"></i>
          </div>
          <h3 className="text-xl font-black text-slate-900 leading-tight mb-4">
            서비스 이용 중 문의사항이나<br/>
            건의사항은, 아래 이메일로 연락해주세요.
          </h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            보내주시는 소중한 의견은 서비스 개선에 큰 도움이 됩니다. 최대한 빠르게 확인하여 답변 드리겠습니다.
          </p>
        </div>

        {/* Email Info Section - Removed redundant labels */}
        <div className="space-y-4">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 transition-all select-all flex items-center justify-center text-center">
            <p className="text-lg font-black tracking-tight">exhibitnpeople@gmail.com</p>
          </div>
          <p className="text-[10px] text-center text-slate-400 font-bold px-2 uppercase tracking-widest">
            Long press to copy email
          </p>
        </div>

        {/* FAQ/Operation Guide Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
            <i className="fa-solid fa-clock"></i>
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">운영 시간 안내</p>
            <p className="text-[11px] text-slate-400 font-bold leading-tight mt-1">
              평일 10:00 - 18:00 (주말 및 공휴일 제외)<br/>
              운영 시간 외 접수된 문의는 다음 영업일에 확인합니다.
            </p>
          </div>
        </div>

        <div className="pt-8 text-center opacity-30">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Exhibireg Support Center</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceView;

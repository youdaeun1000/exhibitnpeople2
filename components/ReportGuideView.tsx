
import React from 'react';

interface ReportGuideViewProps {
  onBack: () => void;
}

const ReportGuideView: React.FC<ReportGuideViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 animate-in slide-in-from-right duration-300">
      <div className="h-[64px] bg-white border-b border-slate-100 px-6 flex items-center gap-4 sticky top-0 z-50 max-w-lg mx-auto">
        <button 
          onClick={onBack} 
          className="w-10 h-10 -ml-2 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
        >
          <i className="fa-solid fa-chevron-left text-lg"></i>
        </button>
        <h2 className="text-[16px] font-black text-slate-900 tracking-tight">신고 안내</h2>
      </div>

      <div className="max-w-lg mx-auto p-6 pb-20 space-y-8">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
            <i className="fa-solid fa-shield-halved text-2xl"></i>
          </div>
          <h3 className="text-xl font-black text-slate-900 leading-tight mb-4">
            안전한 커뮤니티를 위해<br/>
            부적절한 콘텐츠를 신고해 주세요.
          </h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            신고된 내용은 운영팀에서 검토 후 신속하게 조치하겠습니다. 허위 신고 시 이용이 제한될 수 있습니다.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">신고 유형</h4>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-500 flex-shrink-0 font-black text-xs">01</div>
              <div>
                <p className="text-sm font-black text-slate-800">부적절한 홍보 및 광고</p>
                <p className="text-[11px] text-slate-400 font-medium">상업적 홍보나 도배성 게시물</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-500 flex-shrink-0 font-black text-xs">02</div>
              <div>
                <p className="text-sm font-black text-slate-800">욕설, 비하, 혐오 표현</p>
                <p className="text-[11px] text-slate-400 font-medium">타인에게 불쾌감을 주는 공격적인 언어</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-500 flex-shrink-0 font-black text-xs">03</div>
              <div>
                <p className="text-sm font-black text-slate-800">개인정보 노출 및 사생활 침해</p>
                <p className="text-[11px] text-slate-400 font-medium">동의 없는 개인정보 공유 및 유포</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">신고 방법</h4>
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
            <p className="text-sm font-black leading-relaxed">
              각 게시물이나 프로필의 상세 화면 상단에 있는 [신고] 아이콘(경고 표시)을 클릭하여 신고 사유를 선택해 주세요.
            </p>
          </div>
        </div>

        <div className="pt-10 flex flex-col items-center gap-4">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Inquiry via Email</p>
          <div className="bg-slate-100 rounded-2xl px-6 py-3 border border-slate-200">
            <p className="text-sm font-black text-slate-600 select-all">exhibitnpeople@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGuideView;

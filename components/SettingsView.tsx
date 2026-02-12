
import React from 'react';

interface SettingsViewProps {
  onBack: () => void;
  onNavigateBlocked: () => void;
  onNavigateCustomerService: () => void;
  onWithdrawal: () => void;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  onBack, 
  onNavigateBlocked, 
  onNavigateCustomerService,
  onWithdrawal,
  onLogout
}) => {
  return (
    <div className="min-h-screen bg-slate-50 animate-in slide-in-from-bottom duration-300">
      {/* Settings Header */}
      <div className="h-[64px] bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-50 max-w-lg mx-auto">
        <button 
          onClick={onBack} 
          className="w-10 h-10 -ml-2 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
        >
          <i className="fa-solid fa-chevron-left text-lg"></i>
        </button>
        <h2 className="text-[16px] font-black text-slate-900 tracking-tight">설정</h2>
        <div className="w-10"></div>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        {/* Settings List */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          {/* 1. 차단 목록 */}
          <button 
            onClick={onNavigateBlocked}
            className="w-full px-8 py-6 flex items-center justify-between active:bg-slate-50 transition-colors group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-active:scale-110 transition-transform">
                <i className="fa-solid fa-user-slash text-sm"></i>
              </div>
              <span className="text-sm font-bold text-slate-800">차단 목록</span>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-200 group-active:translate-x-1 transition-transform"></i>
          </button>

          {/* 2. 고객센터 */}
          <button 
            onClick={onNavigateCustomerService}
            className="w-full px-8 py-6 flex items-center justify-between active:bg-slate-50 transition-colors group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-active:scale-110 transition-transform">
                <i className="fa-solid fa-circle-info text-sm"></i>
              </div>
              <span className="text-sm font-bold text-slate-800">고객센터</span>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-200 group-active:translate-x-1 transition-transform"></i>
          </button>

          {/* 3. 로그아웃 */}
          <button 
            onClick={onLogout}
            className="w-full px-8 py-6 flex items-center justify-between active:bg-red-50 transition-colors group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 group-active:scale-110 transition-transform">
                <i className="fa-solid fa-right-from-bracket text-sm"></i>
              </div>
              <span className="text-sm font-bold text-red-500">로그아웃</span>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-200 group-active:translate-x-1 transition-transform"></i>
          </button>

          {/* 4. 서비스 탈퇴 신청 */}
          <button 
            onClick={onWithdrawal}
            className="w-full px-8 py-6 flex items-center justify-between active:bg-slate-100 transition-colors group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-active:scale-110 transition-transform">
                <i className="fa-solid fa-user-xmark text-sm"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-400">서비스 탈퇴 신청</span>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-200 group-active:translate-x-1 transition-transform"></i>
          </button>
        </div>

        {/* Info Area */}
        <div className="px-6 py-4 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Version 1.2.4 (stable)</p>
          <p className="text-[8px] font-bold text-slate-200 mt-2">© 2025 EXHIBIREG. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

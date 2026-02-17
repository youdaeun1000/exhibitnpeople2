
import React from 'react';

interface SettingsViewProps {
  onBack: () => void;
  onNavigateBlocked: () => void;
  onNavigateCustomerService: () => void;
  onWithdrawal: () => void;
  onLogout: () => void;
  userEmail: string | null;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  onBack, 
  onNavigateBlocked, 
  onNavigateCustomerService,
  onWithdrawal,
  onLogout,
  userEmail
}) => {
  return (
    <div className="min-h-screen bg-white animate-in slide-in-from-right duration-500">
      {/* Settings Header */}
      <div className="fixed top-0 left-0 right-0 h-[80px] px-8 flex items-center justify-between z-50 max-w-lg mx-auto bg-white/80 backdrop-blur-xl">
        <button 
          onClick={onBack} 
          className="w-11 h-11 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Settings</h2>
        <div className="w-11"></div>
      </div>

      <div className="pt-28 px-8 space-y-16">
        <div className="space-y-6">
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Configuration</p>
          <h3 className="text-3xl font-black text-slate-800 leading-tight tracking-tighter">Application Settings</h3>
          
          {/* User Email Info Section */}
          <div className="mt-8 p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 flex flex-col gap-2">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest px-1">Logged in as</p>
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-at text-indigo-300 text-xs"></i>
              <p className="text-sm font-black text-slate-700 truncate">{userEmail || '익명 사용자'}</p>
            </div>
          </div>
        </div>

        {/* Settings Group */}
        <div className="space-y-12 pb-32">
          <section className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-2">Account & Safety</h4>
            <div className="space-y-4">
              <button 
                onClick={onNavigateBlocked}
                className="w-full bg-slate-50 rounded-[2rem] p-8 flex items-center justify-between group active:scale-[0.98] transition-all border border-slate-100/50"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-user-slash text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 tracking-tight">차단 사용자 관리</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Blocked list</p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] text-slate-200 group-hover:translate-x-1 transition-transform"></i>
              </button>

              <button 
                onClick={onNavigateCustomerService}
                className="w-full bg-slate-50 rounded-[2rem] p-8 flex items-center justify-between group active:scale-[0.98] transition-all border border-slate-100/50"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-circle-info text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 tracking-tight">고객센터 문의</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Support center</p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] text-slate-200 group-hover:translate-x-1 transition-transform"></i>
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-2">Session Control</h4>
            <div className="space-y-4">
              <button 
                onClick={onLogout}
                className="w-full bg-red-50/30 rounded-[2rem] p-8 flex items-center justify-between group active:scale-[0.98] transition-all border border-red-50"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-right-from-bracket text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-black text-red-600 tracking-tight">로그아웃</p>
                    <p className="text-[9px] font-bold text-red-300 uppercase tracking-widest mt-1">Exit session</p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] text-red-100 group-hover:translate-x-1 transition-transform"></i>
              </button>

              <button 
                onClick={onWithdrawal}
                className="w-full bg-white rounded-[2rem] p-8 flex items-center justify-between group active:scale-[0.98] transition-all border border-slate-100"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-user-xmark text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-300 tracking-tight">서비스 탈퇴 신청</p>
                    <p className="text-[9px] font-bold text-slate-200 uppercase tracking-widest mt-1">Withdrawal guide</p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] text-slate-100"></i>
              </button>
            </div>
          </section>

          <div className="pt-8 text-center space-y-2">
            <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">Version 1.2.4 stable</p>
            <p className="text-[8px] font-bold text-slate-100 uppercase tracking-tight">© 2025 EXHIBIREG. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

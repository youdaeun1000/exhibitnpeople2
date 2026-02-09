
import React from 'react';

interface BlockedManagementViewProps {
  blockedIds: Set<string>;
  onBack: () => void;
  onUnblock: (id: string) => void;
}

const BlockedManagementView: React.FC<BlockedManagementViewProps> = ({ blockedIds, onBack, onUnblock }) => {
  return (
    <div className="min-h-screen bg-slate-50 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-[60px] bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-50">
        <button onClick={onBack} className="text-slate-400 active:scale-90">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2 className="text-sm font-black text-slate-900">차단 사용자 관리</h2>
        <div className="w-6"></div>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-1.5 px-1 mb-8">
           <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
             차단된 사용자의 콘텐츠는 목록에 표시되지 않으며, 서로의 투어나 모임 참여 신청 및 메시지 전송이 제한됩니다.
           </p>
        </div>

        <div className="space-y-3">
          {Array.from(blockedIds).map(blockedId => (
            <div 
              key={blockedId as string} 
              className="bg-white p-5 rounded-[1.5rem] border border-slate-100 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2"
            >
               <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-black">
                    {String(blockedId).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                     <p className="text-sm font-black text-slate-800">User_{(blockedId as string).slice(-4)}</p>
                     <p className="text-[9px] text-slate-400 font-bold">상호작용이 제한됨</p>
                  </div>
               </div>
               <button 
                 onClick={() => onUnblock(blockedId as string)}
                 className="text-[10px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl active:scale-95 transition-all"
               >
                 해제
               </button>
            </div>
          ))}

          {blockedIds.size === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-slate-300 text-center grayscale opacity-30">
              <i className="fa-solid fa-shield-halved text-5xl mb-4"></i>
              <p className="text-[11px] font-black uppercase tracking-widest">차단된 사용자가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockedManagementView;

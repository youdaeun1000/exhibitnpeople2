
import React, { useState } from 'react';

interface NotificationSettingsViewProps {
  onBack: () => void;
}

export default function NotificationSettingsView({ onBack }: NotificationSettingsViewProps) {
  const [settings, setSettings] = useState({
    push: true,
    meetings: true,
    chat: true,
    marketing: false
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-in slide-in-from-right duration-300">
      <div className="h-[64px] bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-50">
        <button onClick={onBack} className="w-10 h-10 -ml-2 flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
          <i className="fa-solid fa-chevron-left text-lg"></i>
        </button>
        <h2 className="text-[16px] font-black text-slate-900 tracking-tight">알림 설정</h2>
        <div className="w-10"></div>
      </div>

      <div className="p-6 space-y-8 max-w-lg mx-auto">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">시스템 알림</h3>
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm divide-y divide-slate-50">
            <div className="p-6 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">푸시 알림</span>
                <span className="text-[10px] text-slate-400 font-medium">앱 전체 알림을 허용합니다</span>
              </div>
              <button 
                onClick={() => toggle('push')}
                className={`w-12 h-6 rounded-full relative transition-all ${settings.push ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${settings.push ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="p-6 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">모임 업데이트</span>
                <span className="text-[10px] text-slate-400 font-medium">내가 참여하거나 개설한 모임 소식</span>
              </div>
              <button 
                onClick={() => toggle('meetings')}
                className={`w-12 h-6 rounded-full relative transition-all ${settings.meetings ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${settings.meetings ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">새 채팅 메시지</span>
                <span className="text-[10px] text-slate-400 font-medium">채팅방에 새로운 대화가 올라올 때</span>
              </div>
              <button 
                onClick={() => toggle('chat')}
                className={`w-12 h-6 rounded-full relative transition-all ${settings.chat ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${settings.chat ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">기타</h3>
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="p-6 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">마케팅 정보 수신</span>
                <span className="text-[10px] text-slate-400 font-medium">새로운 전시 및 이벤트 혜택 알림</span>
              </div>
              <button 
                onClick={() => toggle('marketing')}
                className={`w-12 h-6 rounded-full relative transition-all ${settings.marketing ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${settings.marketing ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import React, { useMemo } from 'react';
import { Meeting } from '../types';

interface ExhibitionMeetingsViewProps {
  exhibitionId: string;
  exhibitionTitle: string;
  meetings: Meeting[];
  currentUserId: string;
  onBack: () => void;
  onSelectMeeting: (id: string) => void;
  onCreateNew: () => void;
  onSelectUser: (userId: string) => void;
}

const ExhibitionMeetingsView: React.FC<ExhibitionMeetingsViewProps> = ({
  exhibitionId,
  exhibitionTitle,
  meetings,
  onBack,
  onSelectMeeting,
  onCreateNew,
  onSelectUser
}) => {
  const isMeetingPast = (meetingDate: string, meetingTime: string) => {
    const meetingDateTime = new Date(`${meetingDate}T${meetingTime}`);
    return meetingDateTime < new Date();
  };

  const openMeetings = useMemo(() => {
    return meetings
      .filter(m => m.targetId === exhibitionId && !isMeetingPast(m.meetingDate, m.meetingTime))
      .sort((a, b) => new Date(`${a.meetingDate}T${a.meetingTime}`).getTime() - new Date(`${b.meetingDate}T${b.meetingTime}`).getTime());
  }, [meetings, exhibitionId]);

  const formatMeetingDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}.${date.getDate()}(${['일','월','화','수','목','금','토'][date.getDay()]})`;
  };

  return (
    <div className="min-h-screen bg-white pb-32 animate-in slide-in-from-right duration-500">
      <div className="fixed top-0 left-0 right-0 h-[80px] px-8 flex items-center justify-between z-50 max-w-lg mx-auto bg-white/80 backdrop-blur-xl">
        <button onClick={onBack} className="w-11 h-11 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest truncate max-w-[180px]">
          {exhibitionTitle}
        </h2>
        <div className="w-11"></div>
      </div>

      <div className="pt-28 px-8 space-y-12">
        <div className="space-y-4 px-2">
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Available Meetings</h3>
          <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic">
            기존 모임에 참여하여 새로운 인연을 만나보세요. 마음에 드는 모임이 없다면 아래 버튼으로 직접 만드실 수 있습니다.
          </p>
        </div>

        <div className="space-y-8 pb-20">
          {openMeetings.length > 0 ? (
            openMeetings.map((m) => {
              const acceptedCount = m.participants.filter(p => p.status === 'accepted').length + 1;
              return (
                <div 
                  key={m.id} 
                  onClick={() => onSelectMeeting(m.id)}
                  className="bg-slate-50 p-8 rounded-[2.5rem] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 pr-6">
                      <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-3">
                        {formatMeetingDate(m.meetingDate)} · {m.meetingTime}
                      </p>
                      <h4 className="font-black text-slate-800 text-lg tracking-tight leading-snug">
                        {m.title}
                      </h4>
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm">
                      <p className="text-[10px] font-black text-slate-800">{acceptedCount}/{m.maxParticipants}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div 
                      className="flex items-center gap-3 text-[10px] font-black text-slate-400"
                      onClick={(e) => { e.stopPropagation(); onSelectUser(m.creatorId); }}
                    >
                      <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[8px] shadow-sm">
                        {m.creatorName.charAt(0)}
                      </div>
                      <span>{m.creatorName}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">JOIN →</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center flex flex-col items-center opacity-40">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-ghost text-slate-200 text-xl"></i>
              </div>
              <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest italic">NO ACTIVE MEETINGS FOR THIS EXHIBIT</p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-10 left-8 right-8 z-[60] max-w-lg mx-auto">
        <button 
          onClick={onCreateNew}
          className="w-full py-5 bg-slate-800 text-white rounded-[2rem] font-black text-[11px] shadow-2xl transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3"
        >
          <i className="fa-solid fa-plus text-[10px]"></i>
          Create a New Meeting
        </button>
      </div>
    </div>
  );
};

export default ExhibitionMeetingsView;

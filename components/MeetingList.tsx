
import React, { useState, useMemo } from 'react';
import { Meeting, ExhibitionData, Tour } from '../types';

interface MeetingListProps {
  meetings: Meeting[];
  allExhibitions: ExhibitionData[];
  allTours: Tour[];
  currentUserId: string;
  onSelectMeeting: (id: string) => void;
  onEnterChat: (id: string) => void;
  onSelectUser: (userId: string) => void;
  onJoinRequest?: (meetingId: string) => void;
  onKickParticipant?: (meetingId: string, userId: string) => void;
  onEditMeeting?: (meeting: Meeting) => void;
  onDeleteMeeting?: (meetingId: string) => void;
}

type MeetingSortType = 'dateTime' | 'newest';

const MeetingList: React.FC<MeetingListProps> = ({ 
  meetings, 
  allExhibitions, 
  allTours,
  currentUserId, 
  onEnterChat,
  onSelectUser,
  onJoinRequest,
  onKickParticipant,
  onEditMeeting,
  onDeleteMeeting
}) => {
  const [activeTab, setActiveTab] = useState<'open' | 'mine'>('open');
  const [sortBy, setSortBy] = useState<MeetingSortType>('dateTime');
  const [activeMenuUserId, setActiveMenuUserId] = useState<{mid: string, uid: string} | null>(null);

  const formatMeetingDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}.${date.getDate()}(${['일','월','화','수','목','금','토'][date.getDay()]})`;
  };

  const isMeetingPast = (meetingDate: string, meetingTime: string) => {
    const meetingDateTime = new Date(`${meetingDate}T${meetingTime}`);
    return meetingDateTime < new Date();
  };

  const filteredMeetings = useMemo(() => {
    if (activeTab === 'open') {
      const base = meetings.filter(m => {
        const acceptedCount = m.participants.filter(p => p.status === 'accepted').length + 1;
        const isFull = acceptedCount >= m.maxParticipants;
        const isPast = isMeetingPast(m.meetingDate, m.meetingTime);
        return !isFull && !isPast;
      });
      return [...base].sort((a, b) => {
        if (sortBy === 'dateTime') return new Date(`${a.meetingDate}T${a.meetingTime}`).getTime() - new Date(`${b.meetingDate}T${b.meetingTime}`).getTime();
        return b.createdAt - a.createdAt;
      });
    } else {
      return meetings.filter(m => {
        const isMyMeeting = m.creatorId === currentUserId || m.participants.some(p => p.userId === currentUserId);
        const isPast = isMeetingPast(m.meetingDate, m.meetingTime);
        return isMyMeeting && !isPast;
      }).sort((a, b) => new Date(`${a.meetingDate}T${a.meetingTime}`).getTime() - new Date(`${b.meetingDate}T${b.meetingTime}`).getTime());
    }
  }, [meetings, activeTab, currentUserId, sortBy]);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      <div className="bg-white px-8 pt-10 pb-6">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-10 uppercase">Meetings</h2>
        
        <div className="flex gap-10">
          <button 
            onClick={() => setActiveTab('open')}
            className={`pb-4 text-[11px] font-black relative transition-all tracking-widest ${activeTab === 'open' ? 'text-slate-800' : 'text-slate-200'}`}
          >
            OPEN
            {activeTab === 'open' && <div className="absolute -bottom-1 left-0 right-0 h-[3px] bg-slate-800 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('mine')}
            className={`pb-4 text-[11px] font-black relative transition-all tracking-widest ${activeTab === 'mine' ? 'text-slate-800' : 'text-slate-200'}`}
          >
            JOINED
            {activeTab === 'mine' && <div className="absolute -bottom-1 left-0 right-0 h-[3px] bg-slate-800 rounded-full" />}
          </button>
        </div>
      </div>

      <main className="px-8 space-y-12 animate-in fade-in duration-500 pt-6">
        {filteredMeetings.length > 0 ? filteredMeetings.map(m => {
          const acceptedParticipants = m.participants.filter(p => p.status === 'accepted');
          const acceptedCount = acceptedParticipants.length + 1;
          const isMember = m.creatorId === currentUserId || m.participants.some(p => p.userId === currentUserId && p.status === 'accepted');
          const isPending = m.participants.some(p => p.userId === currentUserId && p.status === 'pending');
          const isHost = m.creatorId === currentUserId;

          const tour = allTours.find(t => t.id === m.targetId);
          const exhibition = allExhibitions.find(e => e.id === m.targetId);
          const steps = tour?.steps || [];

          return (
            <div 
              key={m.id} 
              className="group bg-slate-50 p-8 rounded-[2.5rem] transition-all relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.15em]">
                      {formatMeetingDate(m.meetingDate)} · {m.meetingTime}
                    </p>
                    {isHost && (
                      <span className="text-[8px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-md uppercase">My Host</span>
                    )}
                  </div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight leading-snug mb-4">
                    {m.title}
                  </h3>
                  <div className="flex items-center gap-3 bg-white/50 w-fit px-3 py-1.5 rounded-xl border border-slate-100">
                    <i className="fa-solid fa-location-dot text-[9px] text-indigo-400"></i>
                    <span className="text-[10px] font-black text-slate-500 truncate max-w-[200px]">{m.location}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-50">
                    <p className="text-[10px] font-black text-slate-800">{acceptedCount}/{m.maxParticipants}</p>
                  </div>
                  {isHost && (
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEditMeeting?.(m); }}
                        className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 active:scale-90"
                      >
                        <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); if(window.confirm('모임을 삭제하시겠습니까?')) onDeleteMeeting?.(m.id); }}
                        className="w-8 h-8 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center text-red-400 active:scale-90"
                      >
                        <i className="fa-solid fa-trash-can text-[10px]"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-10 px-1">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Itinerary</p>
                <div className="relative pl-6 space-y-6">
                  <div className="absolute left-[7.5px] top-2 bottom-2 w-[1.5px] bg-slate-200 border-l border-dashed border-slate-300"></div>
                  
                  {m.targetType === 'tour' && tour ? (
                    steps.map((step, idx) => {
                      if (step.type === 'exhibition') {
                        const ex = allExhibitions.find(e => e.id === step.exhibitionId);
                        return (
                          <div key={`stop-${m.id}-${idx}`} className="relative flex items-center gap-4 group/stop">
                            <div className="absolute -left-[18.5px] w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white shadow-sm ring-4 ring-slate-50"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-800 truncate">{ex?.title || 'Unknown Exhibition'}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{ex?.galleryName || ex?.artist}</p>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div key={`stop-${m.id}-${idx}`} className="relative flex items-center gap-4 group/stop">
                            <div className="absolute -left-[18.5px] w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white shadow-sm ring-4 ring-slate-50"></div>
                            <div className="flex-1">
                              <p className="text-xs font-black text-amber-700 uppercase">Tea Time & Break</p>
                            </div>
                          </div>
                        );
                      }
                    })
                  ) : exhibition ? (
                    <div className="relative flex items-center gap-4 group/stop">
                      <div className="absolute -left-[18.5px] w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white shadow-sm ring-4 ring-slate-50"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{exhibition.title}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{exhibition.galleryName || exhibition.artist}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mb-10">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Participants</p>
                <div className="flex flex-wrap gap-3">
                  <div 
                    onClick={(e) => { e.stopPropagation(); onSelectUser(m.creatorId); }}
                    className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-slate-200 cursor-pointer active:scale-90 transition-all border-2 border-white relative"
                  >
                    {m.creatorName.charAt(0)}
                    <div className="absolute -top-1.5 -right-1.5 bg-teal-400 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <i className="fa-solid fa-crown text-[6px] text-white"></i>
                    </div>
                  </div>
                  
                  {acceptedParticipants.map(p => (
                    <div key={p.userId} className="relative">
                      <div 
                        onClick={(e) => { e.stopPropagation(); onSelectUser(p.userId); }}
                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 text-[10px] font-black border border-slate-100 cursor-pointer active:scale-90 transition-all shadow-sm"
                      >
                        {p.userName.charAt(0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                {isMember ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEnterChat(m.id); }} 
                    className="w-full py-4.5 bg-slate-800 text-white text-[11px] font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-slate-200 active:opacity-90 transition-all flex items-center justify-center gap-3"
                  >
                    Enter Chat Room <i className="fa-solid fa-comment-dots text-[10px]"></i>
                  </button>
                ) : isPending ? (
                  <button 
                    disabled 
                    className="w-full py-4.5 bg-white border border-slate-100 text-slate-300 text-[11px] font-black rounded-2xl uppercase tracking-widest"
                  >
                    Pending Approval...
                  </button>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onJoinRequest?.(m.id); }}
                    className="w-full py-4.5 bg-indigo-600 text-white text-[11px] font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all"
                  >
                    Apply to Join
                  </button>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="py-40 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <i className="fa-solid fa-ghost text-slate-200"></i>
            </div>
            <p className="text-[11px] font-black text-slate-200 uppercase tracking-widest italic leading-relaxed">
              {activeTab === 'open' ? 'NO ACTIVE MEETINGS' : 'NO JOINED MEETINGS'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MeetingList;

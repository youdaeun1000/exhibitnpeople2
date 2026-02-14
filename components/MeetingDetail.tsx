
import React, { useState, useEffect, useRef } from 'react';
import { Meeting, ExhibitionData, Tour, Participant } from '../types';

interface MeetingDetailProps {
  meeting: Meeting;
  allExhibitions: ExhibitionData[];
  allTours: Tour[];
  onBack: () => void;
  onSelectExhibition: (ex: ExhibitionData) => void;
  onSelectTour: (tour: Tour) => void;
  onAcceptParticipant: (meetingId: string, userId: string) => void;
  onEnterChat: () => void;
  currentUserId: string;
  blockedIds?: Set<string>;
  onJoinRequest?: () => void;
  onSelectUser: (userId: string) => void;
  onKickParticipant?: (userId: string) => void;
  onEditMeeting?: (meeting: Meeting) => void;
  onDeleteMeeting?: (meetingId: string) => void;
}

const MeetingDetail: React.FC<MeetingDetailProps> = ({ 
  meeting, 
  allExhibitions, 
  allTours,
  onBack, 
  onSelectExhibition,
  onEnterChat,
  currentUserId,
  onJoinRequest,
  onSelectUser,
  onKickParticipant,
  onEditMeeting,
  onDeleteMeeting
}) => {
  const isMember = meeting.creatorId === currentUserId || meeting.participants.some(p => p.userId === currentUserId && p.status === 'accepted');
  const isPending = meeting.participants.some(p => p.userId === currentUserId && p.status === 'pending');
  const isHost = meeting.creatorId === currentUserId;

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 60) setIsHeaderVisible(true);
      else if (currentScrollY > lastScrollY.current) setIsHeaderVisible(false);
      else setIsHeaderVisible(true);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tour = allTours.find(t => t.id === meeting.targetId);
  const exhibition = allExhibitions.find(e => e.id === meeting.targetId);
  const acceptedParticipants = meeting.participants.filter(p => p.status === 'accepted');
  const acceptedCount = acceptedParticipants.length + 1;

  const openKakaoMapSearch = (query: string) => {
    window.open(`https://map.kakao.com/?q=${encodeURIComponent(query)}`, '_blank');
  };

  const steps = tour?.steps || [];

  return (
    <div className="min-h-screen bg-white pb-40 animate-in slide-in-from-right duration-500">
      <div className={`fixed top-0 left-0 right-0 h-[80px] px-8 flex items-center justify-between z-50 max-w-lg mx-auto bg-white/80 backdrop-blur-xl transition-transform duration-500 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <button onClick={onBack} className="w-11 h-11 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all"><i className="fa-solid fa-chevron-left"></i></button>
        <div className="flex items-center gap-3">
          {isHost && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onEditMeeting?.(meeting)}
                className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black active:scale-95 transition-all"
              >
                EDIT
              </button>
              <button 
                onClick={() => { if(window.confirm('모임을 정말 삭제하시겠습니까?')) onDeleteMeeting?.(meeting.id); }}
                className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black active:scale-95 transition-all"
              >
                DELETE
              </button>
            </div>
          )}
          {!isHost && <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Meeting Detail</h2>}
        </div>
        {!isHost && <div className="w-11"></div>}
      </div>

      <div className="pt-28 px-8 space-y-12">
        <div className="space-y-6">
          <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{meeting.meetingDate}</p>
          <h3 className="text-3xl font-black text-slate-800 leading-tight tracking-tighter">{meeting.title}</h3>
        </div>

        <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-8 shadow-sm border border-slate-100/50">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm"><i className="fa-solid fa-user-circle text-lg"></i></div>
                 <button onClick={() => onSelectUser(meeting.creatorId)} className="text-left group/user">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Host</p>
                    <p className="text-sm font-bold text-slate-800 group-hover/user:text-indigo-600 transition-colors">{meeting.creatorName}</p>
                 </button>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Members</p>
                 <p className="text-sm font-bold text-slate-800">{acceptedCount}/{meeting.maxParticipants}</p>
              </div>
           </div>
           
           <div className="pt-8 border-t border-slate-200/50">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3 px-1">Meeting Start Point</p>
              <button 
                onClick={() => openKakaoMapSearch(meeting.location)}
                className="w-full flex items-start gap-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 text-left group/loc transition-all active:scale-[0.98]"
              >
                 <i className="fa-solid fa-location-dot text-indigo-500 mt-1"></i>
                 <div className="flex-1">
                    <p className="text-sm font-black text-slate-800 leading-relaxed group-hover/loc:text-indigo-600 transition-colors underline decoration-slate-100 underline-offset-4">{meeting.location}</p>
                    <p className="text-[10px] text-slate-300 font-bold mt-1 uppercase tracking-widest">Search on Kakao Map</p>
                 </div>
              </button>
           </div>
        </div>

        {/* Full Itinerary Section */}
        <div className="space-y-8">
           <div className="flex items-center justify-between px-2">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Full Schedule</h4>
              <span className="text-[9px] font-bold text-slate-300 uppercase italic">Timeline view</span>
           </div>

           {meeting.targetType === 'tour' && tour ? (
             <div className="relative pl-10 space-y-12 pt-2">
                {/* Vertical Path Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-100 border-l border-dashed border-slate-200"></div>

                {steps.map((step, idx) => {
                  if (step.type === 'exhibition') {
                    const ex = allExhibitions.find(e => e.id === step.exhibitionId);
                    if (!ex) return null;
                    const exhibitionIdx = steps.slice(0, idx + 1).filter(s => s.type === 'exhibition').length;
                    
                    return (
                      <div key={`step-${idx}`} className="relative group cursor-pointer" onClick={() => onSelectExhibition(ex)}>
                        {/* Circle Marker */}
                        <div className="absolute -left-[32px] top-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black ring-4 ring-white shadow-xl z-10 transition-transform group-active:scale-110">
                          {exhibitionIdx}
                        </div>
                        
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm transition-all group-active:translate-x-1">
                          <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-1.5">{ex.artist}</p>
                          <h5 className="text-sm font-black text-slate-800 leading-snug mb-3 truncate">{ex.title}</h5>
                          
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={(e) => { e.stopPropagation(); openKakaoMapSearch(ex.galleryName || ex.location); }}
                              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              <i className="fa-solid fa-map-location-dot text-[9px]"></i>
                              <span>{ex.galleryName || 'Location'}</span>
                            </button>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span className="text-[9px] font-bold text-slate-300 italic uppercase">Ends {ex.endDate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={`step-${idx}`} className="relative">
                        {/* Tea Marker */}
                        <div className="absolute -left-[32px] top-0 w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-black ring-4 ring-white shadow-xl z-10">
                          <i className="fa-solid fa-mug-hot"></i>
                        </div>
                        
                        <div className="bg-amber-50/50 rounded-3xl p-6 border border-amber-100/50 flex flex-col gap-1 shadow-sm">
                           <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Tea Time & Break</p>
                           <h5 className="text-sm font-black text-amber-900 leading-snug">함께 대화를 나누며 쉬어가는 시간</h5>
                        </div>
                      </div>
                    );
                  }
                })}
             </div>
           ) : exhibition ? (
             <div className="relative pl-10 space-y-12 pt-2">
                <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-100 border-l border-dashed border-slate-200"></div>
                <div className="relative group cursor-pointer" onClick={() => onSelectExhibition(exhibition)}>
                   <div className="absolute -left-[32px] top-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black ring-4 ring-white shadow-xl z-10">1</div>
                   <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm">
                      <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-1.5">{exhibition.artist}</p>
                      <h5 className="text-sm font-black text-slate-800 leading-snug mb-3">{exhibition.title}</h5>
                      <p className="text-[10px] font-bold text-slate-400">{exhibition.galleryName || exhibition.location}</p>
                   </div>
                </div>
             </div>
           ) : (
             <div className="py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 opacity-60">
                <i className="fa-solid fa-calendar-xmark text-2xl mb-3"></i>
                <p className="text-[10px] font-black uppercase tracking-widest">No Itinerary Available</p>
             </div>
           )}
        </div>

        <div className="space-y-6">
           <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest px-2">Participants</h4>
           <div className="flex flex-wrap gap-4">
              <div onClick={() => onSelectUser(meeting.creatorId)} className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-white text-[11px] font-black shadow-lg shadow-slate-200 cursor-pointer active:scale-90 transition-all">{meeting.creatorName.charAt(0)}</div>
              
              {acceptedParticipants.map(p => (
                <div key={p.userId} className="relative group">
                  <div 
                    onClick={() => onSelectUser(p.userId)} 
                    className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 text-[11px] font-black border border-slate-100 cursor-pointer active:scale-90 transition-all"
                  >
                    {p.userName.charAt(0)}
                  </div>
                  
                  {isHost && (
                    <div className="absolute -top-1 -right-1">
                       <button 
                         onClick={() => setActiveMenuUserId(activeMenuUserId === p.userId ? null : p.userId)}
                         className="w-6 h-6 bg-white border border-slate-100 rounded-full shadow-sm flex items-center justify-center text-slate-300 text-[8px] active:scale-90 transition-all"
                       >
                         <i className="fa-solid fa-ellipsis"></i>
                       </button>
                       
                       {activeMenuUserId === p.userId && (
                         <div className="absolute right-0 top-8 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[130] animate-in zoom-in-95 duration-200">
                           <button 
                             onClick={() => { onSelectUser(p.userId); setActiveMenuUserId(null); }}
                             className="w-full px-4 py-3 text-left text-[10px] font-black text-slate-600 hover:bg-slate-50 border-b border-slate-50 flex items-center gap-2"
                           >
                             <i className="fa-solid fa-user-circle opacity-30"></i>
                             프로필 보기
                           </button>
                           <button 
                             onClick={() => { onKickParticipant?.(p.userId); setActiveMenuUserId(null); }}
                             className="w-full px-4 py-3 text-left text-[10px] font-black text-red-400 hover:bg-red-50 flex items-center gap-2"
                           >
                             <i className="fa-solid fa-user-xmark opacity-50"></i>
                             모임에서 내보내기
                           </button>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="fixed bottom-10 left-8 right-8 z-[120] max-w-lg mx-auto">
         {isMember ? (
           <button onClick={onEnterChat} className="w-full py-5 bg-slate-800 text-white rounded-[2rem] font-black text-xs shadow-2xl active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-3">Join Chat Room <i className="fa-solid fa-comment-dots text-[10px]"></i></button>
         ) : isPending ? (
           <button disabled className="w-full py-5 bg-slate-50 text-slate-300 rounded-[2rem] font-black text-xs border border-slate-100 uppercase tracking-widest">Pending Approval</button>
         ) : (
           <button onClick={onJoinRequest} className="w-full py-5 bg-slate-800 text-white rounded-[2rem] font-black text-xs shadow-2xl active:scale-95 transition-all uppercase tracking-widest">Apply to Join</button>
         )}
      </div>
    </div>
  );
};

export default MeetingDetail;

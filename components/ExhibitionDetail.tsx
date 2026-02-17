
import React, { useState, useRef, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ExhibitionData, DayOfWeek, WeeklyHours, Tour, Meeting } from '../types';

interface ExhibitionDetailProps {
  exhibitionId: string;
  initialExhibition?: ExhibitionData | null;
  allExhibitions: ExhibitionData[];
  allTours: Tour[];
  allMeetings: Meeting[];
  isLiked: boolean;
  currentUserId: string;
  onBack: () => void;
  onLikeToggle: () => void;
  onSelectTour: (tour: Tour) => void;
  onSelectMeeting: (meetingId: string) => void;
  onSelectUser: (userId: string) => void;
  onEdit?: (ex: ExhibitionData) => void;
}

const ExhibitionDetail: React.FC<ExhibitionDetailProps> = ({
  exhibitionId,
  initialExhibition,
  allTours,
  allMeetings,
  isLiked,
  currentUserId,
  onBack,
  onLikeToggle,
  onSelectTour,
  onSelectMeeting,
  onSelectUser,
  onEdit
}) => {
  const [exhibition, setExhibition] = useState<ExhibitionData | null>(initialExhibition || null);
  const [loading, setLoading] = useState(!initialExhibition);
  const [error, setError] = useState<string | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  const isMeetingPast = (meetingDate: string, meetingTime: string) => {
    const meetingDateTime = new Date(`${meetingDate}T${meetingTime}`);
    return meetingDateTime < new Date();
  };

  useEffect(() => {
    const fetchExhibition = async () => {
      if (!exhibitionId) return;
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, 'exhibitions', exhibitionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status === 'hidden') setError('접근할 수 없는 전시입니다.');
          else setExhibition({ id: docSnap.id, ...data } as ExhibitionData);
        } else setError('전시를 찾을 수 없습니다.');
      } catch (err) { setError('오류가 발생했습니다.'); } finally { setLoading(false); }
    };
    fetchExhibition();
  }, [exhibitionId]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 100) setIsHeaderVisible(true);
      else if (currentScrollY > lastScrollY.current) setIsHeaderVisible(false);
      else setIsHeaderVisible(true);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center p-12"><div className="w-10 h-10 border-2 border-slate-100 border-t-slate-800 rounded-full animate-spin"></div></div>;
  if (error || !exhibition) return <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 text-center"><p className="text-sm font-bold text-slate-400 mb-8">{error}</p><button onClick={onBack} className="px-10 py-4 bg-slate-800 text-white font-black rounded-full">돌아가기</button></div>;

  const totalLikeCount = (exhibition.id.length * 12) + (isLiked ? 1 : 0);

  const openKakaoMapSearch = (query: string) => {
    window.open(`https://map.kakao.com/?q=${encodeURIComponent(query)}`, '_blank');
  };

  const activeExhibitionMeetings = allMeetings.filter(m => 
    m.targetId === exhibition.id && !isMeetingPast(m.meetingDate, m.meetingTime)
  );

  return (
    <div className="min-h-screen bg-white pb-32 relative overflow-y-auto ios-scroll">
      <div className={`fixed top-0 left-0 right-0 h-[80px] px-8 flex justify-between items-center transition-all duration-500 z-50 max-w-lg mx-auto bg-white/80 backdrop-blur-xl ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <button onClick={onBack} className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 active:scale-90 transition-all"><i className="fa-solid fa-chevron-left"></i></button>
        <div className="flex gap-3">
          <button onClick={onLikeToggle} className={`px-5 h-11 rounded-full flex items-center gap-2 bg-slate-50 transition-all ${isLiked ? 'text-slate-800' : 'text-slate-200'}`}><i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i><span className="text-[10px] font-black">{totalLikeCount}</span></button>
        </div>
      </div>

      <div className="px-8 pt-28 space-y-16">
        <div className="space-y-6">
          <p className="text-[11px] font-black text-teal-400 uppercase tracking-widest">{exhibition.artist || 'ANONYMOUS'}</p>
          <h1 className="text-3xl font-black text-slate-800 leading-tight tracking-tighter">{exhibition.title}</h1>
        </div>

        <div className="space-y-12">
          <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Period</p>
                <p className="text-sm font-bold text-slate-700 italic">{exhibition.startDate ? `${exhibition.startDate} - ${exhibition.endDate}` : `~ ${exhibition.endDate}`}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Venue</p>
                {exhibition.galleryName ? (
                  <button 
                    onClick={() => openKakaoMapSearch(exhibition.galleryName!)}
                    className="text-left group/gal flex items-center gap-2"
                  >
                    <p className="text-sm font-black text-slate-700 underline decoration-slate-200 underline-offset-4 group-hover/gal:text-indigo-600 transition-colors">{exhibition.galleryName}</p>
                    <i className="fa-solid fa-map-location-dot text-[10px] text-slate-300 group-hover/gal:text-indigo-400"></i>
                  </button>
                ) : (
                  <p className="text-sm font-bold text-slate-700">정보 없음</p>
                )}
                {exhibition.region && <p className="text-[10px] font-black text-slate-300 mt-1 uppercase tracking-tight">{exhibition.region} Area</p>}
              </div>
            </div>
          </div>

          <div className="px-4">
             <a href={exhibition.representativeLink} target="_blank" rel="noopener noreferrer" className="w-full py-5 bg-slate-800 text-white rounded-[2rem] font-black text-xs shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 transition-all">공식 링크 방문하기 <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i></a>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest px-2">Active Meetings</h3>
          <div className="space-y-4">
            {activeExhibitionMeetings.map(meeting => (
              <div key={meeting.id} onClick={() => onSelectMeeting(meeting.id)} className="bg-slate-50 p-8 rounded-[2.5rem] active:bg-slate-100 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-6"><h4 className="text-sm font-black text-slate-800 leading-snug pr-4">{meeting.title}</h4><span className="text-[10px] font-black text-teal-400">{meeting.participants.length+1}/{meeting.maxParticipants}</span></div>
                <div className="flex items-center justify-between"><p className="text-[10px] font-bold text-slate-400 italic">{meeting.meetingDate}</p><span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Detail →</span></div>
              </div>
            ))}
            {activeExhibitionMeetings.length === 0 && (
              <div className="py-20 text-center opacity-20"><p className="text-[10px] font-black uppercase tracking-widest">No meetings available.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionDetail;


import React, { useState, useRef, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ExhibitionData, Tour, Meeting } from '../types';

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

/**
 * Fixed the truncated component and added the missing default export.
 * This component provides a detailed view of an exhibition including location and operating hours.
 */
const ExhibitionDetail: React.FC<ExhibitionDetailProps> = ({
  exhibitionId,
  initialExhibition,
  isLiked,
  onBack,
  onLikeToggle,
}) => {
  const [exhibition, setExhibition] = useState<ExhibitionData | null>(initialExhibition || null);
  const [loading, setLoading] = useState(!initialExhibition);
  const [error, setError] = useState<string | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

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

  // 데모를 위한 임의의 좋아요 수 계산 (실제 서비스에서는 DB에서 가져와야 함)
  const baseLikeCount = (exhibition.id.charCodeAt(0) % 50) + 10;
  const totalLikeCount = baseLikeCount + (isLiked ? 1 : 0);

  const openKakaoMapSearch = (query: string) => {
    window.open(`https://map.kakao.com/?q=${encodeURIComponent(query)}`, '_blank');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white pb-32 relative overflow-y-auto ios-scroll">
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 h-[80px] px-8 flex justify-between items-center transition-all duration-500 z-50 max-w-lg mx-auto bg-white/80 backdrop-blur-xl ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <button onClick={onBack} className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 active:scale-90 transition-all">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="flex gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); onLikeToggle(); }} 
            className={`px-5 h-11 rounded-full flex items-center gap-2 transition-all active:scale-125 ${isLiked ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-50 text-slate-200'}`}
          >
            <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i>
            <span className={`text-[10px] font-black ${isLiked ? 'text-white' : 'text-slate-400'}`}>{totalLikeCount}</span>
          </button>
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
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm flex-shrink-0">
                <i className="fa-solid fa-landmark"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Gallery</p>
                <button 
                  onClick={() => openKakaoMapSearch(exhibition.galleryName || exhibition.location)}
                  className="text-left group/gal flex items-center gap-1.5"
                >
                  <p className="text-sm font-black text-slate-800 leading-tight group-hover/gal:text-indigo-600 transition-colors underline decoration-slate-200 underline-offset-4">{exhibition.galleryName || '정보 없음'}</p>
                  <i className="fa-solid fa-map-location-dot text-[9px] text-slate-200 group-hover/gal:text-indigo-400"></i>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm flex-shrink-0">
                <i className="fa-solid fa-calendar"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Period</p>
                <p className="text-sm font-bold text-slate-800 italic">
                  {exhibition.startDate ? `${formatDate(exhibition.startDate)} – ${formatDate(exhibition.endDate)}` : `UNTIL ${formatDate(exhibition.endDate)}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm flex-shrink-0">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Operating Hours</p>
                <p className="text-sm font-bold text-slate-800">{exhibition.openingHours || '정보 없음'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight px-2">Location</h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed px-2">
              {exhibition.location}
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-10 left-8 right-8 z-[120] max-w-lg mx-auto">
        <a 
          href={exhibition.representativeLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full py-5 bg-slate-800 text-white rounded-[2rem] font-black text-xs shadow-2xl active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
        >
          Official Website <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </a>
      </div>
    </div>
  );
};

export default ExhibitionDetail;

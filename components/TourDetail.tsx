
import React, { useState, useEffect, useRef } from 'react';
import { Tour, ExhibitionData, TourStop } from '../types';

interface TourDetailProps {
  tour: Tour;
  allExhibitions: ExhibitionData[];
  currentUserId: string;
  creatorName: string;
  onBack: () => void;
  onSelectExhibition: (ex: ExhibitionData) => void;
  onLikeToggle: () => void;
  onCreateMeeting: (id: string, title: string) => void;
  onReport: (id: string, type: 'review') => void;
  onEdit?: (tour: Tour) => void;
  onDelete?: (tourId: string) => void;
}

const InteractiveMap: React.FC<{ 
  steps: any[], 
  allExhibitions: ExhibitionData[], 
  onPinClick: (ex: ExhibitionData) => void 
}> = ({ steps, allExhibitions, onPinClick }) => {
  const getPos = (id: string) => {
    const num = parseInt(id.slice(-4), 16) || parseInt(id) || 0;
    return {
      x: (num * 17) % 80 + 10,
      y: (num * 23) % 70 + 15
    };
  };

  const exhibitionStepsOnly = steps.filter(s => s.type === 'exhibition');

  return (
    <div className="relative w-full h-[280px] bg-[#eef2f7] rounded-[2.5rem] overflow-hidden shadow-inner border border-slate-200 mb-8">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.15
        }}></div>
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <rect width="100%" height="100%" fill="#f1f5f9" />
          <path d="M-50 150 Q 200 50 450 150 T 950 50" fill="none" stroke="#64748b" strokeWidth="40" />
          <path d="M100 -50 Q 150 200 50 450" fill="none" stroke="#64748b" strokeWidth="30" />
        </svg>
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {exhibitionStepsOnly.length > 1 && exhibitionStepsOnly.map((step, i) => {
          if (i === 0) return null;
          const prevEx = allExhibitions.find(e => e.id === exhibitionStepsOnly[i-1].exhibitionId);
          const currEx = allExhibitions.find(e => e.id === step.exhibitionId);
          if (!prevEx || !currEx) return null;
          const p1 = getPos(prevEx.id);
          const p2 = getPos(currEx.id);
          return (
            <line 
              key={`line-${i}`}
              x1={`${p1.x}%`} y1={`${p1.y}%`} 
              x2={`${p2.x}%`} y2={`${p2.y}%`} 
              stroke="#6366f1" strokeWidth="4" strokeDasharray="8 6" strokeLinecap="round" opacity="0.4"
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 z-20 overflow-auto ios-scroll">
        <div className="relative w-full h-full">
          {steps.map((step, idx) => {
            if (step.type === 'exhibition') {
              const ex = allExhibitions.find(e => e.id === step.exhibitionId);
              if (!ex) return null;
              const pos = getPos(ex.id);
              const exhibitionIdx = steps.slice(0, idx + 1).filter(s => s.type === 'exhibition').length;

              return (
                <div 
                  key={`marker-${idx}-${ex.id}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 hover:scale-110 transition-transform cursor-pointer"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onClick={(e) => { e.stopPropagation(); onPinClick(ex); }}
                >
                  <div className="relative flex flex-col items-center">
                    <div className="bg-indigo-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-black text-[10px] shadow-xl border-2 border-white">
                      {exhibitionIdx}
                    </div>
                    <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-indigo-600 -mt-1"></div>
                    <div className="absolute top-full mt-1 bg-indigo-600/90 text-white px-2 py-0.5 rounded-md text-[8px] font-black whitespace-nowrap shadow-sm backdrop-blur-sm">
                      {ex.title}
                    </div>
                  </div>
                </div>
              );
            } else {
              return null;
            }
          })}
        </div>
      </div>
    </div>
  );
};

const TourDetail: React.FC<TourDetailProps> = ({ 
  tour, 
  allExhibitions, 
  currentUserId,
  creatorName, 
  onBack, 
  onSelectExhibition,
  onLikeToggle,
  onCreateMeeting,
  onReport,
  onEdit,
  onDelete
}) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const isCreator = currentUserId === tour.creatorId;

  const isEnded = (endDate: string) => {
    if (!endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return end < today;
  };

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

  const steps = tour.steps && tour.steps.length > 0 
    ? tour.steps 
    : tour.exhibitionIds.map(id => ({ type: 'exhibition', exhibitionId: id }));

  const handleDeleteClick = () => {
    onDelete?.(tour.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 animate-in slide-in-from-right duration-300">
      <div 
        className={`fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-slate-100 px-6 flex items-center justify-between z-50 max-w-lg mx-auto transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-400 active:scale-90 transition-transform">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <h2 className="text-[15px] font-black text-slate-900 truncate max-w-[160px]">{tour.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {isCreator && (
            <>
              <button 
                onClick={() => onEdit?.(tour)}
                className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg active:bg-indigo-50 active:text-indigo-600 transition-all"
              >
                수정
              </button>
              <button 
                onClick={handleDeleteClick}
                className="text-[10px] font-bold text-red-300 bg-red-50/30 px-2.5 py-1.5 rounded-lg active:bg-red-50 active:text-red-500 transition-all"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      <div className="pt-[80px]">
        <div className="px-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black">
              {creatorName.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold mb-0.5">투어 생성자</p>
              <p className="text-sm font-black text-slate-800">{creatorName}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">코스 지도</h3>
          </div>

          <InteractiveMap steps={steps} allExhibitions={allExhibitions} onPinClick={onSelectExhibition} />

          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">상세 일정</h3>
          </div>

          <div className="relative pl-8 space-y-10">
            <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-slate-200 border-l border-dashed border-slate-300"></div>

            {steps.map((step, idx) => {
              if (step.type === 'exhibition') {
                const ex = allExhibitions.find(e => e.id === step.exhibitionId);
                if (!ex) return null;
                const exhibitionIdx = steps.slice(0, idx + 1).filter(s => s.type === 'exhibition').length;
                const ended = isEnded(ex.endDate);
                return (
                  <div key={`step-detail-${idx}`} className="relative cursor-pointer group" onClick={() => onSelectExhibition(ex)}>
                    <div className={`absolute -left-[32px] top-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ring-4 ring-white shadow-md z-10 ${ended ? 'bg-slate-300' : 'bg-indigo-600 text-white'}`}>
                      {exhibitionIdx}
                    </div>
                    <div className={`bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm transition-all group-active:scale-[0.98] ${ended ? 'opacity-70 grayscale-[0.2]' : ''}`}>
                      <div className="flex p-5 gap-4">
                        <div className="flex-1 py-1 flex flex-col justify-center min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-black text-slate-900 text-sm truncate">{ex.title}</h4>
                            {ended && (
                              <span className="bg-slate-100 text-slate-400 text-[8px] font-black px-1.5 py-0.5 rounded-md border border-slate-200 flex-shrink-0">종료</span>
                            )}
                          </div>
                          <div className="flex items-center text-slate-400 text-[10px] font-bold">
                            <i className="fa-solid fa-location-dot mr-2 text-slate-300"></i>
                            <span className="truncate">{ex.address || ex.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={`step-detail-${idx}`} className="relative">
                    <div className="absolute -left-[32px] top-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-black ring-4 ring-white shadow-md z-10">
                      <i className="fa-solid fa-mug-hot"></i>
                    </div>
                    <div className="bg-amber-50 rounded-3xl border border-amber-100 shadow-sm p-5 flex flex-col gap-1">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm flex-shrink-0">
                            <i className="fa-solid fa-mug-hot text-xl"></i>
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-amber-900 uppercase">티타임</p>
                            {step.memo && <p className="text-[11px] font-bold text-amber-700 leading-snug mt-1">{step.memo}</p>}
                         </div>
                       </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-50/80 backdrop-blur-md max-w-lg mx-auto z-40 border-t border-slate-100">
        <button 
          onClick={() => onCreateMeeting(tour.id, tour.title)}
          className="w-full py-5 bg-slate-800 text-white font-black rounded-3xl shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-[11px]"
        >
          CREATE MEETING WITH THIS TOUR
        </button>
      </div>
    </div>
  );
};

export default TourDetail;

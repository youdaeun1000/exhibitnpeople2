
import React, { useState, useMemo } from 'react';
import { ExhibitionData, SortType } from '../types';

interface ExhibitionListProps {
  exhibitions: ExhibitionData[];
  onSelect: (exhibition: ExhibitionData) => void;
  onJoinMeeting: (exhibition: ExhibitionData) => void;
  likedIds: Set<string>;
  onLikeToggle: (id: string) => void;
  currentUserId: string;
}

interface ArtZone {
  id: string;
  name: string;
  exhibitions: ExhibitionData[];
}

const ExhibitionList: React.FC<ExhibitionListProps> = ({ 
  exhibitions, 
  onSelect, 
  onJoinMeeting,
  likedIds, 
  onLikeToggle
}) => {
  const [sortBy, setSortBy] = useState<SortType>('closing');
  const [searchQuery, setSearchQuery] = useState('');

  const isEnded = (endDate: string) => {
    if (!endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return end < today;
  };

  const artZones = useMemo(() => {
    if (sortBy !== 'region') return [];
    
    let activeEx = exhibitions.filter(ex => !isEnded(ex.endDate));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      activeEx = activeEx.filter(ex => 
        ex.title.toLowerCase().includes(q) || 
        ex.artist?.toLowerCase().includes(q) ||
        ex.galleryName?.toLowerCase().includes(q) ||
        ex.region?.toLowerCase().includes(q)
      );
    }

    const zoneMap: Record<string, ExhibitionData[]> = {};
    activeEx.forEach(ex => {
      const r = ex.region || "기타";
      if (!zoneMap[r]) zoneMap[r] = [];
      zoneMap[r].push(ex);
    });

    return Object.entries(zoneMap).map(([name, exs]) => ({
      id: `zone-${name}`,
      name,
      exhibitions: exs
    })).sort((a, b) => b.exhibitions.length - a.exhibitions.length);
  }, [exhibitions, sortBy, searchQuery]);

  const filteredExhibitions = useMemo(() => {
    if (sortBy === 'region') return [];
    let result = exhibitions;
    result = result.filter(ex => !isEnded(ex.endDate));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(ex => 
        ex.title.toLowerCase().includes(q) || 
        ex.artist?.toLowerCase().includes(q) ||
        ex.galleryName?.toLowerCase().includes(q) ||
        ex.region?.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      if (sortBy === 'closing') return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      else return b.createdAt - a.createdAt;
    });
  }, [exhibitions, sortBy, searchQuery]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const isClosingSoon = (endDate: string) => {
    if (!endDate) return false;
    const diff = new Date(endDate).getTime() - Date.now();
    const days = diff / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 7;
  };

  const openKakaoMapSearch = (query: string) => {
    window.open(`https://map.kakao.com/?q=${encodeURIComponent(query)}`, '_blank');
  };

  const renderExhibitionCard = (ex: ExhibitionData, showFullInfo = true) => (
    <div key={ex.id} className="group relative">
      <div 
        onClick={() => onSelect(ex)}
        className="cursor-pointer mb-6"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-14">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[11px] font-black text-teal-400 tracking-tighter uppercase">{ex.artist || 'ANONYMOUS'}</p>
              {ex.region && (
                <span className="text-[8px] font-black text-slate-300 border border-slate-100 px-1.5 py-0.5 rounded uppercase">{ex.region}</span>
              )}
            </div>
            <h3 className={`font-black text-slate-800 leading-tight tracking-tight mb-6 ${showFullInfo ? 'text-2xl' : 'text-lg'}`}>
              {ex.title}
            </h3>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onLikeToggle(ex.id); }} 
            className={`transition-all duration-300 active:scale-125 ${likedIds.has(ex.id) ? 'text-slate-800' : 'text-slate-100 hover:text-slate-200'}`}
          >
            <i className={`fa-${likedIds.has(ex.id) ? 'solid' : 'regular'} fa-heart text-xl`}></i>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mt-1.5"></div>
            <div>
              <p className="text-[9px] font-black text-slate-200 uppercase tracking-widest mb-1">GALLERY</p>
              <div className="flex flex-col">
                {ex.galleryName ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); openKakaoMapSearch(ex.galleryName!); }}
                    className="text-left group/gal flex items-center gap-1.5"
                  >
                    <p className="text-sm font-black text-slate-800 leading-tight group-hover/gal:text-indigo-600 transition-colors underline decoration-slate-100 underline-offset-4">{ex.galleryName}</p>
                    <i className="fa-solid fa-map-location-dot text-[9px] text-slate-200 group-hover/gal:text-indigo-400"></i>
                  </button>
                ) : (
                  <p className="text-xs font-bold text-slate-400">정보 없음</p>
                )}
              </div>
            </div>
          </div>
          {showFullInfo && (
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mt-1.5"></div>
              <div>
                <p className="text-[9px] font-black text-slate-200 uppercase tracking-widest mb-1">PERIOD</p>
                <p className="text-xs font-bold text-slate-600 italic">
                  {ex.startDate ? `${formatDate(ex.startDate)} – ${formatDate(ex.endDate)}` : `UNTIL ${formatDate(ex.endDate)}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a 
          href={ex.representativeLink} target="_blank" rel="noopener noreferrer" 
          className="w-full py-4.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl text-[10px] font-black active:opacity-70 transition-all uppercase tracking-widest text-center flex items-center justify-center"
        >
          INFO
        </a>
        <button 
          onClick={(e) => { e.stopPropagation(); onJoinMeeting(ex); }}
          className="w-full py-4.5 bg-slate-800 text-white rounded-2xl text-[10px] font-black active:scale-[0.98] transition-all uppercase tracking-widest shadow-lg shadow-slate-100 flex items-center justify-center gap-2"
        >
          <span>JOIN MEETING</span>
          <i className="fa-solid fa-arrow-right text-[8px] opacity-50"></i>
        </button>
      </div>
      
      {isClosingSoon(ex.endDate) && (
        <div className="absolute -top-4 left-0">
          <span className="text-[8px] font-black text-white bg-slate-800 px-2 py-0.5 rounded-sm uppercase tracking-widest">D-7</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      <div className="bg-white pt-6 px-8 pb-8">
        <div className="relative">
          <i className="fa-solid fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input 
            type="text" placeholder="ARTISTS, TITLES, GALLERIES..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-none rounded-2xl text-[11px] font-black focus:outline-none focus:bg-slate-100 transition-all uppercase tracking-tighter text-slate-800"
          />
        </div>
        
        <div className="flex items-center justify-between mt-8 px-2">
          <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">
            {sortBy === 'region' ? `${artZones.reduce((acc, z) => acc + z.exhibitions.length, 0)}` : filteredExhibitions.length} EXHIBITS
          </span>
          <div className="flex items-center gap-6">
            <button onClick={() => setSortBy('region')} className={`text-[10px] font-black transition-all ${sortBy === 'region' ? 'text-indigo-600 scale-110' : 'text-slate-200'}`}>REGIONS</button>
            <button onClick={() => setSortBy('closing')} className={`text-[10px] font-black transition-all ${sortBy === 'closing' ? 'text-slate-800 scale-110' : 'text-slate-200'}`}>CLOSING</button>
            <button onClick={() => setSortBy('newest')} className={`text-[10px] font-black transition-all ${sortBy === 'newest' ? 'text-slate-800 scale-110' : 'text-slate-200'}`}>NEWEST</button>
          </div>
        </div>
      </div>

      <div className="px-8 space-y-16">
        {sortBy === 'region' ? (
          <div className="space-y-20">
            {artZones.length > 0 ? artZones.map(zone => (
              <div key={zone.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-10">
                   <div className="w-1 h-8 bg-indigo-600 rounded-full"></div>
                   <div>
                     <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">{zone.name}</h3>
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{zone.exhibitions.length} WALKS NEARBY</p>
                   </div>
                </div>
                <div className="space-y-16 pl-4 border-l border-slate-50">
                  {zone.exhibitions.map(ex => renderExhibitionCard(ex, false))}
                </div>
              </div>
            )) : (
              <div className="py-40 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <i className="fa-solid fa-map-pin text-slate-200"></i>
                </div>
                <p className="text-[11px] font-black text-slate-200 uppercase tracking-widest italic">NO REGIONS MAPPED</p>
              </div>
            )}
          </div>
        ) : (
          filteredExhibitions.length > 0 ? (
            filteredExhibitions.map((ex) => renderExhibitionCard(ex))
          ) : (
            <div className="py-40 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-wind text-slate-200"></i>
              </div>
              <p className="text-[11px] font-black text-slate-200 uppercase tracking-widest italic">NOTHING TO SHOW</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ExhibitionList;

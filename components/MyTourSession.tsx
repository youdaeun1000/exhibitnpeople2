
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ExhibitionData, Tour, TourStop } from '../types';

interface MyTourSessionProps {
  likedExhibitions: ExhibitionData[];
  likedExhibitionIds: Set<string>;
  onSelectExhibition: (ex: ExhibitionData) => void;
  tourExhibitionIds: string[];
  onUpdateTour: (ids: string[]) => void;
  createdTours: Tour[];
  onCreateTour: (title: string, stops: TourStop[], tourDate?: string, tourTime?: string) => void;
  onUpdateTourData: (id: string, title: string, stops: TourStop[], tourDate?: string, tourTime?: string) => void;
  onDeleteTour: (id: string) => void;
  onLikeTourToggle: (tourId: string) => void;
  onTourSelect: (tour: Tour) => void;
  allExhibitions: ExhibitionData[];
  onSelectExhibitionRaw: (ex: ExhibitionData) => void;
  onCreatingStateChange?: (isCreating: boolean) => void;
  requireAuth: (callback: () => void) => void;
  currentUserId?: string;
  initialEditTour?: Tour | null;
  onEditStarted?: () => void;
}

const HOURS_OPTIONS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const MyTourSession: React.FC<MyTourSessionProps> = ({ 
  likedExhibitions, 
  createdTours,
  onCreateTour,
  onUpdateTourData,
  onDeleteTour,
  allExhibitions,
  onCreatingStateChange,
  requireAuth,
  currentUserId,
  initialEditTour,
  onEditStarted
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [tourName, setTourName] = useState('');
  const [editingTourId, setEditingTourId] = useState<string | null>(null);
  const [tourDate, setTourDate] = useState('');
  const [tourTime, setTourTime] = useState('14:00');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const [searchQuery, setSearchQuery] = useState('');
  const [tourStops, setTourStops] = useState<TourStop[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const timeScrollRef = useRef<HTMLDivElement>(null);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const nearbyRecommendations = useMemo(() => {
    if (tourStops.length === 0) return [];
    const lastStop = tourStops[tourStops.length - 1];
    if (lastStop.type !== 'exhibition') return [];
    
    const lastEx = allExhibitions.find(e => e.id === lastStop.exhibitionId);
    if (!lastEx || !lastEx.lat || !lastEx.lng) return [];

    return allExhibitions
      .filter(ex => {
        if (!ex.lat || !ex.lng || ex.id === lastEx.id) return false;
        if (tourStops.some(s => s.exhibitionId === ex.id)) return false;
        const dist = getDistance(lastEx.lat!, lastEx.lng!, ex.lat!, ex.lng!);
        return dist < 3.0; // Within 3km
      })
      .slice(0, 3);
  }, [tourStops, allExhibitions]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allExhibitions.filter(ex => 
      ex.title.toLowerCase().includes(q) || 
      ex.artist?.toLowerCase().includes(q) ||
      ex.galleryName?.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery, allExhibitions]);

  useEffect(() => {
    onCreatingStateChange?.(activeTab === 'create');
  }, [activeTab, onCreatingStateChange]);

  useEffect(() => {
    if (initialEditTour) {
      setEditingTourId(initialEditTour.id);
      setTourName(initialEditTour.title);
      setTourStops(initialEditTour.steps || []);
      setTourDate(initialEditTour.tourDate || '');
      setTourTime(initialEditTour.tourTime || '14:00');
      setActiveTab('create');
      onEditStarted?.();
    }
  }, [initialEditTour]);

  const handleSaveTour = () => {
    if (!tourName.trim() || tourStops.length === 0) return;
    if (editingTourId) onUpdateTourData(editingTourId, tourName.trim(), [...tourStops], tourDate, tourTime);
    else onCreateTour(tourName.trim(), [...tourStops], tourDate, tourTime);
    resetForm();
  };

  const resetForm = () => {
    setTourName(''); setEditingTourId(null); setTourStops([]);
    setTourDate(''); setTourTime('14:00');
    setActiveTab('list'); setSearchQuery('');
  };

  const handleAddStop = (exId: string) => {
    setTourStops([...tourStops, { id: Date.now().toString(), type: 'exhibition', exhibitionId: exId }]);
    setSearchQuery('');
  };

  const handleRemoveStop = (id: string) => {
    setTourStops(tourStops.filter(s => s.id !== id));
  };

  const handleAddTeaTime = () => {
    setTourStops([...tourStops, { id: Date.now().toString(), type: 'teatime' }]);
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newStops = [...tourStops];
    const draggedItem = newStops[draggedItemIndex];
    newStops.splice(draggedItemIndex, 1);
    newStops.splice(index, 0, draggedItem);
    setDraggedItemIndex(index);
    setTourStops(newStops);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '날짜 미정';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}.${date.getDate()}(${['일','월','화','수','목','금','토'][date.getDay()]})`;
  };

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startOffset = firstDay.getDay(); 
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, iso, date: d });
    }
    return days;
  }, [viewDate]);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const todayIso = new Date().toISOString().split('T')[0];

  if (activeTab === 'create') {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 max-w-lg mx-auto overflow-hidden">
        <div className="h-[80px] px-8 flex items-center justify-between flex-shrink-0">
          <button onClick={resetForm} className="w-11 h-11 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Route Builder</h2>
          <div className="w-11"></div>
        </div>

        <main className="flex-1 overflow-y-auto ios-scroll px-8 pb-40 space-y-12">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] px-2">Tour Identity</h3>
            <input 
              type="text" placeholder="TOUR TITLE" value={tourName} onChange={(e) => setTourName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-slate-800 font-black text-xl focus:outline-none focus:bg-slate-100 transition-all placeholder:text-slate-200"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] px-2">Scheduled Date & Time</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className={`w-full bg-slate-50 rounded-2xl px-6 py-4 flex items-center justify-between text-left transition-all ${isCalendarOpen ? 'ring-2 ring-indigo-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <i className={`fa-regular fa-calendar text-sm ${tourDate ? 'text-indigo-600' : 'text-slate-300'}`}></i>
                  <span className={`text-sm font-bold ${tourDate ? 'text-slate-800' : 'text-slate-300'}`}>
                    {tourDate ? formatDisplayDate(tourDate) : '방문 날짜를 선택하세요 (선택)'}
                  </span>
                </div>
                <i className={`fa-solid fa-chevron-down text-[10px] text-slate-300 transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {isCalendarOpen && (
                <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-6 px-1">
                    <span className="text-xs font-black text-slate-700">{viewDate.getFullYear()}.{viewDate.getMonth() + 1}</span>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => changeMonth(-1)} className="p-1 text-slate-300"><i className="fa-solid fa-chevron-left"></i></button>
                      <button type="button" onClick={() => changeMonth(1)} className="p-1 text-slate-300"><i className="fa-solid fa-chevron-right"></i></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 mb-4">
                    {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                      <div key={d} className={`text-center text-[9px] font-black ${i === 0 ? 'text-red-400' : i === 6 ? 'text-indigo-400' : 'text-slate-300'}`}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-2">
                    {calendarDays.map((d, idx) => {
                      if (!d) return <div key={`empty-${idx}`} />;
                      const isToday = d.iso === todayIso;
                      const isSelected = d.iso === tourDate;
                      return (
                        <button
                          key={d.iso} type="button"
                          onClick={() => { setTourDate(d.iso); setIsCalendarOpen(false); }}
                          className={`aspect-square flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                            isSelected ? 'bg-indigo-600 text-white shadow-md' : isToday ? 'text-indigo-600 ring-1 ring-indigo-100' : 'text-slate-600 hover:bg-white'
                          }`}
                        >
                          {d.day}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    onClick={() => { setTourDate(''); setIsCalendarOpen(false); }}
                    className="w-full mt-4 py-2 text-[10px] font-black text-slate-300 uppercase tracking-widest"
                  >
                    날짜 선택 해제
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 -mx-1 px-1">
                {HOURS_OPTIONS.map(hour => {
                  const timeStr = `${String(hour).padStart(2, '0')}:00`;
                  const isSelected = tourTime === timeStr;
                  const ampm = hour < 12 ? '오전' : '오후';
                  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                  
                  return (
                    <button 
                      key={hour}
                      onClick={() => setTourTime(timeStr)}
                      className={`flex-shrink-0 px-5 py-3 rounded-2xl font-black text-[10px] transition-all whitespace-nowrap ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}
                    >
                      {ampm} {displayHour}시
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">Course Stops ({tourStops.length})</h3>
              <button onClick={handleAddTeaTime} className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-plus"></i> Tea Time
              </button>
            </div>
            
            <div className="space-y-3">
              {tourStops.map((stop, index) => {
                const ex = stop.type === 'exhibition' ? allExhibitions.find(e => e.id === stop.exhibitionId) : null;
                const isDragging = draggedItemIndex === index;

                return (
                  <div 
                    key={stop.id} 
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-slate-50 rounded-2xl p-5 flex items-center gap-4 transition-all ${isDragging ? 'opacity-40 scale-95 shadow-inner border-2 border-slate-200' : 'opacity-100 scale-100 border-2 border-transparent shadow-sm'}`}
                  >
                    <div className="flex-shrink-0 flex items-center gap-4">
                      <div className="cursor-grab active:cursor-grabbing p-1 text-slate-200">
                        <i className="fa-solid fa-grip-vertical"></i>
                      </div>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] ${stop.type === 'exhibition' ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-600'}`}>
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-slate-800 truncate">
                        {stop.type === 'exhibition' ? (ex?.title || 'Unknown Exhibition') : 'Tea Time & Break'}
                      </p>
                      {stop.type === 'exhibition' && (
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest truncate">{ex?.galleryName || ex?.artist}</p>
                          {ex?.region && (
                            <span className="text-[8px] font-black text-indigo-300 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100 uppercase tracking-tight">
                              {ex.region}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button onClick={() => handleRemoveStop(stop.id)} className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-red-400 active:scale-90 transition-transform">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {nearbyRecommendations.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
               <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                 <i className="fa-solid fa-wand-magic-sparkles"></i> Nearby Suggestions
               </h3>
               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
                 {nearbyRecommendations.map(ex => (
                   <div key={`rec-${ex.id}`} onClick={() => handleAddStop(ex.id)} className="flex-shrink-0 w-48 bg-indigo-50/50 p-5 rounded-[2rem] border border-indigo-100 active:scale-95 transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] font-black text-indigo-300 truncate uppercase">{ex.galleryName || ex.artist}</p>
                        <span className="text-[7px] font-black text-indigo-400/60 uppercase">{ex.region}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-800 line-clamp-2 mb-4 leading-tight">{ex.title}</h4>
                      <div className="flex items-center justify-between">
                         <span className="text-[8px] font-bold text-indigo-400">WALKABLE</span>
                         <i className="fa-solid fa-plus text-[10px] text-indigo-300"></i>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] px-2">Add From Search</h3>
            
            <div className="relative mb-6">
              <i className="fa-solid fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-200"></i>
              <input 
                type="text" placeholder="SEARCH ALL EXHIBITIONS..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl text-[11px] font-black focus:outline-none focus:bg-slate-100 uppercase tracking-tighter"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[110] overflow-hidden border border-slate-100">
                  {searchResults.map(ex => (
                    <button key={ex.id} onClick={() => handleAddStop(ex.id)} className="w-full p-6 flex items-center justify-between hover:bg-slate-50 text-left border-b border-slate-50 last:border-0">
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-slate-800 truncate">{ex.title}</p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">{ex.galleryName} · {ex.region}</p>
                      </div>
                      <i className="fa-solid fa-plus text-[10px] text-slate-300"></i>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 pb-20">
              {likedExhibitions.map(ex => {
                return (
                  <div key={ex.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex items-center gap-6 group hover:border-indigo-100 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest truncate">{ex.artist}</p>
                        <span className="text-[8px] font-black text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded uppercase tracking-tight">
                          {ex.region}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-800 tracking-tight truncate mb-1">{ex.title}</h4>
                      <p className="text-[10px] font-bold text-slate-300 italic truncate opacity-60">{ex.galleryName}</p>
                    </div>
                    <button onClick={() => handleAddStop(ex.id)} className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all active:scale-90">
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white to-transparent pt-12">
          <button 
            onClick={handleSaveTour}
            disabled={!tourName.trim() || tourStops.length === 0}
            className="w-full py-5 bg-slate-800 text-white font-black rounded-[2rem] shadow-2xl disabled:bg-slate-100 disabled:text-slate-300 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
          >
            {editingTourId ? 'Save Changes' : 'Publish Tour'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-white px-8 pt-10 pb-6">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-10 uppercase">Tours</h2>
        <div className="flex gap-10">
          <button onClick={() => setActiveTab('list')} className={`pb-4 text-[11px] font-black relative transition-all tracking-widest ${activeTab === 'list' ? 'text-slate-800' : 'text-slate-200'}`}>
            DISCOVER
            {activeTab === 'list' && <div className="absolute -bottom-1 left-0 right-0 h-[3px] bg-slate-800 rounded-full" />}
          </button>
          <button onClick={() => requireAuth(() => { resetForm(); setActiveTab('create'); })} className="pb-4 text-[11px] font-black text-indigo-600 relative transition-all tracking-widest">
            CREATE +
          </button>
        </div>
      </div>

      <main className="px-8 space-y-12 pt-6 pb-40">
        {createdTours.length > 0 ? createdTours.map(tour => {
          const isCreator = tour.creatorId === currentUserId;
          const steps = tour.steps || [];

          return (
            <div key={tour.id} className="group bg-slate-50 p-8 rounded-[2.5rem] transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">
                      {isCreator ? 'MY TOUR' : (tour.userName || 'ANONYMOUS')}
                    </p>
                    {tour.tourDate && (
                      <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">
                        {formatDisplayDate(tour.tourDate)} {tour.tourTime?.split(':')[0]}시
                      </span>
                    )}
                    {isCreator && (
                      <div className="flex items-center gap-2 ml-auto">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEditStarted?.(); setEditingTourId(tour.id); setTourName(tour.title); setTourStops(tour.steps || []); setTourDate(tour.tourDate || ''); setTourTime(tour.tourTime || '14:00'); setActiveTab('create'); }}
                          className="text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-tighter"
                        >
                          EDIT
                        </button>
                        <span className="w-[1px] h-2 bg-slate-200"></span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); if(window.confirm('정말 삭제하시겠습니까?')) onDeleteTour(tour.id); }}
                          className="text-[9px] font-black text-red-300 hover:text-red-500 uppercase tracking-tighter"
                        >
                          DELETE
                        </button>
                      </div>
                    )}
                  </div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight leading-snug">{tour.title}</h3>
                </div>
              </div>

              <div className="space-y-4 mb-4 px-1">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Tour Course</p>
                <div className="relative pl-6 space-y-6">
                  <div className="absolute left-[7.5px] top-2 bottom-2 w-[1.5px] bg-slate-200 border-l border-dashed border-slate-300"></div>
                  {steps.map((step, idx) => {
                    if (step.type === 'exhibition') {
                      const ex = allExhibitions.find(e => e.id === step.exhibitionId);
                      return (
                        <div key={`stop-${tour.id}-${idx}`} className="relative flex items-center gap-4 group/stop">
                          <div className="absolute -left-[18.5px] w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white shadow-sm ring-4 ring-slate-50 transition-transform group-hover/stop:scale-125"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate">{ex?.title || 'Unknown Exhibition'}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{ex?.galleryName || ex?.artist}</p>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={`stop-${tour.id}-${idx}`} className="relative flex items-center gap-4 group/stop">
                          <div className="absolute -left-[18.5px] w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white shadow-sm ring-4 ring-slate-50 transition-transform group-hover/stop:scale-125"></div>
                          <div className="flex-1">
                            <p className="text-xs font-black text-amber-700 uppercase">Tea Time & Break</p>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-40 text-center flex flex-col items-center opacity-30 grayscale">
            <i className="fa-solid fa-compass text-5xl mb-6"></i>
            <p className="text-[11px] font-black uppercase tracking-widest italic">Explore the city solo</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTourSession;

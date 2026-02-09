
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Meeting } from '../types';
import { collection, addDoc, serverTimestamp, Timestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface MeetingCreateProps {
  context: { id: string, title: string, type: 'exhibition' | 'tour', location: string };
  onBack: () => void;
  onCreated: (meeting: Meeting) => void;
  currentUserId: string;
}

const HOURS_OPTIONS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const MeetingCreate: React.FC<MeetingCreateProps> = ({ context, onBack, onCreated, currentUserId }) => {
  const [title, setTitle] = useState(context.type === 'tour' ? context.title : `${context.title} 모임`);
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [question, setQuestion] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [selectedHour, setSelectedHour] = useState<number | null>(14); // Default to 14:00 (2 PM)
  const [location, setLocation] = useState(context.location);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [viewDate, setViewDate] = useState(new Date()); 
  const titleSectionRef = useRef<HTMLDivElement>(null);
  const timeScrollRef = useRef<HTMLDivElement>(null);

  const formatMeetingDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = weekDays[date.getDay()];
    return `${month}.${day}(${dayOfWeek})`;
  };

  const formatMeetingTime = (hour: number | null) => {
    if (hour === null) return '';
    const ampm = hour < 12 ? '오전' : '오후';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${ampm} ${displayHour}시`;
  };

  const isHourDisabled = (isoDate: string, hour: number) => {
    if (!isoDate) return false;
    const now = new Date();
    const threshold = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now
    const target = new Date(`${isoDate}T${String(hour).padStart(2, '0')}:00:00`);
    return target < threshold;
  };

  // Set initial scroll position for time picker
  useEffect(() => {
    if (timeScrollRef.current && selectedHour !== null) {
      const index = HOURS_OPTIONS.indexOf(selectedHour);
      if (index !== -1) {
        timeScrollRef.current.scrollTop = index * 48;
      }
    }
  }, []);

  const handleTimeScroll = () => {
    if (!timeScrollRef.current) return;
    const container = timeScrollRef.current;
    const itemHeight = 48; 
    const scrollTop = container.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const hour = HOURS_OPTIONS[index];
    if (hour !== undefined && !isHourDisabled(meetingDate, hour)) {
      setSelectedHour(hour);
    }
  };

  const handleTitleFocus = () => {
    setTimeout(() => {
      titleSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.id) return;
    if (title.trim() && question.trim() && meetingDate && selectedHour !== null && location.trim()) {
      if (isHourDisabled(meetingDate, selectedHour)) {
        alert("모임은 현재 시각 기준 최소 3시간 이후부터 개설할 수 있습니다.");
        return;
      }
      setIsSubmitting(true);
      try {
        const dateObj = new Date(`${meetingDate}T${String(selectedHour).padStart(2, '0')}:00:00`);
        // 저장 시 targetId와 targetType 필드를 명시적으로 사용
        const docRef = await addDoc(collection(db, "meetings"), {
          targetId: context.id,
          targetType: context.type,
          targetTitle: context.title, // 원본 제목 보존용
          title: title.trim(),
          meetingDate: Timestamp.fromDate(dateObj),
          meetingPlace: location.trim(),
          maxParticipants,
          question: question.trim(),
          creatorId: currentUserId,
          participants: [currentUserId],
          createdAt: serverTimestamp()
        });

        await setDoc(doc(db, "chats", docRef.id), {
          meetingTitle: title.trim(),
          participants: [currentUserId],
          lastMessage: "모임이 개설되었습니다.",
          lastMessageAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });

        onCreated({
          id: docRef.id,
          title: title.trim(),
          targetId: context.id,
          targetType: context.type,
          targetTitle: context.title,
          location: location.trim(),
          meetingDate,
          meetingTime: `${String(selectedHour).padStart(2, '0')}:00`,
          maxParticipants,
          question: question.trim(),
          isApprovalRequired: true,
          creatorId: currentUserId,
          creatorName: '본인', 
          createdAt: Date.now(),
          participants: [{ userId: currentUserId, userName: '본인', status: 'accepted', answer: '호스트' }]
        });
      } catch (error) {
        console.error("Firestore 저장 오류:", error);
        alert("모임 저장 중 오류가 발생했습니다.");
      } finally {
        setIsSubmitting(false);
      }
    }
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
  const isFormValid = title.trim() && question.trim() && meetingDate && selectedHour !== null && !isHourDisabled(meetingDate, selectedHour) && location.trim() && !isSubmitting;

  return (
    <div className="min-h-screen bg-slate-50 animate-in slide-in-from-right duration-300">
      <div className="h-[60px] bg-white border-b border-slate-100 px-6 flex items-center gap-4 max-w-lg mx-auto">
        <button onClick={onBack} className="text-slate-400 active:scale-90 transition-transform">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2 className="text-lg font-black text-slate-900">모임 만들기</h2>
      </div>

      <div className="px-6 pb-40 max-w-lg mx-auto overflow-y-auto ios-scroll h-full">
        <div ref={titleSectionRef} className="bg-indigo-600 rounded-3xl p-6 text-white my-8 shadow-xl shadow-indigo-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">모임 제목</p>
          </div>
          <input 
            type="text" value={title} onChange={(e) => setTitle(e.target.value)} onFocus={handleTitleFocus}
            placeholder="모임 제목을 입력하세요"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white font-black placeholder:text-white/40 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-white/30 transition-all text-sm"
          />
        </div>

        <div className="mb-10 px-6 py-6 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">모임 일시</p>
           <h3 className="text-lg font-black text-indigo-600">
             {meetingDate ? (
               <>
                 {formatMeetingDate(meetingDate)}
                 {selectedHour !== null ? ` · ${formatMeetingTime(selectedHour)}` : ''}
               </>
             ) : '날짜를 선택해 주세요'}
           </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">날짜 선택</label>
            <div 
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className={`bg-white rounded-3xl p-5 border flex items-center justify-between cursor-pointer transition-all shadow-sm active:scale-[0.98] ${isCalendarOpen ? 'border-indigo-100 ring-2 ring-indigo-50' : 'border-slate-100'}`}
            >
              <div className="flex items-center gap-3">
                <i className={`fa-regular fa-calendar text-sm ${meetingDate ? 'text-indigo-600' : 'text-slate-300'}`}></i>
                <span className={`text-sm font-bold ${meetingDate ? 'text-slate-800' : 'text-slate-300'}`}>
                  {meetingDate ? formatMeetingDate(meetingDate) : '날짜를 선택해 주세요'}
                </span>
              </div>
              <i className={`fa-solid fa-chevron-down text-[10px] text-slate-300 transition-transform duration-300 ${isCalendarOpen ? 'rotate-180' : ''}`}></i>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCalendarOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm mt-2">
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
                    const isSelected = d.iso === meetingDate;
                    const isPast = d.iso < todayIso;
                    return (
                      <button
                        key={d.iso} type="button" disabled={isPast}
                        onClick={() => { setMeetingDate(d.iso); setIsCalendarOpen(false); }}
                        className={`relative aspect-square flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isSelected ? 'bg-indigo-600 text-white shadow-md scale-110' : isToday ? 'text-indigo-600 ring-1 ring-indigo-100' : isPast ? 'text-slate-200 pointer-events-none' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {d.day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">시간 선택 (스크롤)</label>
            <div className="relative bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden h-[192px]">
              <div className="absolute inset-x-0 top-[72px] h-12 bg-indigo-50/50 border-y border-indigo-100 pointer-events-none z-0"></div>
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
              <div 
                ref={timeScrollRef} onScroll={handleTimeScroll}
                className="absolute inset-0 overflow-y-auto no-scrollbar snap-y snap-mandatory pt-[72px] pb-[72px]"
              >
                {HOURS_OPTIONS.map(hour => {
                  const disabled = isHourDisabled(meetingDate, hour);
                  const isSelected = selectedHour === hour;
                  return (
                    <div key={hour} className={`h-12 snap-center flex items-center justify-center transition-all ${disabled ? 'opacity-10' : ''}`}
                         onClick={() => !disabled && setSelectedHour(hour)}>
                      <span className={`text-sm font-black transition-all ${isSelected ? 'text-indigo-600 scale-110' : 'text-slate-300 scale-90'}`}>
                        {formatMeetingTime(hour)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">모임 시작 장소</label>
            <div className="relative">
              <input 
                type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="만날 장소를 입력하세요"
                className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
              />
              <i className="fa-solid fa-location-dot absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"></i>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">최대 참가 인원</label>
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
              {[2, 3, 4, 5, 6, 7, 8].map(num => (
                <button 
                  key={num} type="button" onClick={() => setMaxParticipants(num)}
                  className={`flex-shrink-0 w-12 h-12 rounded-2xl font-black text-xs transition-all ${maxParticipants === num ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">참가 질문</label>
            <textarea 
              value={question} onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: 좋아하는 화가나 작품이 있으신가요?"
              className="w-full px-5 py-4 bg-white border border-slate-100 rounded-3xl font-bold text-sm min-h-[120px] shadow-sm focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all leading-relaxed placeholder:text-slate-300"
            />
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent max-w-lg mx-auto z-40">
            <button 
              type="submit" disabled={!isFormValid}
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl disabled:bg-slate-300 disabled:shadow-none active:scale-95 transition-all text-sm tracking-tight"
            >
              {isSubmitting && <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>}
              {isFormValid ? `${formatMeetingDate(meetingDate)} · ${formatMeetingTime(selectedHour)} 모임 개설` : '정보를 모두 입력해 주세요'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingCreate;

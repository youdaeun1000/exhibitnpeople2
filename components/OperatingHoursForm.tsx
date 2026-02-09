
import React from 'react';
import { DayOfWeek } from '../types';
import { DAYS } from '../constants';

interface OperatingHoursFormProps {
  selectedDays: DayOfWeek[];
  closingNote: string;
  onDaysChange: (days: DayOfWeek[]) => void;
  onClosingNoteChange: (val: string) => void;
}

const OperatingHoursForm: React.FC<OperatingHoursFormProps> = ({ 
  selectedDays, 
  closingNote,
  onDaysChange,
  onClosingNoteChange
}) => {
  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter(d => d !== day));
    } else {
      onDaysChange([...selectedDays, day]);
    }
  };

  const handleAllDays = () => {
    if (selectedDays.length === 7) {
      onDaysChange([]);
    } else {
      onDaysChange([...DAYS]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 운영 요일 선택 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">운영 요일</label>
          <button 
            type="button"
            onClick={handleAllDays}
            className={`text-[10px] font-bold px-3 py-1 rounded-lg transition-all ${selectedDays.length === 7 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}
          >
            {selectedDays.length === 7 ? '전체 해제' : '매일 선택'}
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`aspect-square flex items-center justify-center rounded-2xl text-xs font-black transition-all border ${
                selectedDays.includes(day)
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105'
                  : 'bg-white border-slate-100 text-slate-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* 휴관 안내 입력 (시간 대신 구체적인 정기 휴무 등 기재) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">운영 특이사항 (선택)</label>
          <span className="text-[9px] font-bold text-slate-300">정기 휴무 등</span>
        </div>
        <div className="relative group">
          <input 
            type="text" 
            placeholder="예: 매주 월요일 정기 휴관"
            value={closingNote}
            onChange={(e) => onClosingNoteChange(e.target.value)}
            className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all placeholder:text-slate-200"
          />
          <i className="fa-solid fa-calendar-xmark absolute right-5 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-red-400 transition-colors"></i>
        </div>
      </div>
    </div>
  );
};

export default OperatingHoursForm;

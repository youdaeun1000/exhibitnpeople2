
import React, { useState } from 'react';
import { ReportReason } from '../types';

interface ReportModalProps {
  onClose: () => void;
  onSubmit: (reason: ReportReason, description: string) => void;
  targetUserName: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose, onSubmit, targetUserName }) => {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const reasons: ReportReason[] = ['스팸 / 광고', '부적절한 언행', '괴롭힘 / 혐오', '기타'];

  return (
    <div className="fixed inset-0 z-[3000] flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-t-[2.5rem] p-8 pb-12 animate-in slide-in-from-bottom duration-500 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black text-slate-800 tracking-tight">사용자 신고하기</h3>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium text-slate-400 leading-relaxed mb-6">
            <span className="text-slate-800 font-black">{targetUserName}</span>님을 신고하는 사유를 선택해 주세요. 신고된 내용은 운영팀에서 신중하게 검토합니다.
          </p>

          <div className="space-y-2">
            {reasons.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`w-full py-4.5 px-6 rounded-2xl text-sm font-bold text-left transition-all border ${
                  reason === r 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' 
                    : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 px-1">추가 설명 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="상황에 대한 간단한 설명을 입력해 주세요."
            className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-slate-100 outline-none resize-none min-h-[100px] transition-all placeholder:text-slate-300"
          />
        </div>

        <button
          onClick={() => reason && onSubmit(reason, description)}
          disabled={!reason}
          className="w-full py-5 bg-slate-800 text-white font-black rounded-[2rem] active:scale-[0.98] transition-all disabled:bg-slate-100 disabled:text-slate-300 uppercase tracking-widest text-[11px]"
        >
          신고 제출하기
        </button>
      </div>
    </div>
  );
};

export default ReportModal;

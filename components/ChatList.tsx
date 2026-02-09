
import React from 'react';
import { Meeting } from '../types';

interface ChatListProps {
  rooms: any[];
  meetings: Meeting[];
  onSelectRoom: (id: string) => void;
  onLeaveChat: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ rooms, meetings, onSelectRoom, onLeaveChat }) => {
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const isMeetingPast = (meetingDate: string, meetingTime: string) => {
    if (!meetingDate || !meetingTime) return false;
    const meetingDateTime = new Date(`${meetingDate}T${meetingTime}`);
    return meetingDateTime < new Date();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32 animate-in fade-in duration-500">
      <div className="bg-white pt-10 px-8 pb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Talks</h2>
        <p className="text-[10px] text-slate-200 font-bold uppercase tracking-widest mt-3">
          {rooms.length} ACTIVE ROOMS
        </p>
      </div>

      <main className="px-8 space-y-6">
        {rooms.length > 0 ? (
          <div className="space-y-4">
            {rooms.map((room) => {
              const meeting = meetings.find(m => m.id === room.id);
              const isPast = meeting ? isMeetingPast(meeting.meetingDate, meeting.meetingTime) : false;

              return (
                <div
                  key={room.id}
                  className="group relative flex items-center gap-4 px-6 py-6 bg-slate-50 rounded-[2.5rem] active:bg-slate-100 transition-all text-left"
                >
                  <button 
                    onClick={() => onSelectRoom(room.id)}
                    className="flex-1 flex items-center gap-6 min-w-0"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-sm ${isPast ? 'bg-slate-200 text-slate-400' : 'bg-white text-slate-300'}`}>
                      <i className={`fa-solid ${isPast ? 'fa-calendar-check' : 'fa-comment-dots'} text-lg`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className={`text-sm font-black truncate pr-2 ${isPast ? 'text-slate-400' : 'text-slate-800'}`}>
                            {room.meetingTitle || "ANONYMOUS"}
                          </h3>
                          {isPast && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 bg-slate-200 text-white text-[8px] font-black rounded-md uppercase tracking-tighter">Ended</span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-300 font-bold whitespace-nowrap">
                          {formatTime(room.lastMessageAt)}
                        </span>
                      </div>
                      <p className={`text-xs font-medium truncate leading-relaxed ${isPast ? 'text-slate-300' : 'text-slate-400'}`}>
                        {room.lastMessage || "No messages."}
                      </p>
                    </div>
                  </button>

                  {/* 나가기 버튼 */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onLeaveChat(room.id); }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-red-400 active:scale-90 transition-all flex-shrink-0"
                    title="방 나가기"
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-40 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-8">
              <i className="fa-solid fa-comments text-slate-100 text-3xl"></i>
            </div>
            <p className="text-[11px] font-black text-slate-200 uppercase tracking-widest">QUIET MOMENT</p>
            <p className="text-[10px] font-bold text-slate-300 mt-4 leading-relaxed max-w-[200px]">
              JOIN A MEETING TO START A NEW CONVERSATION.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatList;

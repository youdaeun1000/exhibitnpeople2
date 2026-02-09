
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Meeting, ExhibitionData, Tour } from '../types';

interface ChatRoomProps {
  meetingId: string;
  meeting: Meeting;
  allExhibitions: ExhibitionData[];
  allTours: Tour[];
  messages: ChatMessage[];
  onBack: () => void;
  onSelectExhibition: (ex: ExhibitionData) => void;
  onSelectTour: (tour: Tour) => void;
  onSelectMeeting: (id: string) => void;
  onSendMessage: (text: string) => void;
  currentUserId: string;
  onSelectUser: (userId: string) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ 
  meetingId, 
  meeting,
  messages, 
  onBack, 
  onSelectMeeting,
  onSendMessage, 
  currentUserId,
  onSelectUser
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleInfoClick = () => {
    onSelectMeeting(meetingId);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col max-w-lg mx-auto">
      {/* Chat Header */}
      <div className="h-[64px] bg-white border-b border-slate-50 px-6 flex items-center gap-4 flex-shrink-0">
        <button onClick={onBack} className="text-slate-400 active:scale-90 transition-transform">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={handleInfoClick}
        >
           <h2 className="text-sm font-black text-slate-900 truncate">{meeting.title}</h2>
           <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">
             {meeting.participants.length + 1} MEMBERS
           </p>
        </div>
        <button className="text-slate-300"><i className="fa-solid fa-ellipsis-vertical"></i></button>
      </div>

      {/* Meeting Summary Bar (Sticky below header) */}
      <div 
        onClick={handleInfoClick}
        className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors shadow-sm z-10"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400">
            <i className="fa-regular fa-calendar text-[10px]"></i>
            <span className="text-[10px] font-black tracking-tight whitespace-nowrap">{meeting.meetingDate}</span>
          </div>
          <div className="w-[1px] h-2 bg-slate-200"></div>
          <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
            <i className="fa-solid fa-location-dot text-[9px]"></i>
            <span className="text-[10px] font-black tracking-tight truncate">{meeting.location}</span>
          </div>
        </div>
        <i className="fa-solid fa-chevron-right text-[8px] text-slate-200"></i>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 ios-scroll bg-slate-50/50">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUserId;
          const showName = idx === 0 || messages[idx-1].senderId !== msg.senderId;

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {showName && !isMe && (
                <span 
                  className="text-[9px] font-black text-slate-400 mb-1.5 ml-1 cursor-pointer active:opacity-60 transition-opacity"
                  onClick={() => onSelectUser(msg.senderId)}
                >
                  {msg.senderName}
                </span>
              )}
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-medium shadow-sm leading-relaxed ${
                isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
              }`}>
                {msg.text}
              </div>
              <span className="text-[8px] text-slate-300 mt-1 px-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-20 grayscale">
             <i className="fa-solid fa-comments text-5xl mb-4"></i>
             <p className="text-sm font-black">대화를 시작해보세요!</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0 pb-safe">
        <div className="bg-slate-50 p-1.5 rounded-3xl flex items-center gap-2 border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-transparent px-4 py-2 text-xs font-bold focus:outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center disabled:bg-slate-200 transition-all active:scale-90"
          >
            <i className="fa-solid fa-paper-plane text-[10px]"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;

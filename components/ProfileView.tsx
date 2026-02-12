
import React, { useState, useMemo } from 'react';
import { Meeting, Tour, ExhibitionData, UserRole } from '../types';

interface ProfileViewProps {
  userId: string;
  userName: string;
  instagramUrl: string | null;
  bio?: string | null;
  role: UserRole;
  isMe: boolean;
  myBlockedIds: Set<string>;
  likedExhibitionIds: Set<string>;
  meetings: Meeting[];
  tours: Tour[];
  allExhibitions: ExhibitionData[];
  onBack: () => void;
  onBlockToggle: (userId: string) => void;
  onReport: (userId: string, userName: string) => void;
  onSelectMeeting: (id: string) => void;
  onSelectTour: (tour: Tour) => void;
  onSelectExhibition: (ex: ExhibitionData) => void;
  onSelectUser: (userId: string) => void;
  onGoSettings: () => void;
  lastNicknameChangedAt?: number;
  onNicknameChange?: (newName: string) => void;
  onInstagramUrlChange?: (newUrl: string | null) => void;
  onBioChange?: (newBio: string | null) => void;
  onRoleChange?: (newRole: UserRole) => void;
}

type TabType = 'schedule' | 'created-meetings' | 'liked';

export default function ProfileView({
  userId,
  userName,
  instagramUrl,
  bio,
  role,
  isMe,
  likedExhibitionIds,
  meetings,
  tours,
  allExhibitions,
  onBack,
  onBlockToggle,
  onReport,
  onSelectMeeting,
  onSelectTour,
  onSelectExhibition,
  onSelectUser,
  onGoSettings,
  onNicknameChange,
  onInstagramUrlChange,
  onBioChange,
  onRoleChange
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>(isMe ? 'schedule' : 'created-meetings');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editInsta, setEditInsta] = useState(instagramUrl || '');
  const [editBio, setEditBio] = useState(bio || '');
  const [editRole, setEditRole] = useState<UserRole>(role);

  const roles: { type: UserRole; label: string; icon: string }[] = [
    { type: 'Viewer', label: '관람객', icon: 'fa-eye' },
    { type: 'Artist', label: '작가', icon: 'fa-palette' },
    { type: 'Collector', label: '수집가', icon: 'fa-gem' },
    { type: 'Gallery', label: '갤러리', icon: 'fa-landmark' },
  ];

  const currentRoleInfo = roles.find(r => r.type === role) || roles[0];

  const getInstaUsername = (url: string | null) => {
    if (!url) return null;
    try {
      const parts = url.split('instagram.com/').filter(p => p);
      if (parts.length > 1) {
        return parts[1].split('/')[0].split('?')[0];
      }
      return url;
    } catch {
      return url;
    }
  };

  const instaUsername = getInstaUsername(instagramUrl);

  const isMeetingPast = (meetingDate: string, meetingTime: string) => {
    const meetingDateTime = new Date(`${meetingDate}T${meetingTime}`);
    return meetingDateTime < new Date();
  };

  const { upcomingMeetings } = useMemo(() => {
    if (!isMe) return { upcomingMeetings: [] };
    const myMeetings = meetings.filter(m => m.creatorId === userId || m.participants.some(p => p.userId === userId && p.status === 'accepted'));
    const upcoming = myMeetings.filter(m => !isMeetingPast(m.meetingDate, m.meetingTime)).sort((a,b) => new Date(`${a.meetingDate}T${a.meetingTime}`).getTime() - new Date(`${b.meetingDate}T${b.meetingTime}`).getTime());
    return { upcomingMeetings: upcoming };
  }, [meetings, userId, isMe]);

  // 직접 만든 모임 중에서도 지난 날짜는 제외
  const createdMeetings = meetings.filter(m => m.creatorId === userId && !isMeetingPast(m.meetingDate, m.meetingTime));
  const likedExhibitions = allExhibitions.filter(ex => likedExhibitionIds.has(ex.id));

  const handleProfileSubmit = () => {
    if (!editName.trim()) return;
    onNicknameChange?.(editName.trim());
    onInstagramUrlChange?.(editInsta.trim() || null);
    onBioChange?.(editBio.trim() || null);
    onRoleChange?.(editRole);
    setIsEditProfileOpen(false);
  };

  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-300">
      <div className="pt-8 px-8 flex flex-col">
        <div className="flex justify-between items-center mb-10 relative">
          <button onClick={onBack} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all"><i className="fa-solid fa-chevron-left"></i></button>
          
          <div className="flex gap-2">
            {!isMe && (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all"
                >
                  <i className="fa-solid fa-ellipsis"></i>
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-20 animate-in slide-in-from-top-2">
                    <button 
                      onClick={() => { onReport(userId, userName); setIsMenuOpen(false); }}
                      className="w-full px-6 py-4.5 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      <i className="fa-solid fa-circle-exclamation text-slate-300"></i>
                      사용자 신고하기
                    </button>
                    <button 
                      onClick={() => { onBlockToggle(userId); setIsMenuOpen(false); }}
                      className="w-full px-6 py-4.5 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 border-t border-slate-50 transition-colors"
                    >
                      <i className="fa-solid fa-user-slash opacity-60"></i>
                      사용자 차단하기
                    </button>
                  </div>
                )}
              </div>
            )}
            {isMe && <button onClick={onGoSettings} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all"><i className="fa-solid fa-gear"></i></button>}
          </div>
        </div>

        <div className="mb-14">
          <div className="flex flex-col items-center text-center">
            {/* 상단 프로필 이미지 (역할 아이콘) */}
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-white text-3xl mb-6 shadow-xl shadow-slate-100 ring-4 ring-white">
              <i className={`fa-solid ${currentRoleInfo.icon}`}></i>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{userName}</h3>
              <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-black text-slate-400 uppercase tracking-tight">{currentRoleInfo.label}</span>
              {isMe && (
                <button onClick={() => setIsEditProfileOpen(true)} className="ml-1 text-slate-200 hover:text-slate-800 transition-colors"><i className="fa-solid fa-pen text-[10px]"></i></button>
              )}
            </div>
            
            {bio && <p className="text-sm font-medium text-slate-400 mb-6 leading-relaxed max-w-[280px]">{bio}</p>}

            {/* 인스타그램 링크 한 줄 배치 */}
            {instagramUrl && (
              <a 
                href={instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-500 hover:bg-slate-100 transition-all active:scale-95 mb-10"
              >
                <i className="fa-brands fa-instagram text-sm"></i>
                <span>@{instaUsername || 'instagram'}</span>
              </a>
            )}
          </div>
        </div>

        <div className="flex gap-10 mb-10 px-2 overflow-x-auto no-scrollbar border-b border-slate-50">
          {isMe && (
            <button onClick={() => setActiveTab('schedule')} className={`pb-4 text-[10px] font-black tracking-[0.15em] relative transition-all flex items-center gap-1.5 ${activeTab === 'schedule' ? 'text-slate-800' : 'text-slate-200'}`}>
              <i className="fa-solid fa-lock text-[8px] opacity-40"></i>
              PLAN
              {activeTab === 'schedule' && <div className="absolute -bottom-0.5 left-0 right-0 h-[2.5px] bg-slate-800 rounded-full" />}
            </button>
          )}
          <button onClick={() => setActiveTab('created-meetings')} className={`pb-4 text-[10px] font-black tracking-[0.15em] relative transition-all ${activeTab === 'created-meetings' ? 'text-slate-800' : 'text-slate-200'}`}>
            MINE
            {activeTab === 'created-meetings' && <div className="absolute -bottom-0.5 left-0 right-0 h-[2.5px] bg-slate-800 rounded-full" />}
          </button>
          {isMe && (
            <button onClick={() => setActiveTab('liked')} className={`pb-4 text-[10px] font-black tracking-[0.15em] relative transition-all flex items-center gap-1.5 ${activeTab === 'liked' ? 'text-slate-800' : 'text-slate-200'}`}>
              <i className="fa-solid fa-lock text-[8px] opacity-40"></i>
              LIKED
              {activeTab === 'liked' && <div className="absolute -bottom-0.5 left-0 right-0 h-[2.5px] bg-slate-800 rounded-full" />}
            </button>
          )}
        </div>

        <div className="pb-40 px-2">
          {isMe && activeTab === 'schedule' && (
            <div className="space-y-10">
              {upcomingMeetings.length > 0 ? upcomingMeetings.map(m => (
                <div key={m.id} onClick={() => onSelectMeeting(m.id)} className="group active:opacity-60 transition-opacity cursor-pointer">
                  <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-3">{m.meetingDate} · {m.meetingTime}</p>
                  <h4 className="font-black text-slate-800 text-xl tracking-tight mb-3 truncate">{m.title}</h4>
                  <p className="text-xs font-bold text-slate-300 italic truncate">{m.location}</p>
                </div>
              )) : (
                <div className="py-20 text-center flex flex-col items-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <i className="fa-solid fa-calendar text-slate-100 text-xl"></i>
                  </div>
                  <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">NO SCHEDULED MEETINGS</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'created-meetings' && (
            <div className="space-y-8">
              {createdMeetings.length > 0 ? createdMeetings.map(m => (
                <div key={m.id} className="bg-slate-50 p-8 rounded-[2.5rem] active:scale-[0.98] transition-all cursor-pointer" onClick={() => onSelectMeeting(m.id)}>
                  <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-3">{m.meetingDate}</p>
                  <h4 className="font-black text-slate-800 text-lg tracking-tight mb-8 truncate">{m.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-300 italic truncate max-w-[140px]">{m.location}</span>
                    <span className="text-xs font-black text-slate-800">{m.participants.length+1}/{m.maxParticipants}</span>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center flex flex-col items-center opacity-40">
                  <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest italic">NOTHING TO SHOW</p>
                </div>
              )}
            </div>
          )}

          {isMe && activeTab === 'liked' && (
            <div className="space-y-12">
              {likedExhibitions.length > 0 ? likedExhibitions.map(ex => (
                <div key={ex.id} onClick={() => onSelectExhibition(ex)} className="group cursor-pointer active:opacity-60 transition-all">
                  <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-3">{ex.artist}</p>
                  <h4 className="text-xl font-black text-slate-800 tracking-tight mb-4">{ex.title}</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-200 italic uppercase">EXHIBIT ENDS {ex.endDate}</p>
                    <i className="fa-solid fa-arrow-right text-[10px] text-slate-200 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center flex flex-col items-center opacity-40">
                  <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest italic">NO LIKES YET</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[2000] bg-white flex flex-col p-10 animate-in slide-in-from-bottom duration-300 overflow-y-auto ios-scroll">
          <div className="flex justify-between items-center mb-16">
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Edit Profile</h3>
            <button onClick={() => setIsEditProfileOpen(false)} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all"><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="space-y-12 pb-20">
            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 px-1">Role Selection</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => {
                  const isActive = editRole === r.type;
                  return (
                    <button
                      key={r.type}
                      type="button"
                      onClick={() => setEditRole(r.type)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all ${
                        isActive 
                          ? 'bg-slate-800 border-slate-800 text-white shadow-lg' 
                          : 'bg-white border-slate-100 text-slate-400'
                      } active:scale-[0.97]`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-slate-50'}`}>
                        <i className={`fa-solid ${r.icon} ${isActive ? 'text-white' : 'text-slate-300'}`}></i>
                      </div>
                      <span className="text-xs font-black tracking-tight">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 px-1">Nickname</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-black text-lg focus:ring-2 focus:ring-slate-100 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 px-1">Instagram URL</label>
              <input type="text" value={editInsta} onChange={(e) => setEditInsta(e.target.value)} placeholder="https://instagram.com/username" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-bold text-sm focus:ring-2 focus:ring-slate-100 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 px-1">Bio</label>
              <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-bold text-sm focus:ring-2 focus:ring-slate-100 outline-none resize-none leading-relaxed" />
            </div>
            <button onClick={handleProfileSubmit} className="w-full py-5 bg-slate-800 text-white font-black rounded-[2rem] uppercase tracking-widest active:opacity-90 transition-all shadow-xl shadow-slate-100 mt-6">Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}

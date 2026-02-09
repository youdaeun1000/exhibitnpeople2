
import React from 'react';
import { UserRole } from '../types';

interface UserItem {
  id: string;
  name: string;
  role: UserRole;
}

interface UserListViewProps {
  title: string;
  users: UserItem[];
  onBack: () => void;
  onSelectUser: (id: string) => void;
  currentUserId: string;
  loading?: boolean;
}

const UserListView: React.FC<UserListViewProps> = ({
  title,
  users,
  onBack,
  onSelectUser,
  currentUserId,
  loading = false
}) => {
  const roles: Record<UserRole, { label: string; icon: string }> = {
    'Viewer': { label: '관람객', icon: 'fa-eye' },
    'Artist': { label: '작가', icon: 'fa-palette' },
    'Collector': { label: '수집가', icon: 'fa-gem' },
    'Gallery': { label: '갤러리', icon: 'fa-landmark' },
  };

  return (
    <div className="min-h-screen bg-white animate-in slide-in-from-right duration-300 flex flex-col">
      <div className="h-[80px] bg-white border-b border-slate-50 px-8 flex items-center gap-6 sticky top-0 z-50">
        <button onClick={onBack} className="w-11 h-11 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2 className="text-lg font-black text-slate-800 tracking-tighter uppercase">{title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => {
              const roleInfo = roles[user.role] || roles['Viewer'];

              return (
                <div 
                  key={user.id} 
                  className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group"
                >
                  <div 
                    onClick={() => onSelectUser(user.id)}
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 text-lg shadow-sm group-active:scale-95 transition-transform">
                      <i className={`fa-solid ${roleInfo.icon}`}></i>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-800 truncate">{user.name}</h4>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">{roleInfo.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-40 text-center flex flex-col items-center opacity-30 grayscale">
            <i className="fa-solid fa-users text-4xl mb-6"></i>
            <p className="text-[10px] font-black uppercase tracking-widest italic">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListView;

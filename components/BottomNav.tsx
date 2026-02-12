
import React from 'react';
import { ViewType } from '../types';

interface BottomNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  const navItems: { view: ViewType; label: string; icon: string }[] = [
    { view: 'list', label: 'EXHIBIT', icon: 'fa-layer-group' },
    { view: 'mytour', label: 'TOUR', icon: 'fa-draw-polygon' },
    { view: 'meeting', label: 'MEET', icon: 'fa-user-group' },
    { view: 'chat', label: 'TALK', icon: 'fa-comment-dots' },
    { view: 'profile', label: 'MY', icon: 'fa-user' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white px-4 pb-8 pt-2">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto bg-slate-50 rounded-[2rem] px-2 shadow-sm border border-white/50">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className="flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all relative"
            >
              <i className={`fa-solid ${item.icon} text-lg transition-all ${isActive ? 'text-slate-800 scale-110' : 'text-slate-300'}`}></i>
              <span className={`text-[8px] font-black tracking-[0.15em] ${isActive ? 'text-slate-800' : 'text-slate-300'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-2 w-1 h-1 bg-slate-800 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;


import React from 'react';

interface HeaderProps {
  onAddClick?: () => void;
  showAddButton?: boolean;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onAddClick, 
  showAddButton, 
  isLoggedIn = false,
  onLoginClick
}) => {
  return (
    <header 
      className="relative z-[60] h-[80px] bg-white px-8 flex items-center justify-between max-w-lg mx-auto"
    >
      <div className="flex items-center gap-4 select-none group">
        <div className="relative flex items-center justify-center w-12 h-12">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M6 6H34V26H22L16 32V26H6V6Z" fill="#F1F5F9" />
            <circle cx="20" cy="16" r="3.5" fill="#334155" />
            <circle cx="20" cy="16" r="1.5" fill="#2DD4BF" />
          </svg>
        </div>
        
        <div className="flex flex-col">
          <h1 className="text-[20px] tracking-[-0.04em] leading-none font-black flex items-center">
            <span className="text-slate-800">전시</span>
            <span className="text-slate-300 ml-1 font-bold">와 사람들</span>
          </h1>
          <span className="text-[9px] font-black text-slate-200 uppercase tracking-[0.25em] mt-2 leading-none">
            Eye & Connection
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showAddButton && (
          <button 
            onClick={onAddClick}
            className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 active:bg-slate-800 active:text-white transition-all"
            aria-label="전시 등록"
          >
            <i className="fa-solid fa-plus text-xs"></i>
          </button>
        )}
        {!isLoggedIn && (
          <button 
            onClick={onLoginClick}
            className="px-5 py-2.5 bg-slate-800 text-white text-[10px] font-black rounded-xl active:scale-95 transition-all"
          >
            LOGIN
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;

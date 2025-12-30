import React from 'react';
import { auth } from '../firebase';
import type { PageType } from '../App';

interface HeaderProps {
  user: any;
  currentPage: PageType;
}

const pageTitles: Record<PageType, string> = {
  dashboard: 'Dashboard',
  upload: 'Upload Wallpapers',
  wallpapers: 'All Wallpapers',
  categories: 'Categories / Tags',
  collections: 'Collections',
  analytics: 'Analytics',
  settings: 'Settings',
  support: 'Support / Help',
};

const Header: React.FC<HeaderProps> = ({ user, currentPage }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">{pageTitles[currentPage]}</h2>
      <div className="flex items-center gap-4">
        <button className="flex items-center justify-center size-10 rounded-full text-slate-500 hover:bg-slate-100 transition-colors relative cursor-pointer">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="flex items-center justify-center size-10 rounded-full text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-6 w-px bg-slate-200 mx-1"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">{user?.displayName || 'Admin'}</p>
            <p className="text-xs text-slate-500 mt-1">Super Admin</p>
          </div>
          <div 
            className="size-10 rounded-full bg-slate-200 bg-cover bg-center border-2 border-slate-200" 
            style={{ backgroundImage: `url('${user?.photoURL || 'https://ui-avatars.com/api/?name=Admin&background=2b6cee&color=fff'}')` }}
          ></div>
          <button 
            onClick={() => auth?.signOut()}
            className="flex items-center justify-center size-10 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors ml-1 cursor-pointer" 
            title="Logout"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

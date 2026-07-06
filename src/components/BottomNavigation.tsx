import React from 'react';
import { Home, Search, PlusCircle, MessageSquare, Menu, Sparkles } from 'lucide-react';
import { LOGO_URL } from '../lib/logo';

export function BottomNavigation({ currentView, setView, unreadMessagesCount = 0 }: { currentView: string, setView: (v: string) => void, unreadMessagesCount?: number }) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'explore', icon: Search, label: 'Explorar' },
    { id: 'sell', icon: PlusCircle, label: 'Anunciar' },
    { id: 'messages', icon: MessageSquare, label: 'Chat' },
    { id: 'menu', icon: Menu, label: 'Menu' }
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-between items-center z-50 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id || (item.id === 'menu' && ['profile', 'orders', 'settings'].includes(currentView));
        
        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'menu') {
                setView('profile');
              } else if (item.id === 'sell') {
                setView('dashboard');
              } else if (item.id === 'explore') {
                setView('home'); 
                const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (searchInput) searchInput.focus();
              } else if (item.id === 'messages') {
                setView('messages');
                window.dispatchEvent(new Event('reset-chat'));
              } else {
                setView(item.id);
              }
            }}
            className={`flex flex-col items-center justify-center w-full space-y-1 relative ${
              isActive ? 'text-indigo-600' : 'text-slate-700 hover:text-indigo-600'
            }`}
          >
            {item.id === 'home' ? (
              <img
                src={LOGO_URL}
                alt="Início"
                className={`h-6 w-auto object-contain transition-all ${isActive ? 'opacity-100 scale-110' : 'opacity-50'}`}
              />
            ) : item.id === 'sell' ? (
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'text-indigo-600 fill-indigo-100' : ''}`} strokeWidth={isActive ? 2.5 : 1.5} />
                <Sparkles className={`w-3 h-3 absolute -top-1 -right-1 ${isActive ? 'text-indigo-600 fill-indigo-600' : 'text-fuchsia-500 fill-fuchsia-500'}`} />
              </div>
            ) : (
              <div className="relative">
                 <Icon className={`w-6 h-6`} strokeWidth={isActive ? 2.5 : 1.5} />
                 {item.id === 'messages' && unreadMessagesCount > 0 && (
                   <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-indigo-500 text-[10px] text-white font-bold text-center leading-4">{unreadMessagesCount}</span>
                 )}
              </div>
            )}
            <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

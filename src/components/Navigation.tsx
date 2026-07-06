import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, MessageSquare, Bell, Search, Globe, User, ShieldCheck } from 'lucide-react';
import { CURRENT_USER } from '../data';
import { LOGO_URL } from '../lib/logo';

export function Navigation({ currentView, setView, onLogout, userProfile, unreadMessagesCount = 0 }: { currentView: string, setView: (v: string) => void, onLogout?: () => void, userProfile?: any, unreadMessagesCount?: number }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 text-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setView('home')}>
              <img src={LOGO_URL} alt="ShopConnect" className="h-10 w-auto object-contain" />
            </div>
            <div className="hidden md:flex space-x-4">
              <button onClick={() => setView('home')} className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'home' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}>Explorar</button>
              <button onClick={() => setView('dashboard')} className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}>Painel do Vendedor</button>
            </div>
          </div>
          
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm transition-colors shadow-sm" 
                placeholder="Buscar em todo o Brasil..." 
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-6">
            <button className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center text-sm">
              <Globe className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">PT</span>
            </button>
            <button onClick={() => {
              setView('messages');
              window.dispatchEvent(new Event('reset-chat'));
            }} className={`text-slate-500 hover:text-indigo-600 transition-colors relative ${currentView === 'messages' ? 'text-indigo-600' : ''}`}>
              <MessageSquare className="h-5 w-5" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-indigo-500 text-[10px] text-white font-bold text-center leading-4">{unreadMessagesCount}</span>
              )}
            </button>
            
            <div className="relative" ref={notifRef}>
              <button 
                className="text-slate-500 hover:text-indigo-600 transition-colors relative"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
              >
                <Bell className="h-5 w-5" />
                {/* A bolinha vermelha só deve aparecer se houver notificações reais (usaremos > 0 depois) */}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-4 border-b border-slate-100 font-medium text-slate-900">
                    Notificações
                  </div>
                  <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                    <div className="p-6 text-center text-sm text-slate-500">
                      Nenhuma notificação no momento.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative border-l border-slate-200 pl-4 sm:pl-6 ml-2 sm:ml-2" ref={profileRef}>
              <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
              >
                <img src={userProfile?.avatar || CURRENT_USER.avatar} alt="Profile" className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 hover:ring-2 hover:ring-indigo-200 transition-all" />
              </div>
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3 border-b border-slate-100">
                    <p className="font-medium text-slate-900">{userProfile?.name || CURRENT_USER.name}</p>
                    <p className="text-xs text-indigo-600 mt-0.5 font-medium hover:text-indigo-700 cursor-pointer" onClick={() => { setView('profile'); setShowProfileMenu(false); }}>Ver Perfil</p>
                  </div>
                  <div className="p-1.5">
                    <button onClick={() => { setView('profile'); setShowProfileMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md flex items-center transition-colors">
                      <User className="h-4 w-4 mr-2" /> Meu Perfil
                    </button>
                    <button onClick={() => { setView('orders'); setShowProfileMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md flex items-center transition-colors">
                      <ShoppingCart className="h-4 w-4 mr-2" /> Meus Pedidos
                    </button>
                    <button onClick={() => { setView('settings'); setShowProfileMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md flex items-center transition-colors">
                      <ShieldCheck className="h-4 w-4 mr-2" /> Configurações
                    </button>
                    <div className="h-px bg-slate-100 my-1.5"></div>
                    <button 
                      onClick={() => {
                        if (onLogout) onLogout();
                        else setView('login');
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setView('dashboard')}
              className="ml-2 hidden lg:flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Anunciar agora
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

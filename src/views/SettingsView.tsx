import React, { useState } from 'react';
import { Bell, Lock, Eye, Shield, Smartphone, CreditCard } from 'lucide-react';

export function SettingsView({ userProfile, categories, setCategories }: { userProfile: any, categories: string[], setCategories: (c: string[]) => void }) {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  
  const [activeTab, setActiveTab] = useState('account');
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      const updatedCategories = [...categories, newCategoryName.trim()];
      setCategories(updatedCategories);
      localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
      setNewCategoryName('');
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    const updatedCategories = categories.filter(cat => cat !== catToRemove);
    setCategories(updatedCategories);
    localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
  };
  
  const isAdmin = userProfile?.email === 'adminshopconnect@support.com';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Configurações</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('account')}
            className={`w-full text-left px-4 py-3 font-medium rounded-lg transition-colors ${activeTab === 'account' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            Conta
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-3 font-medium rounded-lg transition-colors ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            Privacidade e Segurança
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-3 font-medium rounded-lg transition-colors ${activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            Notificações
          </button>
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`w-full text-left px-4 py-3 font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              <Shield className="w-4 h-4" /> Configurações de Admin
            </button>
          )}
        </div>
        
        <div className="md:col-span-2 space-y-6">
          {(activeTab === 'account' || activeTab === 'security') && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  Segurança da Conta
                </h2>
                <p className="text-sm text-slate-500 mt-1">Gerencie sua senha e métodos de autenticação.</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Senha</p>
                    <p className="text-sm text-slate-500">Última alteração há 3 meses</p>
                  </div>
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Alterar</button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Autenticação em duas etapas</p>
                      <p className="text-sm text-slate-500">Adicione uma camada extra de segurança</p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Ativar</button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-500" />
                  Preferências de Notificação
                </h2>
                <p className="text-sm text-slate-500 mt-1">Escolha como você quer ser notificado.</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-slate-900">Notificações Push</p>
                    <p className="text-sm text-slate-500">Alertas no navegador e celular</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifications} onChange={() => setNotifications(!notifications)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-slate-900">E-mails Promocionais</p>
                    <p className="text-sm text-slate-500">Ofertas e novidades exclusivas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {isAdmin && activeTab === 'admin' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  Painel de Administração
                </h2>
                <p className="text-sm text-slate-500 mt-1">Gerencie atalhos (categorias) e outras configurações globais.</p>
              </div>
              
              <div className="space-y-4 pt-2">
                <h3 className="font-medium text-slate-900 border-b border-slate-100 pb-2">Atalhos (Categorias)</h3>
                
                <form onSubmit={handleAddCategory} className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome do novo atalho..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Adicionar
                  </button>
                </form>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                      <span className="text-sm font-medium text-slate-700">{cat}</span>
                      <button 
                        onClick={() => handleRemoveCategory(cat)}
                        className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                        title="Remover atalho"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

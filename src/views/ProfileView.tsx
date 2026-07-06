import React, { useState, useRef } from 'react';
import { User, MapPin, Mail, Calendar, Edit2, Check, X, Camera } from 'lucide-react';

export function ProfileView({ userProfile, onUpdateProfile, products }: { userProfile: any, onUpdateProfile: (p: any) => void, products: any[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userProfile);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const activeListingsCount = products.filter(p => p.seller?.id === 'u1' || p.seller?.name === userProfile.name).length;
  const rating = userProfile.rating || 0;
  const purchasesCount = userProfile.purchasesCount || 0;

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(userProfile);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'cover') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div 
          className="h-32 bg-indigo-600 relative bg-cover bg-center"
          style={formData.cover ? { backgroundImage: `url(${formData.cover})` } : {}}
        >
          {isEditing && (
            <>
              <button 
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm font-medium flex items-center transition-colors"
              >
                <Camera className="w-4 h-4 mr-2" /> Alterar Capa
              </button>
              <input 
                type="file" 
                accept="image/*,video/*" 
                className="hidden" 
                ref={coverInputRef}
                onChange={(e) => handleFileChange(e, 'cover')}
              />
            </>
          )}
        </div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 sm:-mt-16 mb-4 space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-4 relative">
              <div className="relative">
                <img 
                  src={formData.avatar} 
                  alt={formData.name} 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-slate-100 object-cover" 
                />
                {isEditing && (
                  <>
                    <button 
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full border-2 border-white hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      className="hidden" 
                      ref={avatarInputRef}
                      onChange={(e) => handleFileChange(e, 'avatar')}
                    />
                  </>
                )}
              </div>
              <div className="text-center sm:text-left mt-4 sm:mt-0">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="text-2xl font-bold text-slate-900 border-b-2 border-indigo-600 focus:outline-none bg-transparent"
                    placeholder="Seu Nome"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-slate-900">{userProfile.name}</h1>
                )}
                <p className="text-slate-500 font-medium">Membro desde {userProfile.memberSince}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleCancel}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    <Check className="w-4 h-4 mr-2" /> Salvar
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Editar Perfil
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <Mail className="w-5 h-5 mr-3 text-slate-400" />
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-indigo-300 focus:border-indigo-600 focus:outline-none"
                />
              ) : (
                <span>{userProfile.email}</span>
              )}
            </div>
            
            <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <MapPin className="w-5 h-5 mr-3 text-slate-400" />
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-indigo-300 focus:border-indigo-600 focus:outline-none"
                />
              ) : (
                <span>{userProfile.location}</span>
              )}
            </div>
            
            <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <Calendar className="w-5 h-5 mr-3 text-slate-400" />
              {isEditing ? (
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-indigo-300 focus:border-indigo-600 focus:outline-none text-slate-700"
                />
              ) : (
                <span>Nascido em {new Date(userProfile.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
              )}
            </div>
            
            <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <User className="w-5 h-5 mr-3 text-slate-400" />
              {isEditing ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-indigo-300 focus:border-indigo-600 focus:outline-none text-slate-700 cursor-pointer"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Não informar">Não informar</option>
                  <option value="Outro">Outro</option>
                </select>
              ) : (
                <span>{userProfile.gender}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Estatísticas do Perfil</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 border border-slate-100 rounded-lg bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Avaliações</p>
              <p className="text-2xl font-bold text-slate-900">{rating > 0 ? rating.toFixed(1) : '0'}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center text-2xl">
              ★
            </div>
          </div>
          <div className="p-4 border border-slate-100 rounded-lg bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Compras</p>
              <p className="text-2xl font-bold text-slate-900">{purchasesCount}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">
              🛍️
            </div>
          </div>
          <div className="p-4 border border-slate-100 rounded-lg bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Anúncios ativos</p>
              <p className="text-2xl font-bold text-slate-900">{activeListingsCount}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl font-bold">
              📦
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { User, MapPin, Mail, Calendar, Edit2, Check, X, Camera, Trash2, Package } from 'lucide-react';

export function ProfileView({
  userProfile,
  onUpdateProfile,
  products,
  onDeleteProduct,
  onEditProduct,
  currentUserId,
  onViewSeller,
}: {
  userProfile: any;
  onUpdateProfile: (p: any) => void;
  products: any[];
  onDeleteProduct?: (id: string) => void;
  onEditProduct?: (product: any) => void;
  currentUserId: string;
  onViewSeller?: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userProfile);
  const [showMyAds, setShowMyAds] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const myProducts = products.filter(
    (p) => p.seller?.id === currentUserId
  );
  const activeListingsCount = myProducts.length;
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
        setFormData((prev: any) => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAd = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este anúncio?')) {
      onDeleteProduct?.(id);
    }
  };

  const handleSaveAdEdit = () => {
    if (editingAd && onEditProduct) {
      onEditProduct(editingAd);
      setEditingAd(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Card principal do perfil */}
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

      {/* Estatísticas */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Estatísticas do Perfil</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card Avaliações — clicável */}
          <button
            onClick={() => { setShowReviews(!showReviews); setShowOrders(false); setShowMyAds(false); }}
            className="p-4 border border-slate-100 rounded-lg bg-slate-50 flex items-center justify-between hover:bg-amber-50 hover:border-amber-200 transition-colors text-left w-full"
          >
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Avaliações</p>
              <p className="text-2xl font-bold text-slate-900">{rating > 0 ? rating.toFixed(1) : '0'}</p>
              <p className="text-xs text-amber-600 font-medium mt-1">{showReviews ? 'Fechar ▲' : 'Ver avaliações ▼'}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center text-2xl">★</div>
          </button>

          {/* Card Compras — clicável */}
          <button
            onClick={() => { setShowOrders(!showOrders); setShowReviews(false); setShowMyAds(false); }}
            className="p-4 border border-slate-100 rounded-lg bg-slate-50 flex items-center justify-between hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-left w-full"
          >
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Compras</p>
              <p className="text-2xl font-bold text-slate-900">{purchasesCount}</p>
              <p className="text-xs text-indigo-600 font-medium mt-1">{showOrders ? 'Fechar ▲' : 'Ver compras ▼'}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">🛍️</div>
          </button>

          {/* Card de Anúncios ativos — clicável */}
          <button
            onClick={() => { setShowMyAds(!showMyAds); setShowReviews(false); setShowOrders(false); }}
            className="p-4 border border-slate-100 rounded-lg bg-slate-50 flex items-center justify-between hover:bg-emerald-50 hover:border-emerald-200 transition-colors text-left w-full"
          >
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Anúncios ativos</p>
              <p className="text-2xl font-bold text-slate-900">{activeListingsCount}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">{showMyAds ? 'Fechar lista ▲' : 'Ver meus anúncios ▼'}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl font-bold">📦</div>
          </button>
        </div>
      </div>

      {/* Painel de Avaliações */}
      {showReviews && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Avaliações Recebidas</h2>
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-3">
            <div className="text-5xl">⭐</div>
            <p className="text-base font-medium text-slate-600">Nenhuma avaliação ainda</p>
            <p className="text-sm text-slate-400 text-center max-w-xs">
              Quando alguém comprar ou vender com você, as avaliações aparecerão aqui automaticamente.
            </p>
          </div>
        </div>
      )}

      {/* Painel de Compras */}
      {showOrders && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Histórico de Compras</h2>
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-3">
            <div className="text-5xl">🛍️</div>
            <p className="text-base font-medium text-slate-600">Nenhuma compra realizada ainda</p>
            <p className="text-sm text-slate-400 text-center max-w-xs">
              Quando você finalizar uma compra na plataforma, o histórico completo aparecerá aqui.
            </p>
          </div>
        </div>
      )}

      {/* Painel de anúncios */}
      {showMyAds && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Meus Anúncios</h2>
          {myProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Package className="w-12 h-12 mb-3" />
              <p className="text-sm">Você ainda não tem anúncios publicados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myProducts.map((product) => (
                <div key={product.id} className="border border-slate-100 rounded-xl overflow-hidden">
                  {editingAd?.id === product.id ? (
                    /* Modo de edição inline */
                    <div className="p-4 space-y-3 bg-indigo-50">
                      <p className="font-semibold text-indigo-700 text-sm mb-2">Editando: {product.title}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-500 font-medium">Título</label>
                          <input
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={editingAd.title}
                            onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-medium">Preço (R$)</label>
                          <input
                            type="number"
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={editingAd.price}
                            onChange={(e) => setEditingAd({ ...editingAd, price: parseFloat(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-medium">Descrição</label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          value={editingAd.description || ''}
                          onChange={(e) => setEditingAd({ ...editingAd, description: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          onClick={() => setEditingAd(null)}
                          className="px-4 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveAdEdit}
                          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Salvar
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Modo visualização */
                    <div className="flex items-center gap-4 p-4">
                      <img
                        src={product.images?.[0]}
                        alt={product.title}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 flex-shrink-0 bg-slate-100"
                        onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{product.title}</p>
                        <p className="text-indigo-600 font-bold text-sm">
                          R$ {product.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${product.condition === 'Novo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {product.condition}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => setEditingAd(product)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAd(product.id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { BottomNavigation } from './components/BottomNavigation';
import { MOCK_PRODUCTS } from './data';
import { ProductCard } from './components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { ProductDetail } from './views/ProductDetail';
import { MessagesView } from './views/MessagesView';
import { SellerDashboard } from './views/SellerDashboard';
import { LoginView } from './views/LoginView';
import { ProfileView } from './views/ProfileView';
import { OrdersView } from './views/OrdersView';
import { SettingsView } from './views/SettingsView';
import { CURRENT_USER } from './data';
import { LOGO_URL } from './lib/logo';
import { supabase } from './lib/supabase';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [userId, setUserId] = useState<string>(() => {
    return localStorage.getItem('userId') || 'guest';
  });
  const [view, setView] = useState(() => {
    return localStorage.getItem('currentView') || 'home';
  });

  const handleSetView = (newView: string) => {
    setView(newView);
    localStorage.setItem('currentView', newView);
  };
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('Tudo');

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('customCategories');
    if (saved) return JSON.parse(saved);
    return ['Tudo', 'Computadores', 'Video Games', 'Jogos', 'Acessórios'];
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('global_products');
    if (saved) return JSON.parse(saved);
    return MOCK_PRODUCTS;
  });

  const handleAddProduct = (newProduct: any) => {
    // Usa localStorage como fonte de verdade do userId (síncrono, não afetado pelo closure React)
    const activeUserId = localStorage.getItem('userId') || userId || 'guest';
    const activeName = userProfile?.name || 'Vendedor';
    
    const productWithCorrectOwner = {
      ...newProduct,
      seller: {
        ...newProduct.seller,
        id: activeUserId,
        name: activeName,
      }
    };
    const updated = [productWithCorrectOwner, ...products];
    setProducts(updated);
    localStorage.setItem('global_products', JSON.stringify(updated));
    // Não redireciona - mantém no dashboard para o usuário ver o anúncio publicado
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p: any) => p.id !== id);
    setProducts(updated);
    localStorage.setItem('global_products', JSON.stringify(updated));
  };

  const handleEditProduct = (updatedProduct: any) => {
    const updated = products.map((p: any) => p.id === updatedProduct.id ? updatedProduct : p);
    setProducts(updated);
    localStorage.setItem('global_products', JSON.stringify(updated));
  };

  const defaultProfile = {
    name: CURRENT_USER.name,
    avatar: CURRENT_USER.avatar,
    email: `${CURRENT_USER.id}@usuario.shopconnect.com`,
    location: 'São Paulo, SP - Brasil',
    birthDate: '1990-05-15',
    gender: 'Masculino',
    memberSince: new Date().getFullYear().toString(),
  };

  const [userProfile, setUserProfile] = useState(() => {
    const activeUid = localStorage.getItem('userId') || 'guest';
    const saved = localStorage.getItem(`userProfile_${activeUid}`);
    if (saved) return JSON.parse(saved);
    return defaultProfile;
  });

  const handleUpdateProfile = (updatedProfile: any) => {
    setUserProfile(updatedProfile);
    localStorage.setItem(`userProfile_${userId}`, JSON.stringify(updatedProfile));
  };

  // Carrega perfil salvo de um usuário específico
  const loadProfileForUser = (uid: string, supabaseUser: any) => {
    const profileKey = `userProfile_${uid}`;
    const saved = localStorage.getItem(profileKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserProfile(parsed);
    } else {
      // Primeira vez desse usuário: usa dados do Google/Facebook
      const freshProfile = {
        name: supabaseUser.user_metadata?.full_name || defaultProfile.name,
        avatar: supabaseUser.user_metadata?.avatar_url || defaultProfile.avatar,
        email: supabaseUser.email || defaultProfile.email,
        location: 'Brasil',
        birthDate: '',
        gender: 'Não informar',
        memberSince: new Date().getFullYear().toString(),
      };
      setUserProfile(freshProfile);
      localStorage.setItem(profileKey, JSON.stringify(freshProfile));
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        localStorage.setItem('userId', session.user.id);
        loadProfileForUser(session.user.id, session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        const uid = session.user.id;
        setUserId(uid);
        localStorage.setItem('userId', uid);
        loadProfileForUser(uid, session.user);

        // Migra anúncios antigos com seller.id='u1' para o userId real
        const savedProds = localStorage.getItem('global_products');
        if (savedProds) {
          const prods = JSON.parse(savedProds);
          const userName = session.user.user_metadata?.full_name;
          const migrated = prods.map((p: any) => {
            if (p.seller?.id === 'u1' || p.seller?.id === 'guest') {
              // Só migra se o nome bater (produto deste usuário) ou se nunca houve outro dono definido
              return { ...p, seller: { ...p.seller, id: uid, name: userName || p.seller?.name } };
            }
            return p;
          });
          localStorage.setItem('global_products', JSON.stringify(migrated));
          setProducts(migrated);
        }

        if (event === 'SIGNED_IN') {
          handleSetView('home');
        }
      } else {
        // Se for login mock de administrador, não desloga
        const activeUid = localStorage.getItem('userId');
        if (activeUid === 'admin') {
          return;
        }

        setIsAuthenticated(false);
        setUserId('guest');
        localStorage.removeItem('userId');
        const saved = localStorage.getItem('userProfile_guest');
        setUserProfile(saved ? JSON.parse(saved) : defaultProfile);
        localStorage.removeItem('isAuthenticated');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    setUserId('admin');
    localStorage.setItem('userId', 'admin');
    
    // Carrega ou inicializa perfil para o admin
    const profileKey = 'userProfile_admin';
    const saved = localStorage.getItem(profileKey);
    if (saved) {
      setUserProfile(JSON.parse(saved));
    } else {
      const adminProfile = {
        name: 'Administrador',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        email: 'adminshopconnect@support.com',
        location: 'São Paulo, SP - Brasil',
        birthDate: '1990-05-15',
        gender: 'Masculino',
        memberSince: new Date().getFullYear().toString(),
      };
      setUserProfile(adminProfile);
      localStorage.setItem(profileKey, JSON.stringify(adminProfile));
    }

    // Migra anúncios antigos ou guest para o admin
    const savedProds = localStorage.getItem('global_products');
    if (savedProds) {
      try {
        const prods = JSON.parse(savedProds);
        const migrated = prods.map((p: any) => {
          if (p.seller?.id === 'u1' || p.seller?.id === 'guest') {
            return { ...p, seller: { ...p.seller, id: 'admin', name: 'Administrador' } };
          }
          return p;
        });
        localStorage.setItem('global_products', JSON.stringify(migrated));
        setProducts(migrated);
      } catch (e) {
        console.error(e);
      }
    }

    handleSetView('home');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserId('guest');
    localStorage.removeItem('userId');
    // Reseta para o perfil padrão de convidado
    const saved = localStorage.getItem('userProfile_guest');
    setUserProfile(saved ? JSON.parse(saved) : defaultProfile);
    localStorage.removeItem('isAuthenticated');
  };

  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    handleSetView('product');
  };

  const handleViewSellerProfile = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    handleSetView('seller-profile');
  };

  const handleBackToHome = () => {
    setSelectedProductId(null);
    setSelectedSellerId(null);
    handleSetView('home');
  };

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="w-full h-full flex flex-col font-sans selection:bg-indigo-500/30">
      <div className="shrink-0">
        <Navigation currentView={view} setView={handleSetView} onLogout={handleLogout} userProfile={userProfile} unreadMessagesCount={unreadMessagesCount} />
      </div>
      
      <main className={`flex-1 flex flex-col w-full ${view === 'messages' ? 'px-0 py-0' : 'px-4 sm:px-6 py-4'} overflow-hidden pb-20 sm:pb-4`}>
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto min-h-0 pb-8"
            >
              {/* Banner de boas-vindas com a logo */}
              <div className="mb-8 bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/10 overflow-hidden relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
                  <img
                    src={LOGO_URL}
                    alt="ShopConnect"
                    className="h-14 sm:h-16 w-auto object-contain drop-shadow-lg"
                  />
                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Bem-vindo ao ShopConnect</h1>
                    <p className="text-indigo-200 mt-1 text-sm sm:text-base">O marketplace gamer mais seguro do Brasil 🎮</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSetView('dashboard')}
                  className="relative z-10 whitespace-nowrap bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-full text-sm shadow hover:bg-indigo-400 transition-colors"
                >
                  + Anunciar agora
                </button>
              </div>

              <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Anúncios recentes</h2>
                  <p className="text-indigo-200 mt-1">O que você está procurando hoje?</p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto items-center no-scrollbar">
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setCategoryFilter(cat)}
                      className={`whitespace-nowrap px-4 py-2 border rounded-full text-sm font-medium transition-all shadow-sm ${
                        categoryFilter === cat 
                          ? 'border-indigo-400 bg-indigo-500 text-white' 
                          : 'border-white/20 bg-white/5 text-indigo-100 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.filter(product => {
                  if (categoryFilter === 'Tudo') return true;
                  if (categoryFilter === 'Computadores' && product.category === 'pc') return true;
                  if (categoryFilter === 'Video Games' && product.category === 'consoles') return true;
                  if (categoryFilter === 'Jogos' && product.category === 'games') return true;
                  if (categoryFilter === 'Acessórios' && product.category === 'accessories') return true;
                  // For newly added categories
                  return product.category.toLowerCase() === categoryFilter.toLowerCase();
                }).map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => handleProductClick(product.id)} 
                  />
                ))}
              </div>
            </motion.div>
          )}

          {view === 'product' && selectedProductId && (
            <motion.div
              key="product"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto min-h-0 pb-8"
            >
              <ProductDetail 
                productId={selectedProductId} 
                products={products}
                onBack={handleBackToHome}
                onMessage={() => handleSetView('messages')}
                onViewSeller={handleViewSellerProfile}
              />
            </motion.div>
          )}

          {view === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-h-0 w-full h-full"
            >
              <MessagesView userProfile={userProfile} onUnreadChange={setUnreadMessagesCount} />
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto min-h-0 pb-8"
            >
              <SellerDashboard onAddProduct={handleAddProduct} categories={categories} userProfile={userProfile} products={products} userId={userId} />
            </motion.div>
          )}

          {view === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto min-h-0 pb-8"
            >
              <ProfileView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} products={products} onDeleteProduct={handleDeleteProduct} onEditProduct={handleEditProduct} currentUserId={userId} onViewSeller={handleViewSellerProfile} />
            </motion.div>
          )}

          {view === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto min-h-0 pb-8"
            >
              <OrdersView />
            </motion.div>
          )}

          {view === 'seller-profile' && selectedSellerId && (() => {
            const sellerProducts = products.filter((p: any) => p.seller?.id === selectedSellerId);
            const sellerInfo = sellerProducts[0]?.seller || {};
            return (
              <motion.div
                key="seller-profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto min-h-0 pb-8"
              >
                <div className="max-w-4xl mx-auto p-6 space-y-6">
                  <button onClick={handleBackToHome} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-2">
                    ← Voltar
                  </button>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-indigo-500 to-indigo-700" />
                    <div className="px-6 pb-6 relative">
                      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 sm:-mt-16 mb-4 space-y-4 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <img src={sellerInfo.avatar || 'https://via.placeholder.com/80'} alt={sellerInfo.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-slate-100 object-cover" />
                          <div className="text-center sm:text-left mt-4 sm:mt-0">
                            <h1 className="text-2xl font-bold text-slate-900">{sellerInfo.name || 'Vendedor'}</h1>
                            <p className="text-slate-500 font-medium">Membro verificado ✓</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-amber-400">★</span>
                              <span className="text-sm font-medium text-slate-700">{sellerInfo.rating?.toFixed(1) || '5.0'}</span>
                              <span className="text-sm text-slate-400">({sellerInfo.reviewsCount || 0} avaliações)</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">Perfil somente leitura</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Anúncios de {sellerInfo.name || 'Vendedor'}</h2>
                    {sellerProducts.length === 0 ? (
                      <p className="text-slate-400 text-sm">Nenhum anúncio ativo.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sellerProducts.map((p: any) => (
                          <div key={p.id} onClick={() => handleProductClick(p.id)} className="border border-slate-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                            <img src={p.images?.[0]} alt={p.title} className="w-full h-36 object-cover bg-slate-100" />
                            <div className="p-3">
                              <p className="font-semibold text-slate-900 text-sm truncate">{p.title}</p>
                              <p className="text-indigo-600 font-bold text-sm mt-1">R$ {p.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {view === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto min-h-0 pb-8"
            >
              <SettingsView userProfile={userProfile} categories={categories} setCategories={setCategories} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <BottomNavigation currentView={view} setView={handleSetView} unreadMessagesCount={unreadMessagesCount} />
    </div>
  );
}

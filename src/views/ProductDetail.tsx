import { ArrowLeft, ShieldCheck, Star, ShieldAlert, Languages, Lock, Truck, Camera, X } from 'lucide-react';
import { MOCK_PRODUCTS } from '../data';
import { formatCurrency } from '../lib/utils';
import { Product } from '../types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function ProductDetail({ productId, products, onBack, onMessage, onViewSeller }: { productId: string, products: Product[], onBack: () => void, onMessage: (context?: any) => void, onViewSeller?: (id: string) => void }) {
  const product = products.find(p => p.id === productId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return <div>Product not found</div>;

  return (
    <div className="w-full">
      <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para anúncios
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Images */}
        <div className="space-y-4">
          <div 
            className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative cursor-pointer group"
            onClick={() => setSelectedImage(product.images[currentImageIndex])}
          >
            <img src={product.images[currentImageIndex]} alt={product.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <Camera className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
            </div>
            {product.authenticityVerified && (
              <div className="absolute top-4 left-4 bg-indigo-500 text-white text-sm px-4 py-2 rounded-full font-medium flex items-center shadow-xl">
                <ShieldCheck className="w-4 h-4 mr-2" /> Autenticidade Verificada
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, i) => (
              <div 
                key={i} 
                onClick={() => setCurrentImageIndex(i)}
                className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${i === currentImageIndex ? 'border-indigo-500 scale-95 opacity-100' : 'border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {product.images.length < 4 && (
              <div className="aspect-square rounded-lg border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs">
                 <Camera className="w-6 h-6 mb-1 opacity-50" />
                 Mais Fotos
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col">
          <div className="mb-6 border-b border-slate-800/60 pb-6">
            <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{product.title}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-3xl font-bold text-indigo-400">{formatCurrency(product.price, product.currency)}</span>
              {product.acceptsTrades && (
                 <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 px-3 py-1 rounded-full text-sm font-medium">
                   Aberto a Trocas
                 </span>
              )}
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">{product.description}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 flex items-center justify-between">
            <div 
              className="flex items-center space-x-4 cursor-pointer group"
              onClick={() => onViewSeller && onViewSeller(product.seller.id)}
            >
              <img 
                src={product.seller.avatar} 
                alt="Seller" 
                className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 group-hover:border-indigo-500 transition-colors" 
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="text-white font-medium group-hover:text-indigo-400 transition-colors">{product.seller.name}</h3>
                <div className="flex items-center text-sm text-slate-400 mt-0.5">
                  <Star className="w-4 h-4 text-amber-400 mr-1 fill-amber-400" />
                  <span>{product.seller.rating} ({product.seller.reviewsCount} avaliações)</span>
                  {product.seller.isVerified && (
                     <ShieldCheck className="w-4 h-4 text-indigo-400 ml-2" />
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => onMessage({
              targetUserId: product.seller.id,
              targetUserName: product.seller.name,
              targetUserAvatar: product.seller.avatar,
              productId: product.id,
              productTitle: product.title
            })} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors border border-slate-700 flex items-center">
              <Languages className="w-4 h-4 mr-2 text-indigo-400" /> Contato (Tradução Automática)
            </button>
          </div>

          <div className="space-y-4 bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 flex-grow">
            <h3 className="text-white font-medium mb-2">Proteção de Compra</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start">
                <Lock className="w-5 h-5 text-emerald-400 mr-3 shrink-0" />
                <span><strong className="text-slate-200">Escrow Seguro:</strong> Seu dinheiro fica retido em segurança até você receber e verificar o item.</span>
              </li>
              <li className="flex items-start">
                <ShieldAlert className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
                <span><strong className="text-slate-200">Garantia de Autenticidade:</strong> O ShopConnect verifica os números de série de hardware e chaves de software.</span>
              </li>
              <li className="flex items-start">
                <Truck className="w-5 h-5 text-blue-400 mr-3 shrink-0" />
                <span><strong className="text-slate-200">Frete Rastreado:</strong> Entrega estimada em {product.shipping.estimatedDays} dias com atualizações em tempo real.</span>
              </li>
            </ul>
          </div>

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl mt-6 transition-all shadow-lg shadow-indigo-900/20 active:scale-[0.98]">
            Comprar Agora com Segurança
          </button>
        </div>
      </div>

      {/* Image Expansion Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-full transition-colors z-[110]"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage} 
              alt="Expanded view" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

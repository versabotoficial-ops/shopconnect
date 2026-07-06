import { ShieldCheck, Star, Package, MapPin, Repeat2, Clock } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency, formatTimeAgo } from '../lib/utils';
import { motion } from 'motion/react';
import type { Key } from 'react';

export function ProductCard({ product, onClick }: { product: Product, onClick: () => void, key?: Key }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer group hover:border-indigo-200 hover:shadow-md transition-all flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img 
          src={product.images[0]} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.authenticityVerified && (
          <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center shadow-lg">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verificado
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex flex-col items-start mb-2">
          <span className="text-indigo-700 font-bold text-xl mb-1">{formatCurrency(product.price, product.currency)}</span>
          <h3 className="text-slate-700 font-normal line-clamp-2 leading-snug">{product.title}</h3>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4 mt-auto pt-2">
          <span className="inline-flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
            {product.condition.replace('_', ' ').toUpperCase()}
          </span>
          {product.acceptsTrades && (
            <span className="inline-flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200">
              <Repeat2 className="w-3 h-3 mr-1" /> Aceita Trocas
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
          <div className="flex items-center space-x-2">
            <img src={product.seller.avatar} alt={product.seller.name} className="w-6 h-6 rounded-full bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-600 font-medium">{product.seller.name}</span>
              <div className="flex items-center text-[10px] text-slate-500">
                <Star className="w-3 h-3 text-amber-400 mr-0.5 fill-amber-400" />
                <span>{product.seller.rating} ({product.seller.reviewsCount})</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end text-xs text-slate-500">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>{formatTimeAgo(product.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

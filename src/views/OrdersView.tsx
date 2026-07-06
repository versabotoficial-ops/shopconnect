import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';

export function OrdersView() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Aqui no futuro será feita a chamada de API real para carregar os pedidos em tempo real.
    // Ex: fetch('/api/orders').then(...)
    setOrders([]); // Atualmente zerado
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'delivered': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'processing': return <Clock className="w-5 h-5 text-amber-500" />;
      default: return <Package className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'delivered': return 'Entregue';
      case 'shipped': return 'Enviado';
      case 'processing': return 'Processando';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Meus Pedidos</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum pedido encontrado</h3>
          <p className="text-slate-500 max-w-sm">
            Você ainda não realizou nenhuma compra. Quando você comprar, seus pedidos aparecerão aqui em tempo real.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Pedido realizado em</p>
                  <p className="text-slate-900 font-medium">{new Date(order.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total</p>
                  <p className="text-slate-900 font-medium">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="sm:ml-auto flex flex-col sm:items-end">
                  <p className="text-sm text-slate-500 font-medium">Pedido nº</p>
                  <p className="text-slate-900 font-medium">{order.id}</p>
                </div>
              </div>
              
              <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="font-bold text-slate-900">{getStatusText(order.status)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <Package className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-medium">{item.name}</p>
                          <p className="text-slate-500 text-sm">Quantidade: {item.qty}</p>
                          <p className="text-indigo-600 font-medium text-sm mt-1">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="w-full sm:w-auto flex flex-col gap-2">
                  <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors">
                    Rastrear pedido
                  </button>
                  <button className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    Ver detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

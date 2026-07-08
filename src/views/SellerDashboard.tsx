import React, { useState } from "react";
import { MOCK_DASHBOARD } from "../data";
import { formatCurrency } from "../lib/utils";
import { LOGO_URL } from "../lib/logo";
import {
  TrendingUp,
  Package,
  Star,
  Clock,
  AlertCircle,
  X,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ReactNode } from "react";

export function SellerDashboard({
  onAddProduct,
  categories,
  userProfile,
  products,
  userId,
}: {
  onAddProduct: (product: any) => void;
  categories: string[];
  userProfile: any;
  products: any[];
  userId: string;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filtro robusto: por ID exato (estado), por localStorage, ou por nome do perfil
  const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const activeListingsCount = products.filter((p) => {
    if (!p.seller) return false;
    const matchById = p.seller.id === userId;
    const matchByStoredId = storedUserId && p.seller.id === storedUserId;
    const matchByName = userProfile?.name && p.seller.name === userProfile.name;
    return matchById || matchByStoredId || matchByName;
  }).length;
  
  const rating = userProfile.rating || 0;
  const reviewsCount = userProfile.reviewsCount || 0;
  const totalSales = userProfile.salesCount || 0;
  const pendingDeliveries = userProfile.pendingDeliveries || 0;

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Painel do Vendedor
          </h1>
          <p className="text-indigo-200 mt-1">
            Gerencie seu inventário, vendas e anúncios.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm text-sm flex items-center"
        >
          <span className="text-lg leading-none mr-2">+</span> Criar Novo
          Anúncio
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Vendas"
          value={totalSales.toString()}
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
        />
        <MetricCard
          title="Anúncios Ativos"
          value={activeListingsCount.toString()}
          icon={<Package className="w-5 h-5 text-indigo-500" />}
        />
        <MetricCard
          title="Avaliação Média"
          value={rating > 0 ? rating.toFixed(1) : "0"}
          icon={<Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
          subtitle={`Baseado em ${reviewsCount} avaliações`}
        />
        <MetricCard
          title="Entregas Pendentes"
          value={pendingDeliveries.toString()}
          icon={<Clock className="w-5 h-5 text-blue-500" />}
          action="Rastrear envios"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">
            Desempenho de Vendas (6 Meses)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={MOCK_DASHBOARD.salesData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#4f46e5",
                    strokeWidth: 2,
                    stroke: "#ffffff",
                  }}
                  activeDot={{ r: 6 }}
                />
                <CartesianGrid
                  stroke="#f1f5f9"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  stroke="#64748b"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `R$${value}`}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "8px",
                    color: "#0f172a",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{ color: "#4f46e5", fontWeight: 600 }}
                  formatter={(value: number) => [
                    formatCurrency(value, "BRL"),
                    "Vendas",
                  ]}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">
            Ação Necessária
          </h3>

          <div className="space-y-4 flex-grow flex flex-col">
            {pendingDeliveries > 0 ? (
              <ActionItem
                title={`Enviar Pedido${pendingDeliveries > 1 ? "s" : ""}`}
                desc={`Você tem ${pendingDeliveries} pedido${pendingDeliveries > 1 ? "s" : ""} aguardando envio`}
                type="urgent"
              />
            ) : null}

            {(!userProfile.pendingActions || userProfile.pendingActions.length === 0) && pendingDeliveries === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-400 py-8">
                <CheckCircle2 className="w-12 h-12 mb-3 text-slate-200" />
                <p className="text-sm font-medium">Tudo em dia!</p>
                <p className="text-xs">Nenhuma ação pendente no momento.</p>
              </div>
            ) : (
              userProfile.pendingActions?.map((action: any, i: number) => (
                <ActionItem
                  key={i}
                  title={action.title}
                  desc={action.desc}
                  type={action.type}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateAdModal
          onClose={() => setShowCreateModal(false)}
          onAdd={onAddProduct}
          categories={categories}
          userProfile={userProfile}
          userId={userId}
        />
      )}
    </div>
  );
}

function CreateAdModal({
  onClose,
  onAdd,
  categories,
  userProfile,
  userId,
}: {
  onClose: () => void;
  onAdd: (product: any) => void;
  categories: string[];
  userProfile: any;
  userId: string;
}) {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: categories[1] || "Tudo",
    condition: "Novo",
    location: "",
    description: "",
    images: [] as string[],
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIDescription = () => {
    if (!formData.title.trim()) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      const title = formData.title.trim();
      const condition = formData.condition;
      const price = formData.price;
      
      const titleParts = title.split(' ');
      const possibleBrand = titleParts.length > 1 ? titleParts[0] : 'Não especificada';
      const possibleModel = titleParts.length > 1 ? titleParts.slice(1).join(' ') : title;
      
      const factualDescription = `📋 FICHA TÉCNICA
• Produto: ${title}
• Marca provável: ${possibleBrand}
• Modelo: ${possibleModel}
• Condição: ${condition}
• Categoria: ${formData.category}

📌 SOBRE ESTE ITEM
Este é um anúncio verificado da categoria ${formData.category}. As características físicas, cor e estado de conservação exatos são os mesmos apresentados nas fotos originais anexadas a este anúncio.

- Preço de venda: ${price ? 'R$ ' + price : 'Não especificado'}
- Local de retirada/envio: ${formData.location || 'Conforme o perfil do vendedor'}
- Observação: Nenhuma modificação ou adjetivo fictício foi adicionado. O produto é vendido conforme os dados acima e as imagens anexadas.

⚠️ Adicione acima detalhes específicos (ex: voltagem, cor, tamanho) caso as fotos não deixem claro.`;
      
      setFormData(prev => ({ ...prev, description: factualDescription }));
      setIsGenerating(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.location) return;

    const newProduct = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      price:
        parseFloat(formData.price.replace(/[^\d.,]/g, "").replace(",", ".")) ||
        0,
      currency: "BRL",
      images: formData.images.length > 0 ? formData.images : [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      ],
      category: formData.category,
      condition: formData.condition,
      seller: {
        id: userId,
        name: userProfile?.name || "Você",
        rating: 5.0,
        reviewsCount: 0,
        avatar: userProfile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        isVerified: true,
        joinedAt: new Date().toISOString().split("T")[0],
      },
      status: "available",
      createdAt: new Date().toISOString(),
      authenticityVerified: false,
      acceptsTrades: false,
      shipping: {
        type: "both",
        estimatedDays: 3,
      },
      description: formData.description,
    };
    onAdd(newProduct);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      const promises = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file as Blob);
        });
      });

      Promise.all(promises).then(base64Images => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...base64Images].slice(0, 6)
        }));
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-[100] p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="ShopConnect" className="h-8 w-auto object-contain" />
            <h2 className="text-xl font-bold text-slate-900">Inserir Anúncio</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Título do anúncio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: PlayStation 5"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 2500"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900"
                >
                  {categories
                    .filter((c) => c !== "Tudo")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Localização (CEP ou Bairro) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: São Paulo, SP"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Fotos do produto
                  </label>
                  <span className="text-xs text-slate-500">{formData.images.length}/6</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-lg relative overflow-hidden border border-slate-200 group">
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {formData.images.length < 6 && (
                    <div className="aspect-square border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex flex-col items-center justify-center relative hover:bg-slate-100 transition-colors cursor-pointer">
                      <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-[10px] text-slate-500 font-medium">Adicionar</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Condição
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, condition: "Novo" })
                    }
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${formData.condition === "Novo" ? "bg-indigo-50 border-indigo-600 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Novo
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, condition: "Usado" })
                    }
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${formData.condition === "Usado" ? "bg-indigo-50 border-indigo-600 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Usado
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">
                Descrição
              </label>
              <button
                type="button"
                onClick={generateAIDescription}
                disabled={!formData.title.trim() || isGenerating}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                  !formData.title.trim() || isGenerating
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-sm hover:shadow-md'
                }`}
              >
                {isGenerating ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando...</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5" /> Gerar com IA</>
                )}
              </button>
            </div>
            <textarea
              rows={5}
              placeholder="Descreva seu produto em detalhes ou use o botão 'Gerar com IA' acima..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900 placeholder-slate-400 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" /> Publicar Anúncio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  subtitle?: string;
  action?: string;
}

function MetricCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  action,
}: MetricCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className="p-2 bg-indigo-50 rounded-lg">{icon}</div>
      </div>
      <div className="flex items-baseline space-x-2">
        <h2 className="text-3xl font-bold text-slate-900">{value}</h2>
        {trend && (
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
            {trend}
          </span>
        )}
      </div>
      {(subtitle || action) && (
        <div className="mt-auto pt-4 flex justify-between items-center text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {action && (
            <button className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
              {action} &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ActionItem({
  title,
  desc,
  type,
}: {
  title: string;
  desc: string;
  type: "urgent" | "warning" | "info";
}) {
  const colors = {
    urgent: "border-l-red-500 bg-red-50",
    warning: "border-l-amber-500 bg-amber-50",
    info: "border-l-indigo-500 bg-indigo-50",
  };

  return (
    <div
      className={`border border-slate-200 border-l-4 rounded-lg p-4 flex items-start ${colors[type]}`}
    >
      <AlertCircle className="w-5 h-5 text-slate-400 mr-3 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>
      </div>
    </div>
  );
}

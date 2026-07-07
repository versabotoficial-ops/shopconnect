import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { LOGO_URL } from '../lib/logo';
import { supabase } from '../lib/supabase';

export function LoginView({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'adminshopconnect@support.com' && password === '#Senhasecreta2e') {
      onLogin();
    } else {
      setError('E-mail ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen w-full flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Coluna esquerda — painel de destaque (visível apenas em telas grandes) */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)',
        }}
      >
        {/* Círculos decorativos */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-60px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-12 space-y-8">
          <img src={LOGO_URL} alt="ShopConnect" style={{ height: '140px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 8px 32px rgba(99,102,241,0.6))' }} />
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              ShopConnect
            </h1>
            <p className="mt-3 text-indigo-200 text-lg font-medium">
              A plataforma para comprar e vender<br />com segurança e facilidade
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-6 w-full max-w-sm">
            {[
              { icon: '🛡️', label: 'Compra Segura' },
              { icon: '🚀', label: 'Entrega Rápida' },
              { icon: '⭐', label: 'Avaliados' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '16px 8px',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
                <span className="text-white text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coluna direita — formulário de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md space-y-8">

          {/* Logo visível apenas no mobile */}
          <div className="flex flex-col items-center lg:hidden">
            <img
              src={LOGO_URL}
              alt="ShopConnect"
              style={{ height: '100px', width: 'auto', objectFit: 'contain', marginBottom: '8px' }}
            />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Acesse a sua conta</h2>
            <p className="mt-2 text-sm text-slate-500">
              Compre e venda com facilidade na maior plataforma
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
                E-mail ou Usuário
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition-all"
                placeholder="Ex: seu@email.com"
                style={{ fontSize: '15px' }}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm pr-12 transition-all"
                placeholder="Digite sua senha"
                style={{ fontSize: '15px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Esqueceu sua senha?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 text-sm font-semibold rounded-xl text-white transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                boxShadow: '0 4px 20px rgba(79,70,229,0.4)',
              }}
            >
              Entrar
            </button>
          </form>

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-400">Ou entre com</span>
            </div>
          </div>

          {/* Botão Google */}
          <button
            onClick={async (e) => {
              e.preventDefault();
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin },
              });
              if (error) setError('Erro ao conectar com Google: ' + error.message);
            }}
            className="w-full flex items-center justify-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
            style={{ gap: '10px' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Conectar com Google
          </button>

          <p className="text-center text-sm text-slate-500">
            Não tem uma conta?{' '}
            <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

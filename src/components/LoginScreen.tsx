'use client';

import { useState } from 'react';
import { Coffee, User, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PasswordInput from './PasswordInput';

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!name.trim() || !password.trim()) {
      setError('Por favor, preencha nome e senha');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await login(name.trim(), password);
      if (success) {
        // O AuthContext já gerencia o usuário logado
        // O componente pai irá detectar a mudança e redirecionar
      } else {
        setError('Nome ou senha incorretos');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Erro no login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Coffee className="h-12 w-12 sm:h-16 sm:w-16 text-amber-600 mx-auto mb-3 sm:mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Buteco São Benedito</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Faça login para continuar</p>
        </div>

        {/* Login Form */}
        <div className="space-y-3 sm:space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite seu nome"
                disabled={loading}
                className="pl-8 sm:pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 text-sm sm:text-base"
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <PasswordInput
              value={password}
              onChange={setPassword}
              label="Senha"
              placeholder="Digite sua senha"
              disabled={loading}
              className="focus:ring-amber-500"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading || !name.trim() || !password.trim()}
            className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{loading ? 'Entrando...' : 'Entrar'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Sistema de Gestão do Buteco São Benedito
          </p>
        </div>
      </div>
    </div>
  );
}
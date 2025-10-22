'use client';

import { useState } from 'react';
import db from '@/lib/database';
import { Coffee, Shield, User, Lock, AlertCircle } from 'lucide-react';
import PasswordInput from './PasswordInput';

interface FirstSetupProps {
  onSetupComplete: () => void;
}

export default function FirstSetup({ onSetupComplete }: FirstSetupProps) {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!formData.password) {
      setError('Senha é obrigatória');
      return;
    }

    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await db.createFirstAdmin({
        name: formData.name.trim(),
        password: formData.password
      });

      onSetupComplete();
    } catch (error: any) {
      setError(error.message || 'Erro ao criar administrador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-purple-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-10 w-10 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Configuração Inicial
          </h1>
          <p className="text-gray-600">
            Crie o primeiro administrador do sistema
          </p>
        </div>

        {/* Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                Primeira Configuração
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Esta conta terá acesso total ao sistema. Escolha uma senha segura.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Administrador
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Admin, João Silva, etc."
                disabled={loading}
              />
            </div>
          </div>

          {/* Senha */}
          <PasswordInput
            value={formData.password}
            onChange={(value) => setFormData({ ...formData, password: value })}
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            disabled={loading}
            className="focus:ring-purple-500"
            required
          />

          {/* Confirmar Senha */}
          <PasswordInput
            value={formData.confirmPassword}
            onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
            label="Confirmar Senha"
            placeholder="Digite a senha novamente"
            disabled={loading}
            className="focus:ring-purple-500"
            required
          />

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Shield className="h-5 w-5" />
            <span>{loading ? 'Criando...' : 'Criar Administrador'}</span>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Coffee className="h-4 w-4" />
            <span className="text-sm">Buteco São Benedito</span>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { 
  Trash2, 
  Download, 
  Upload, 
  AlertTriangle, 
  Coffee,
  Database,
  Smartphone,
  Wifi,
  WifiOff,
  Info
} from 'lucide-react';

export default function SettingsView() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Monitor online/offline status
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
  }

  const handleClearAllData = async () => {
    try {
      // Clear all IndexedDB data
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const deleteDB = indexedDB.deleteDatabase('RestaurantDB');
        deleteDB.onsuccess = () => {
          alert('Todos os dados foram limpos com sucesso!');
          window.location.reload();
        };
        deleteDB.onerror = () => {
          alert('Erro ao limpar os dados.');
        };
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Erro ao limpar os dados.');
    }
    setShowClearConfirm(false);
  };

  const handleExportData = async () => {
    try {
      // This would export all data as JSON
      alert('Funcionalidade de exportação será implementada em breve!');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleImportData = async () => {
    try {
      // This would import data from JSON file
      alert('Funcionalidade de importação será implementada em breve!');
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <h2 className="text-2xl font-bold text-amber-800 mb-6">Configurações</h2>

      <div className="space-y-6">
        {/* System Status */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Status do Sistema
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-600" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">Conexão</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isOnline 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Armazenamento Local</span>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Ativo
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Coffee className="h-5 w-5 text-amber-600" />
                <span className="font-medium">Versão do Sistema</span>
              </div>
              <span className="text-gray-600 text-sm">v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerenciamento de Dados
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Exportar Todos os Dados
            </button>

            <button
              onClick={handleImportData}
              className="w-full flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Importar Dados
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Limpar Todos os Dados
            </button>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Sobre o Sistema
          </h3>
          
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Buteco São Benedito - Sistema de Pedidos</strong>
            </p>
            <p>
              Sistema completo de gerenciamento de restaurante desenvolvido para funcionar 
              offline em dispositivos móveis.
            </p>
            <p>
              <strong>Recursos:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Funcionamento offline (sem internet)</li>
              <li>Armazenamento local seguro</li>
              <li>Interface otimizada para celular</li>
              <li>Exportação de relatórios em .txt</li>
              <li>Gerenciamento completo de mesas e pedidos</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              Desenvolvido com Next.js 14+ e IndexedDB
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Como usar o sistema</h4>
              <div className="text-sm text-amber-700 mt-2 space-y-1">
                <p>1. <strong>Mesas:</strong> Cadastre as mesas do seu estabelecimento</p>
                <p>2. <strong>Cardápio:</strong> Adicione os itens do cardápio com preços</p>
                <p>3. <strong>Pedidos:</strong> Registre pedidos para as mesas</p>
                <p>4. <strong>Relatórios:</strong> Acompanhe vendas e exporte resumos diários</p>
              </div>
            </div>
          </div>
        </div>

        {/* Offline Notice */}
        {!isOnline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <WifiOff className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Modo Offline</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Você está trabalhando offline. Todos os dados estão sendo salvos localmente 
                  e estarão disponíveis quando voltar a ter conexão.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 m-4 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-800">Confirmar Exclusão</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Esta ação irá <strong>excluir permanentemente</strong> todos os dados do sistema, incluindo:
            </p>
            
            <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
              <li>Todas as mesas cadastradas</li>
              <li>Todo o cardápio</li>
              <li>Todos os pedidos</li>
              <li>Histórico de relatórios</li>
            </ul>
            
            <p className="text-red-600 font-medium text-sm mb-6">
              ⚠️ Esta ação não pode ser desfeita!
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleClearAllData}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sim, Excluir Tudo
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
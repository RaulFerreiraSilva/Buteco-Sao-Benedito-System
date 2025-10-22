'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Eye, X, Check, Clock, CheckCircle, Coffee, Utensils, Wine, UtensilsCrossed, Cake, MoreHorizontal } from 'lucide-react';
import db, { MenuItem } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import MenuView from './MenuView';

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'Bebidas':
      return <Wine className="h-4 w-4 text-blue-600 flex-shrink-0" />;
    case 'Petiscos':
      return <Coffee className="h-4 w-4 text-amber-600 flex-shrink-0" />;
    case 'Pratos Principais':
      return <UtensilsCrossed className="h-4 w-4 text-green-600 flex-shrink-0" />;
    case 'Sobremesas':
      return <Cake className="h-4 w-4 text-pink-600 flex-shrink-0" />;
    case 'Outros':
      return <MoreHorizontal className="h-4 w-4 text-gray-600 flex-shrink-0" />;
    default:
      return <Utensils className="h-4 w-4 text-amber-600 flex-shrink-0" />;
  }
};

interface TableData {
  id: string;
  name: string;
  status: 'open' | 'closed';
  createdAt: Date;
}

const TablesManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [tables, setTables] = useState<TableData[]>([]);
  const [newTableName, setNewTableName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const tablesData = await db.getTables();
      setTables(tablesData);
    } catch (error: any) {
      setError('Erro ao carregar mesas: ' + error.message);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleAddTable = async () => {
    if (!newTableName.trim()) {
      setError('Nome da mesa é obrigatório');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      await db.addTable(newTableName.trim());
      setSuccess('Mesa criada com sucesso!');
      setNewTableName('');
      loadTables();
    } catch (error: any) {
      setError(error.message || 'Erro ao criar mesa');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTable = async (tableId: string) => {
    if (!confirm('Tem certeza que deseja fechar esta mesa?')) {
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      await db.closeTable(tableId);
      setSuccess('Mesa fechada com sucesso!');
      loadTables();
    } catch (error: any) {
      setError(error.message || 'Erro ao fechar mesa');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    // Apenas admin e caixa podem excluir mesas
    if (!currentUser || !['admin', 'caixa'].includes(currentUser.role)) {
      setError('Apenas administradores e caixas podem excluir mesas');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir esta mesa? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      await db.deleteTable(tableId);
      setSuccess('Mesa excluída com sucesso!');
      loadTables();
    } catch (error: any) {
      setError(error.message || 'Erro ao excluir mesa');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 sm:p-6 bg-white min-h-full">
        <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Gerenciar Mesas</h2>
        
        {/* Mensagens */}
        {error && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm sm:text-base">
            {success}
          </div>
        )}

        {/* Adicionar nova mesa */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Adicionar Nova Mesa</h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Nome da mesa (ex: Mesa 1, Mesa VIP, etc.)"
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTable()}
            />
            <button
              onClick={handleAddTable}
              disabled={loading || !newTableName.trim()}
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus size={16} className="sm:w-5 sm:h-5" />
              <span className="inline">Adicionar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {tables.map((table) => (
          <div 
            key={table.id} 
            className={`border rounded-lg p-3 sm:p-4 transition-all ${
              table.status === 'open' 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{table.name}</h3>
              <span 
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  table.status === 'open' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {table.status === 'open' ? 'Aberta' : 'Fechada'}
              </span>
            </div>
            
            <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Criada em: {table.createdAt ? new Date(table.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Botão para entrar na mesa (ver pedidos) */}
              <button
                onClick={() => setSelectedTable(table.id)}
                className="flex-1 px-2 sm:px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Eye size={14} className="sm:w-4 sm:h-4" />
                Entrar
              </button>

              {/* Botão para fechar mesa */}
              {table.status === 'open' && (
                <button
                  onClick={() => handleCloseTable(table.id)}
                  disabled={loading}
                  className="px-2 sm:px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center"
                >
                  <Check size={14} className="sm:w-4 sm:h-4" />
                </button>
              )}

              {/* Botão para excluir mesa (apenas admin e caixa) */}
              {['admin', 'caixa'].includes(currentUser.role) && table.status === 'closed' && (
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  disabled={loading}
                  className="px-2 sm:px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                >
                  <X size={14} className="sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Nenhuma mesa criada ainda</div>
          <div className="text-gray-400 text-sm mt-2">
            Use o formulário acima para adicionar a primeira mesa
          </div>
        </div>
      )}

      {/* Modal ou área para gerenciar pedidos da mesa selecionada */}
      {selectedTable && (
        <TableOrdersModal 
          tableId={selectedTable} 
          onClose={() => setSelectedTable(null)} 
        />
      )}
      </div>
    </div>
  );
};

// Componente para gerenciar pedidos de uma mesa específica
interface TableOrdersModalProps {
  tableId: string;
  onClose: () => void;
}

const TableOrdersModal: React.FC<TableOrdersModalProps> = ({ tableId, onClose }) => {
  const { user: currentUser } = useAuth();
  const [table, setTable] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadTableData();
  }, [tableId]);

  const loadTableData = async () => {
    try {
      const [tableData, ordersData] = await Promise.all([
        db.getTable(tableId),
        db.getOrdersForTable(tableId)
      ]);
      setTable(tableData);
      
      // Ordenar por data de criação (mais recentes primeiro) como fallback
      const sortedOrders = ordersData.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Descrescente (mais recentes primeiro)
      });
      
      setOrders(sortedOrders);
    } catch (error: any) {
      setError('Erro ao carregar dados da mesa: ' + error.message);
    }
  };

  const handleMenuItemSelect = async (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
  };

  const confirmAddItem = async () => {
    if (!selectedItem) return;

    setLoading(true);
    setError('');

    try {
      await db.addOrderToTable(tableId, {
        item: selectedItem.name,
        price: selectedItem.price,
        quantity: quantity,
        total: selectedItem.price * quantity,
        addedBy: currentUser?.name || 'Usuário',
        menuItemId: selectedItem.id,
        description: selectedItem.description,
        category: selectedItem.category
      });

      setSelectedItem(null);
      setQuantity(1);
      loadTableData();
    } catch (error: any) {
      setError(error.message || 'Erro ao adicionar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await db.updateOrderStatus(tableId, orderId, status);
      loadTableData();
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar status do pedido');
    }
  };

  const totalTable = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-lg sm:rounded-lg w-full h-[90vh] sm:h-auto sm:w-full sm:max-w-4xl sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b flex-shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
            {table?.name || 'Mesa'} - Pedidos
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg flex-shrink-0"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">

        {error && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Resumo da mesa */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <div className="text-xs sm:text-sm text-blue-600 font-medium">Total da Conta</div>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-blue-800">
              R$ {totalTable.toFixed(2)}
            </div>
          </div>
          <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              <div className="text-xs sm:text-sm text-yellow-600 font-medium">Pedidos Pendentes</div>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-yellow-800">
              {pendingOrders}
            </div>
          </div>
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <div className="text-xs sm:text-sm text-green-600 font-medium">Total de Itens</div>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-green-800">
              {orders.length}
            </div>
          </div>
        </div>

        {/* Seletor de cardápio */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Adicionar do Cardápio</h3>
            <div className="max-h-96 sm:max-h-[400px] overflow-y-auto">
              <MenuView 
                onItemSelect={handleMenuItemSelect}
                selectionMode={true}
                showAdminControls={false}
              />
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-base sm:text-lg font-semibold">Pedidos da Mesa</h3>
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-3 sm:p-4 bg-white">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getCategoryIcon(order.category)}
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{order.item}</h4>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Quantidade: {order.quantity} × R$ {order.price?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    Total: R$ {(order.total || 0).toFixed(2)}
                  </div>
                  {order.addedBy && (
                    <div className="text-xs text-gray-400">
                      Adicionado por: {order.addedBy}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 justify-between sm:justify-end">
                  <div className="flex items-center gap-1">
                    {order.status === 'pending' ? (
                      <Clock className="h-3 w-3 text-yellow-600" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    )}
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {order.status === 'pending' ? 'Pendente' : 'Entregue'}
                    </span>
                  </div>
                  {order.status === 'pending' && ['garcom', 'admin', 'caixa'].includes(currentUser?.role || '') && (
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                      className="px-2 sm:px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      <span className="hidden sm:inline">Marcar como Entregue</span>
                      <span className="sm:hidden">Entregue</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
              Nenhum pedido feito ainda nesta mesa
            </div>
          )}
        </div>

        {/* Modal de confirmação de quantidade */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Coffee className="h-5 w-5 text-amber-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  Adicionar Item à Mesa
                </h3>
              </div>
              
              <div className="mb-3 sm:mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="h-4 w-4 text-gray-600" />
                  <h4 className="font-medium text-gray-800 text-sm sm:text-base">{selectedItem.name}</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 ml-6">{selectedItem.description}</p>
                <p className="text-base sm:text-lg font-bold text-green-600 ml-6">
                  R$ {selectedItem.price.toFixed(2)}
                </p>
              </div>

              <div className="mb-3 sm:mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <label className="block text-sm font-medium text-gray-700">
                    Quantidade
                  </label>
                </div>
                <div className="flex items-center gap-3 justify-center">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xl sm:text-lg font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-20 sm:w-20 text-center py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg sm:text-base"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xl sm:text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Subtotal:</span>
                  </div>
                  <span className="font-semibold text-green-800 text-base">
                    R$ {(selectedItem.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 px-3 sm:px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
                <button
                  onClick={confirmAddItem}
                  disabled={loading}
                  className="flex-1 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {loading ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TablesManagement;
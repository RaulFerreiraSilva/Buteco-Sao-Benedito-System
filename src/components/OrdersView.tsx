'use client';

import { useState, useEffect } from 'react';
import { Plus, Clock, Check, X, CreditCard } from 'lucide-react';
import { db, Order, Table, MenuItem } from '@/lib/database';
import { formatCurrency, formatDate } from '@/lib/utils';

const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-700', icon: Clock },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-700', icon: Check },
  delivered: { label: 'Entregue', color: 'bg-purple-100 text-purple-700', icon: Check },
  paid: { label: 'Pago', color: 'bg-gray-100 text-gray-700', icon: CreditCard },
};

export default function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<Order['status'] | ''>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersList, tablesList, menuList] = await Promise.all([
        db.getOrders(),
        db.getTables(),
        db.getMenuItems(),
      ]);
      
      setOrders(ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setTables(tablesList);
      setMenuItems(menuList.filter(item => item.available));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    if (!selectedTable || Object.keys(selectedItems).length === 0) return;

    try {
      const orderItems = Object.entries(selectedItems).map(([itemId, quantity]) => {
        const menuItem = menuItems.find(item => item.id === itemId);
        if (!menuItem) throw new Error('Item not found');
        
        return {
          id: crypto.randomUUID(),
          menuItemId: itemId,
          quantity,
          price: menuItem.price,
        };
      });

      const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      await db.addOrder({
        tableId: selectedTable,
        items: orderItems,
        total,
        status: 'pending',
      });

      // Mark table as occupied
      await db.updateTable(selectedTable, { isOccupied: true });

      setSelectedTable('');
      setSelectedItems({});
      setShowNewOrderForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await db.updateOrder(orderId, { status });
      
      // If order is paid, free the table
      if (status === 'paid') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          await db.updateTable(order.tableId, { isOccupied: false });
        }
      }
      
      loadData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      const newItems = { ...selectedItems };
      delete newItems[itemId];
      setSelectedItems(newItems);
    } else {
      setSelectedItems({ ...selectedItems, [itemId]: quantity });
    }
  };

  const getTableName = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    return table ? `Mesa ${table.number} - ${table.name}` : 'Mesa não encontrada';
  };

  const getMenuItemName = (itemId: string) => {
    const item = menuItems.find(m => m.id === itemId);
    return item ? item.name : 'Item não encontrado';
  };

  const filteredOrders = filterStatus 
    ? orders.filter(order => order.status === filterStatus)
    : orders;

  const calculateOrderTotal = () => {
    return Object.entries(selectedItems).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(m => m.id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-amber-800">Pedidos</h2>
        <button
          onClick={() => setShowNewOrderForm(true)}
          className="bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            filterStatus === ''
              ? 'bg-amber-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos
        </button>
        {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as Order['status'])}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              filterStatus === status
                ? 'bg-amber-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* New Order Modal */}
      {showNewOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 m-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Novo Pedido</h3>
            
            {/* Table Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Mesa</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              >
                <option value="">Selecione uma mesa</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Mesa {table.number} - {table.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Menu Items */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Itens</label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
                {menuItems.map((item) => (
                  <div key={item.id} className="p-3 border-b last:border-b-0 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-amber-600 font-bold">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.id, (selectedItems[item.id] || 0) - 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{selectedItems[item.id] || 0}</span>
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.id, (selectedItems[item.id] || 0) + 1)}
                        className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center hover:bg-amber-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            {Object.keys(selectedItems).length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Resumo do Pedido:</h4>
                {Object.entries(selectedItems).map(([itemId, quantity]) => {
                  const item = menuItems.find(m => m.id === itemId);
                  if (!item) return null;
                  return (
                    <div key={itemId} className="flex justify-between text-sm">
                      <span>{quantity}x {item.name}</span>
                      <span>{formatCurrency(item.price * quantity)}</span>
                    </div>
                  );
                })}
                <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateOrderTotal())}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={createOrder}
                disabled={!selectedTable || Object.keys(selectedItems).length === 0}
                className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Criar Pedido
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewOrderForm(false);
                  setSelectedTable('');
                  setSelectedItems({});
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const statusConfig = ORDER_STATUS_CONFIG[order.status];
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-lg">{getTableName(order.tableId)}</h3>
                    <p className="text-gray-500 text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      <StatusIcon className="h-3 w-3 inline mr-1" />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm py-1">
                      <span>{item.quantity}x {getMenuItemName(item.menuItemId)}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-amber-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex gap-2 overflow-x-auto">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Preparar
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                      Pronto
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors whitespace-nowrap"
                    >
                      Entregar
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'paid')}
                      className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors whitespace-nowrap"
                    >
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {filterStatus 
                ? `Nenhum pedido com status "${ORDER_STATUS_CONFIG[filterStatus].label}"`
                : 'Nenhum pedido encontrado'
              }
            </p>
            <button
              onClick={() => setShowNewOrderForm(true)}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Criar primeiro pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
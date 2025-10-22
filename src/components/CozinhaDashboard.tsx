'use client';

import { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  LogOut,
  Timer,
  AlertCircle,
  Package
} from 'lucide-react';
import { Order, OrderItem, MenuItem } from '@/lib/database';
import db from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

interface OrderWithDetails extends Order {
  itemsWithDetails: Array<OrderItem & { menuItem: MenuItem }>;
}

export default function CozinhaDashboard() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadOrders();
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const allOrders = await db.getOrders();
      const menuItems = await db.getMenuItems();
      
      // Filtrar apenas pedidos que estão em preparo ou pendentes
      const kitchenOrders = allOrders
        .filter(order => ['pending', 'preparing'].includes(order.status))
        .map(order => ({
          ...order,
          itemsWithDetails: order.items.map(item => ({
            ...item,
            menuItem: menuItems.find(menu => menu.id === item.menuItemId)!
          }))
        }))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      setOrders(kitchenOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await db.updateOrder(orderId, { status });
      await loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const startPreparing = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing');
  };

  const markAsReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
  };

  const getOrderPriority = (order: Order) => {
    const now = new Date();
    const orderTime = new Date(order.createdAt);
    const minutesWaiting = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (minutesWaiting > 20) return 'high';
    if (minutesWaiting > 10) return 'medium';
    return 'normal';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 text-orange-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-orange-800">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      {/* Header */}
      <header className="bg-orange-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Cozinha - {user?.name}</h1>
              <p className="text-orange-100 text-sm">Preparação e Controle</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-orange-700 hover:bg-orange-800 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b border-orange-200 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-yellow-50 p-3 rounded-lg">
            <Timer className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
            <div className="text-sm text-yellow-600 font-medium">Pendentes</div>
            <div className="text-xl font-bold text-yellow-800">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <Package className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <div className="text-sm text-blue-600 font-medium">Preparando</div>
            <div className="text-xl font-bold text-blue-800">
              {orders.filter(o => o.status === 'preparing').length}
            </div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <AlertCircle className="h-6 w-6 text-orange-600 mx-auto mb-1" />
            <div className="text-sm text-orange-600 font-medium">Total</div>
            <div className="text-xl font-bold text-orange-800">{orders.length}</div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <main className="flex-1 overflow-auto p-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-orange-600 mb-2">Nenhum pedido pendente</h3>
            <p className="text-orange-500">Quando houver novos pedidos, eles aparecerão aqui.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const priority = getOrderPriority(order);
              return (
                <div
                  key={order.id}
                  className={`border-2 rounded-lg p-4 ${getPriorityColor(priority)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Mesa {order.tableId}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {formatTime(order.createdAt)}
                      </div>
                      {priority === 'high' && (
                        <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                          <AlertCircle className="h-4 w-4" />
                          Urgente
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => startPreparing(order.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Iniciar
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => markAsReady(order.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Pronto
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.itemsWithDetails.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-white/70 p-2 rounded">
                        <div>
                          <span className="font-medium">{item.quantity}x {item.menuItem?.name}</span>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-1">Obs: {item.notes}</p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-300 flex justify-between items-center">
                    <span className="font-bold">Total: R$ {order.total.toFixed(2)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status === 'pending' ? 'Pendente' : 'Preparando'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
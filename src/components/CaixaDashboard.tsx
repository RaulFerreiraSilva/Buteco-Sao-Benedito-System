'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  LogOut,
  DollarSign,
  Clock,
  TrendingUp,
  Calendar
} from 'lucide-react';
import TablesView from '@/components/TablesView';
import MenuView from '@/components/MenuView';
import OrdersView from '@/components/OrdersView';
import ReportsView from '@/components/ReportsView';
import SettingsView from '@/components/SettingsView';
import { useAuth } from '@/contexts/AuthContext';
import db, { DailySummary } from '@/lib/database';
import { formatCurrency, getCurrentDateString } from '@/lib/utils';

type CaixaView = 'tables' | 'menu' | 'orders' | 'reports' | 'settings';

interface RealTimeStats {
  tablesCreated: number;
  totalOrders: number;
  totalRevenue: number;
  openTables: number;
}

export default function CaixaDashboard() {
  const [currentView, setCurrentView] = useState<CaixaView>('tables');
  const [dailyStats, setDailyStats] = useState<DailySummary | null>(null);
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats | null>(null);
  const { user, logout } = useAuth();

  const navigation = [
    { id: 'tables', label: 'Mesas', icon: Users, color: 'bg-blue-500' },
    { id: 'menu', label: 'Cardápio', icon: ShoppingCart, color: 'bg-green-500' },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart, color: 'bg-orange-500' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, color: 'bg-purple-500' },
    { id: 'settings', label: 'Config', icon: Settings, color: 'bg-gray-500' },
  ] as const;

  useEffect(() => {
    loadDailyStats();
    loadRealTimeStats();
    // Atualizar estatísticas a cada 30 segundos
    const interval = setInterval(() => {
      loadDailyStats();
      loadRealTimeStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDailyStats = async () => {
    try {
      const stats = await db.getDailySummary(getCurrentDateString());
      setDailyStats(stats);
    } catch (error) {
      console.error('Error loading daily stats:', error);
    }
  };

  const loadRealTimeStats = async () => {
    try {
      const stats = await db.getRealTimeStats(getCurrentDateString());
      setRealTimeStats(stats);
    } catch (error) {
      console.error('Error loading real-time stats:', error);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'tables':
        return <TablesView />;
      case 'menu':
        return <MenuView />;
      case 'orders':
        return <OrdersView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TablesView />;
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Caixa - {user?.name}</h1>
              <p className="text-green-100 text-sm">Controle Total do Sistema</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      {realTimeStats && (
        <div className="bg-white border-b border-green-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Mesas Abertas</p>
                <p className="text-lg font-bold text-blue-600">{realTimeStats.openTables}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
              <div className="p-2 bg-green-500 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Mesas Criadas</p>
                <p className="text-lg font-bold text-green-600">{realTimeStats.tablesCreated}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-orange-50 p-3 rounded-lg">
              <div className="p-2 bg-orange-500 rounded-lg">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Pedidos Hoje</p>
                <p className="text-lg font-bold text-orange-600">{realTimeStats.totalOrders}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg">
              <div className="p-2 bg-purple-500 rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Faturamento</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(realTimeStats.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-green-200 p-2">
        <div className="flex justify-around">
          {navigation.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                currentView === id
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className={`p-1 rounded ${currentView === id ? color : 'bg-gray-200'}`}>
                <Icon className={`h-5 w-5 ${currentView === id ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <span className="text-xs font-medium mt-1">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
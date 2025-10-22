'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { 
  Coffee, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Menu as MenuIcon,
  Settings,
  Download
} from 'lucide-react';
import TablesView from '@/components/TablesView';
import MenuView from '@/components/MenuView';
import OrdersView from '@/components/OrdersView';
import ReportsView from '@/components/ReportsView';
import SettingsView from '@/components/SettingsView';

type View = 'tables' | 'menu' | 'orders' | 'reports' | 'settings';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('tables');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await db.init();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Coffee className="h-12 w-12 text-amber-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-amber-800">Carregando Buteco São Benedito...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { id: 'tables', label: 'Mesas', icon: Users },
    { id: 'menu', label: 'Cardápio', icon: MenuIcon },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Config', icon: Settings },
  ] as const;

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
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-amber-600 text-white p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Coffee className="h-8 w-8" />
          <div>
            <h1 className="text-xl font-bold">Buteco São Benedito</h1>
            <p className="text-amber-100 text-sm">Sistema de Pedidos</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-amber-200 p-2">
        <div className="flex justify-around">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                currentView === id
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

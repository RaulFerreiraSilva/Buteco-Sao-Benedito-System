'use client';

import { useState } from 'react';
import { 
  Users, 
  ShoppingCart, 
  LogOut,
  UserCheck,
  ClipboardList,
  PlusCircle
} from 'lucide-react';
import TablesView from '@/components/TablesView';
import OrdersView from '@/components/OrdersView';
import { useAuth } from '@/contexts/AuthContext';

type GarcomView = 'tables' | 'orders';

export default function GarcomDashboard() {
  const [currentView, setCurrentView] = useState<GarcomView>('tables');
  const { user, logout } = useAuth();

  const navigation = [
    { id: 'tables', label: 'Mesas', icon: Users, color: 'bg-blue-500' },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart, color: 'bg-orange-500' },
  ] as const;

  const renderView = () => {
    switch (currentView) {
      case 'tables':
        return <TablesView />;
      case 'orders':
        return <OrdersView />;
      default:
        return <TablesView />;
    }
  };

  return (
    <div className="h-screen bg-blue-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-blue-600 text-white p-3 sm:p-4 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Garçom - {user?.name}</h1>
              <p className="text-blue-100 text-xs sm:text-sm">Atendimento e Pedidos</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1 sm:gap-2 bg-blue-700 hover:bg-blue-800 px-2 sm:px-4 py-2 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs sm:text-sm hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-blue-200 p-1 sm:p-2 flex-shrink-0">
        <div className="flex justify-around">
          {navigation.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`flex flex-col items-center p-2 sm:p-3 rounded-lg transition-colors min-w-0 ${
                currentView === id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className={`p-1 sm:p-2 rounded ${currentView === id ? color : 'bg-gray-200'}`}>
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${currentView === id ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <span className="text-xs sm:text-sm font-medium mt-1 truncate">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
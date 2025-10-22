'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserManagement from './UserManagement';
import CaixaDashboard from './CaixaDashboard';
import GarcomDashboard from './GarcomDashboard';
import CozinhaDashboard from './CozinhaDashboard';
import ReportsView from './ReportsView';
import { 
  Shield, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Coffee,
  Calculator,
  Utensils,
  Menu,
  X
} from 'lucide-react';

type AdminView = 'users' | 'caixa' | 'garcom' | 'cozinha' | 'reports' | 'settings';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<AdminView>('users');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: 'users' as AdminView,
      label: 'Gestão de Usuários',
      icon: Users,
      description: 'Criar e gerenciar usuários do sistema'
    },
    {
      id: 'caixa' as AdminView,
      label: 'Sistema Caixa',
      icon: Calculator,
      description: 'Acessar funcionalidades do caixa'
    },
    {
      id: 'garcom' as AdminView,
      label: 'Sistema Garçom',
      icon: Coffee,
      description: 'Acessar funcionalidades do garçom'
    },
    {
      id: 'cozinha' as AdminView,
      label: 'Sistema Cozinha',
      icon: Utensils,
      description: 'Acessar funcionalidades da cozinha'
    },
    {
      id: 'reports' as AdminView,
      label: 'Relatórios',
      icon: BarChart3,
      description: 'Visualizar relatórios e estatísticas'
    },
    {
      id: 'settings' as AdminView,
      label: 'Configurações',
      icon: Settings,
      description: 'Configurações do sistema'
    }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return <UserManagement />;
      case 'caixa':
        return (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-green-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <Calculator className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Sistema Caixa</h2>
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Admin Access</span>
              </div>
            </div>
            <CaixaDashboard />
          </div>
        );
      case 'garcom':
        return (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <Coffee className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Sistema Garçom</h2>
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Admin Access</span>
              </div>
            </div>
            <GarcomDashboard />
          </div>
        );
      case 'cozinha':
        return (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-orange-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <Utensils className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Sistema Cozinha</h2>
                <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">Admin Access</span>
              </div>
            </div>
            <CozinhaDashboard />
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-purple-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Relatórios e Estatísticas</h2>
                <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">Admin Access</span>
              </div>
            </div>
            <ReportsView />
          </div>
        );
      case 'settings':
        return (
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="h-6 w-6 text-gray-600" />
              <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
            </div>
            <div className="text-center py-8 text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Módulo de configurações em desenvolvimento</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <Coffee className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">Buteco São Benedito</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Painel Administrativo</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-purple-100 rounded-lg">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <span className="text-xs sm:text-sm font-medium text-purple-800 hidden sm:inline">{user?.name}</span>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-64 bg-white shadow-lg lg:shadow-sm 
          transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          flex flex-col
        `}>
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Seção Administrativa */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <h3 className="text-xs font-semibold text-purple-800 uppercase tracking-wide">
                    Administração
                  </h3>
                </div>
                <div className="space-y-1">
                  {menuItems.filter(item => ['users', 'reports', 'settings'].includes(item.id)).map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveView(item.id);
                          setIsSidebarOpen(false); // Close mobile sidebar
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{item.label}</div>
                            <div className="text-xs text-gray-500 truncate hidden sm:block">{item.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seção Operacional */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Coffee className="h-4 w-4 text-amber-600" />
                  <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                    Sistemas Operacionais
                  </h3>
                </div>
                <div className="space-y-1">
                  {menuItems.filter(item => ['caixa', 'garcom', 'cozinha'].includes(item.id)).map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveView(item.id);
                          setIsSidebarOpen(false); // Close mobile sidebar
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{item.label}</div>
                            <div className="text-xs text-gray-500 truncate hidden sm:block">{item.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
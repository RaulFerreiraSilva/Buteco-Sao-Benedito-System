'use client';

import { useState, useEffect } from 'react';
import db from '@/lib/database';
import { Coffee } from 'lucide-react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginScreen from '@/components/LoginScreen';
import CaixaDashboard from '@/components/CaixaDashboard';
import GarcomDashboard from '@/components/GarcomDashboard';
import CozinhaDashboard from '@/components/CozinhaDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import FirstSetup from '@/components/FirstSetup';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasUsers, setHasUsers] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await db.init();
        const usersExist = await db.hasUsers();
        setHasUsers(usersExist);
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleSetupComplete = async () => {
    // Recarregar status dos usuários após configuração inicial
    const usersExist = await db.hasUsers();
    setHasUsers(usersExist);
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Coffee className="h-12 w-12 text-amber-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-amber-800">Carregando Buteco São Benedito...</p>
        </div>
      </div>
    );
  }

  // Se não há usuários no sistema, mostrar configuração inicial
  if (!hasUsers) {
    return <FirstSetup onSetupComplete={handleSetupComplete} />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Renderizar dashboard baseado no perfil do usuário
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'caixa':
      return <CaixaDashboard />;
    case 'garcom':
      return <GarcomDashboard />;
    case 'cozinha':
      return <CozinhaDashboard />;
    default:
      return <CaixaDashboard />;
  }
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/database';
import db from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import PasswordInput from './PasswordInput';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Shield,
  Coffee,
  Utensils,
  Calculator
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user: currentUser } = useAuth();

  const [newUser, setNewUser] = useState({
    name: '',
    role: 'caixa' as UserRole,
    password: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await db.getUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Erro ao carregar usuários');
    }
  };

  const handleCreateUser = async () => {
    if (!currentUser) return;

    if (!newUser.name.trim() || !newUser.password.trim()) {
      setError('Nome e senha são obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await db.createUserByAdmin({
        name: newUser.name.trim(),
        role: newUser.role,
        password: newUser.password,
        isActive: true
      }, currentUser.id);

      setSuccess('Usuário criado com sucesso!');
      setNewUser({ name: '', role: 'caixa', password: '' });
      setIsCreating(false);
      loadUsers();
    } catch (error: any) {
      setError(error.message || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!currentUser || !editingUser) return;

    setLoading(true);
    setError('');

    try {
      const updateData: any = {
        name: editingUser.name,
        role: editingUser.role,
        isActive: editingUser.isActive
      };

      // Só atualiza a senha se foi informada uma nova senha
      if (editingUser.password && editingUser.password.trim() !== '') {
        updateData.password = editingUser.password;
      }

      await db.updateUserByAdmin(editingUser.id, updateData, currentUser.id);

      setSuccess('Usuário atualizado com sucesso!');
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!currentUser) return;

    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await db.deleteUserByAdmin(userId, currentUser.id);
      setSuccess('Usuário excluído com sucesso!');
      loadUsers();
    } catch (error: any) {
      setError(error.message || 'Erro ao excluir usuário');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5" />;
      case 'caixa':
        return <Calculator className="h-5 w-5" />;
      case 'garcom':
        return <Coffee className="h-5 w-5" />;
      case 'cozinha':
        return <Utensils className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'caixa':
        return 'bg-green-100 text-green-800';
      case 'garcom':
        return 'bg-blue-100 text-blue-800';
      case 'cozinha':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'caixa':
        return 'Caixa';
      case 'garcom':
        return 'Garçom';
      case 'cozinha':
        return 'Cozinha';
      default:
        return role;
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Gestão de Usuários</h2>
        </div>
        
        <button
          onClick={() => {
            setIsCreating(true);
            clearMessages();
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Create User Form */}
      {isCreating && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Criar Novo Usuário</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nome do usuário"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Função
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="caixa">Caixa</option>
                <option value="garcom">Garçom</option>
                <option value="cozinha">Cozinha</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div>
              <PasswordInput
                value={newUser.password}
                onChange={(value) => setNewUser({ ...newUser, password: value })}
                label="Senha"
                placeholder="Senha do usuário"
                disabled={loading}
                className="focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => {
                setIsCreating(false);
                setNewUser({ name: '', role: 'caixa', password: '' });
                clearMessages();
              }}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancelar</span>
            </button>
            
            <button
              onClick={handleCreateUser}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Criando...' : 'Criar'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className={`p-4 border rounded-lg ${
              user.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
            }`}
          >
            {editingUser?.id === user.id ? (
              // Edit Mode
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="caixa">Caixa</option>
                    <option value="garcom">Garçom</option>
                    <option value="cozinha">Cozinha</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <PasswordInput
                    value={editingUser.password}
                    onChange={(value) => setEditingUser({ ...editingUser, password: value })}
                    placeholder="Nova senha (deixe vazio para manter)"
                    disabled={loading}
                    className="focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingUser.isActive}
                      onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    Ativo
                  </label>

                  <button
                    onClick={handleUpdateUser}
                    disabled={loading}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingUser(null);
                      clearMessages();
                    }}
                    className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                  </div>
                  
                  <div>
                    <div className="font-semibold text-gray-800">{user.name}</div>
                    <div className="text-sm text-gray-600">{getRoleLabel(user.role)}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Senha:</span>
                    <span className="text-sm font-mono text-gray-400">
                      ••••••••••
                    </span>
                    <span className="text-xs text-gray-400">(criptografada)</span>
                  </div>

                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Ativo' : 'Inativo'}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingUser({ ...user, password: '' });
                      clearMessages();
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum usuário encontrado</p>
        </div>
      )}
    </div>
  );
}
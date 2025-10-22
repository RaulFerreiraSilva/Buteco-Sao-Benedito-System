'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Coffee } from 'lucide-react';
import { db, MenuItem } from '@/lib/database';
import { formatCurrency } from '@/lib/utils';

const CATEGORIES = [
  'Bebidas',
  'Petiscos',
  'Pratos Principais',
  'Sobremesas',
  'Outros'
];

export default function MenuView() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Bebidas',
    description: '',
    available: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenuItems();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredItems(menuItems.filter(item => item.category === selectedCategory));
    } else {
      setFilteredItems(menuItems);
    }
  }, [menuItems, selectedCategory]);

  const loadMenuItems = async () => {
    try {
      const items = await db.getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;

    try {
      const itemData = {
        name: newItem.name,
        price: parseFloat(newItem.price),
        category: newItem.category,
        description: newItem.description,
        available: newItem.available,
      };

      if (editingItem) {
        await db.updateMenuItem(editingItem.id, itemData);
      } else {
        await db.addMenuItem(itemData);
      }

      resetForm();
      loadMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const resetForm = () => {
    setNewItem({
      name: '',
      price: '',
      category: 'Bebidas',
      description: '',
      available: true,
    });
    setShowAddForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      description: item.description || '',
      available: item.available,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await db.deleteMenuItem(id);
        loadMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  const toggleAvailability = async (id: string, available: boolean) => {
    try {
      await db.updateMenuItem(id, { available: !available });
      loadMenuItems();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
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
        <h2 className="text-2xl font-bold text-amber-800">Cardápio</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            selectedCategory === ''
              ? 'bg-amber-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-amber-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 m-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {editingItem ? 'Editar Item' : 'Adicionar Item'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nome</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Nome do item"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Descrição do item"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newItem.available}
                    onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium">Disponível</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  {editingItem ? 'Atualizar' : 'Adicionar'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Items List */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border ${
                item.available
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-100 border-gray-300 opacity-70'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-lg">{item.name}</h3>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-amber-600 font-bold text-lg">
                    {formatCurrency(item.price)}
                  </p>
                  {item.description && (
                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleAvailability(item.id, item.available)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.available
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={item.available ? 'Marcar como indisponível' : 'Marcar como disponível'}
                  >
                    <Coffee className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Coffee className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {selectedCategory 
                ? `Nenhum item encontrado na categoria "${selectedCategory}"`
                : 'Nenhum item no cardápio'
              }
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Adicionar item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
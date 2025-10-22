'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Coffee, Wine, UtensilsCrossed, Cake, MoreHorizontal } from 'lucide-react';
import { MenuItem } from '@/lib/database';
import db from '@/lib/database';
import { formatCurrency } from '@/lib/utils';

const CATEGORIES = [
  'Bebidas',
  'Petiscos',
  'Pratos Principais',
  'Sobremesas',
  'Outros'
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Bebidas':
      return <Wine className="h-5 w-5 sm:h-4 sm:w-4" />;
    case 'Petiscos':
      return <Coffee className="h-5 w-5 sm:h-4 sm:w-4" />;
    case 'Pratos Principais':
      return <UtensilsCrossed className="h-5 w-5 sm:h-4 sm:w-4" />;
    case 'Sobremesas':
      return <Cake className="h-5 w-5 sm:h-4 sm:w-4" />;
    case 'Outros':
      return <MoreHorizontal className="h-5 w-5 sm:h-4 sm:w-4" />;
    default:
      return <Coffee className="h-5 w-5 sm:h-4 sm:w-4" />;
  }
};

interface MenuViewProps {
  showAdminControls?: boolean;
  onItemSelect?: (item: MenuItem) => void;
  selectionMode?: boolean;
}

export default function MenuView({ 
  showAdminControls = true, 
  onItemSelect,
  selectionMode = false 
}: MenuViewProps) {
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

  const handleItemClick = (item: MenuItem) => {
    if (selectionMode && onItemSelect) {
      onItemSelect(item);
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
    <div className="h-full flex flex-col bg-white">
      <div className="flex-shrink-0 p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
          <h2 className="text-lg sm:text-2xl font-bold text-amber-800">
            {selectionMode ? 'Selecionar do Cardápio' : 'Cardápio'}
          </h2>
          {showAdminControls && !selectionMode && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-700 transition-colors self-start sm:self-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
        </div>

      {/* Category Filter */}
      <div className="flex gap-1 justify-around sm:gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap min-w-max ${
            selectedCategory === ''
              ? 'bg-amber-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Coffee className="h-5 w-5 flex-shrink-0" />
          <span className="hidden sm:inline">Todos</span>
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap min-w-max ${
              selectedCategory === category
                ? 'bg-amber-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={category}
          >
            <span className="flex-shrink-0">
              {getCategoryIcon(category)}
            </span>
            <span className="hidden sm:inline">{category}</span>
          </button>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && showAdminControls && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 m-2 sm:m-4 w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
              {editingItem ? 'Editar Item' : 'Adicionar Item'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3 sm:mb-4">
                <label className="block text-sm font-medium mb-2">Nome</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Nome do item"
                  required
                />
              </div>
              <div className="mb-3 sm:mb-4">
                <label className="block text-sm font-medium mb-2">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="mb-3 sm:mb-4">
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3 sm:mb-4">
                <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Descrição do item"
                  rows={2}
                />
              </div>
              <div className="mb-3 sm:mb-4">
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
                  className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm sm:text-base"
                >
                  {editingItem ? 'Atualizar' : 'Adicionar'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Items List */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-6 rounded-lg border transition-all min-h-[200px] ${
                item.available
                  ? 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                  : 'bg-gray-100 border-gray-300 opacity-70'
              } ${
                selectionMode && item.available 
                  ? 'cursor-pointer hover:border-amber-300 hover:shadow-lg' 
                  : ''
              }`}
              onClick={() => handleItemClick(item)}
            >
              <div className="flex flex-col h-full gap-4">
                <div className="flex-1 overflow-hidden">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg sm:text-xl leading-tight mb-2 break-words">{item.name}</h3>
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </span>
                  </div>
                  <p className="text-amber-600 font-bold text-xl sm:text-2xl mb-3">
                    {formatCurrency(item.price)}
                  </p>
                  {item.description && (
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed break-words overflow-hidden">{item.description}</p>
                  )}
                </div>
                
                {/* Controls */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  {selectionMode && item.available && (
                    <div className="text-sm sm:text-base text-amber-600 font-medium">
                      <span className="sm:hidden">Toque para adicionar</span>
                      <span className="hidden sm:inline">Clique para adicionar</span>
                    </div>
                  )}
                  
                  {showAdminControls && !selectionMode && (
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => toggleAvailability(item.id, item.available)}
                        className={`p-2 sm:p-3 rounded-lg transition-colors ${
                          item.available
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={item.available ? 'Marcar como indisponível' : 'Marcar como disponível'}
                      >
                        <Coffee className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 sm:p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 sm:p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  )}
                  
                  {!showAdminControls && !selectionMode && (
                    <div></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <Coffee className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4 text-sm sm:text-base">
              {selectedCategory 
                ? `Nenhum item encontrado na categoria "${selectedCategory}"`
                : 'Nenhum item no cardápio'
              }
            </p>
            {showAdminControls && !selectionMode && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm sm:text-base"
              >
                Adicionar item
              </button>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
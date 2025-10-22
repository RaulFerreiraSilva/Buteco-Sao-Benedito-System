'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Minus, ShoppingCart } from 'lucide-react';
import db, { MenuItem } from '@/lib/database';

interface MenuItemSelectorProps {
  onItemSelect: (item: MenuItem, quantity: number) => void;
  className?: string;
}

interface SelectedItem extends MenuItem {
  selectedQuantity: number;
}

const MenuItemSelector: React.FC<MenuItemSelectorProps> = ({ 
  onItemSelect, 
  className = '' 
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      const items = await db.getAvailableMenuItems();
      setMenuItems(items);
    } catch (error: any) {
      setError('Erro ao carregar cardápio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar itens baseado na busca e categoria
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, selectedCategory]);

  // Obter categorias únicas
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
    return uniqueCategories.sort();
  }, [menuItems]);

  // Adicionar item à seleção
  const addToSelection = (item: MenuItem) => {
    const existingIndex = selectedItems.findIndex(selected => selected.id === item.id);
    
    if (existingIndex >= 0) {
      // Item já existe, incrementar quantidade
      const updatedItems = [...selectedItems];
      updatedItems[existingIndex].selectedQuantity += 1;
      setSelectedItems(updatedItems);
    } else {
      // Novo item
      setSelectedItems([...selectedItems, { ...item, selectedQuantity: 1 }]);
    }
  };

  // Remover item da seleção
  const removeFromSelection = (itemId: string) => {
    const existingIndex = selectedItems.findIndex(selected => selected.id === itemId);
    
    if (existingIndex >= 0) {
      const updatedItems = [...selectedItems];
      if (updatedItems[existingIndex].selectedQuantity > 1) {
        updatedItems[existingIndex].selectedQuantity -= 1;
      } else {
        updatedItems.splice(existingIndex, 1);
      }
      setSelectedItems(updatedItems);
    }
  };

  // Obter quantidade selecionada de um item
  const getSelectedQuantity = (itemId: string): number => {
    const selectedItem = selectedItems.find(item => item.id === itemId);
    return selectedItem?.selectedQuantity || 0;
  };

  // Confirmar seleção e enviar para o componente pai
  const confirmSelection = () => {
    selectedItems.forEach(item => {
      onItemSelect(item, item.selectedQuantity);
    });
    setSelectedItems([]); // Limpar seleção após confirmar
  };

  // Calcular total da seleção
  const totalSelection = selectedItems.reduce((sum, item) => 
    sum + (item.price * item.selectedQuantity), 0
  );

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center p-8`}>
        <div className="text-gray-500">Carregando cardápio...</div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white border rounded-lg`}>
      {/* Header com busca e filtros */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Selecionar do Cardápio</h3>
        
        {error && (
          <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar item do cardápio..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por categoria */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas as categorias</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de itens */}
      <div className="max-h-96 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Nenhum item encontrado com os filtros aplicados'
              : 'Nenhum item disponível no cardápio'
            }
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredItems.map(item => {
              const selectedQuantity = getSelectedQuantity(item.id);
              
              return (
                <div 
                  key={item.id} 
                  className={`border rounded-lg p-3 transition-all ${
                    selectedQuantity > 0 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium text-green-600">
                          R$ {item.price.toFixed(2)}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Controles de quantidade */}
                    <div className="flex items-center gap-2 ml-4">
                      {selectedQuantity > 0 && (
                        <>
                          <button
                            onClick={() => removeFromSelection(item.id)}
                            className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                          >
                            <Minus size={16} />
                          </button>
                          
                          <span className="w-8 text-center font-medium">
                            {selectedQuantity}
                          </span>
                        </>
                      )}
                      
                      <button
                        onClick={() => addToSelection(item)}
                        className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer com seleção atual */}
      {selectedItems.length > 0 && (
        <div className="border-t p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-sm text-gray-600">
                {selectedItems.length} item(s) selecionado(s)
              </span>
              <div className="font-semibold text-gray-800">
                Total: R$ {totalSelection.toFixed(2)}
              </div>
            </div>
            
            <button
              onClick={confirmSelection}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <ShoppingCart size={16} />
              Adicionar à Mesa
            </button>
          </div>

          {/* Lista resumida dos itens selecionados */}
          <div className="space-y-1">
            {selectedItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span>{item.name}</span>
                <span>{item.selectedQuantity}x R$ {(item.price * item.selectedQuantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItemSelector;
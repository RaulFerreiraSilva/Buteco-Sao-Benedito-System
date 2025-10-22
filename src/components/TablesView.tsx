'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Clock, Check } from 'lucide-react';
import { db, Table } from '@/lib/database';

export default function TablesView() {
  const [tables, setTables] = useState<Table[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTable, setNewTable] = useState({ number: '', name: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const tableList = await db.getTables();
      setTables(tableList.sort((a, b) => a.number - b.number));
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTable.number || !newTable.name) return;

    try {
      await db.addTable({
        number: parseInt(newTable.number),
        name: newTable.name,
        isOccupied: false,
      });
      setNewTable({ number: '', name: '' });
      setShowAddForm(false);
      loadTables();
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  const toggleTableStatus = async (tableId: string) => {
    try {
      const table = tables.find(t => t.id === tableId);
      if (table) {
        await db.updateTable(tableId, { isOccupied: !table.isOccupied });
        loadTables();
      }
    } catch (error) {
      console.error('Error updating table:', error);
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
    <div className="p-4 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-amber-800">Mesas</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Add Table Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 m-4 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Adicionar Mesa</h3>
            <form onSubmit={handleAddTable}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Número da Mesa</label>
                <input
                  type="number"
                  value={newTable.number}
                  onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: 1"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nome/Descrição</label>
                <input
                  type="text"
                  value={newTable.name}
                  onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: Mesa da janela"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              table.isOccupied
                ? 'bg-red-100 border-red-300'
                : 'bg-green-100 border-green-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-bold">{table.number}</span>
              </div>
              {table.isOccupied ? (
                <Clock className="h-5 w-5 text-red-600" />
              ) : (
                <Check className="h-5 w-5 text-green-600" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{table.name}</p>
            <button
              onClick={() => toggleTableStatus(table.id)}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                table.isOccupied
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {table.isOccupied ? 'Liberar Mesa' : 'Ocupar Mesa'}
            </button>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Nenhuma mesa cadastrada</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Adicionar primeira mesa
          </button>
        </div>
      )}
    </div>
  );
}
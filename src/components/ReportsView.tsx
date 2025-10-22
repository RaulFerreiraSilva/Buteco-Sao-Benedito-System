'use client';

import { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, Users, Coffee } from 'lucide-react';
import { db, DailySummary } from '@/lib/database';
import { formatCurrency, getCurrentDateString, exportDailySummaryToTxt } from '@/lib/utils';

export default function ReportsView() {
  const [selectedDate, setSelectedDate] = useState(getCurrentDateString());
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSummary();
  }, [selectedDate]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const dailySummary = await db.getDailySummary(selectedDate);
      setSummary(dailySummary);
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (summary) {
      exportDailySummaryToTxt(summary);
    }
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-amber-800">Relatórios</h2>
        {summary && summary.totalOrders > 0 && (
          <button
            onClick={handleExport}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        )}
      </div>

      {/* Date Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700">
          <Calendar className="h-4 w-4 inline mr-2" />
          Data do Relatório
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      ) : summary ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                  <p className="text-2xl font-bold text-amber-600">{summary.totalOrders}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Faturamento Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(summary.totalOrders > 0 ? summary.totalRevenue / summary.totalOrders : 0)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Coffee className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Top Items */}
          {summary.topItems.length > 0 ? (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Itens Mais Vendidos
              </h3>
              <div className="space-y-3">
                {summary.topItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.item}</p>
                        <p className="text-sm text-gray-600">{item.quantity} unidades vendidas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">{formatCurrency(item.revenue)}</p>
                      <p className="text-sm text-gray-600">
                        {((item.revenue / summary.totalRevenue) * 100).toFixed(1)}% do total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : summary.totalOrders > 0 ? (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center">
              <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum item vendido nesta data</p>
            </div>
          ) : null}

          {/* Export Information */}
          {summary.totalOrders > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Exportar Relatório</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Clique no botão "Exportar" para baixar um arquivo .txt com o resumo completo do dia, 
                    incluindo todos os pedidos, faturamento e itens mais vendidos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No Data State */}
          {summary.totalOrders === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Não há pedidos registrados para {new Date(selectedDate).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-gray-500">
                Selecione uma data diferente ou comece a registrar pedidos para ver os relatórios.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
}
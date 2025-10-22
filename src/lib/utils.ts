import { format } from 'date-fns';
import { DailySummary } from './database';

export function exportDailySummaryToTxt(summary: DailySummary): void {
  const date = new Date(summary.date);
  const formattedDate = format(date, 'dd/MM/yyyy');
  
  let content = `BUTECO SÃO BENEDITO - RESUMO DO DIA
`;
  content += `==========================================\n`;
  content += `Data: ${formattedDate}\n`;
  content += `==========================================\n\n`;
  
  content += `RESUMO FINANCEIRO:\n`;
  content += `- Total de Pedidos: ${summary.totalOrders}\n`;
  content += `- Faturamento Total: R$ ${summary.totalRevenue.toFixed(2).replace('.', ',')}\n`;
  content += `- Ticket Médio: R$ ${summary.totalOrders > 0 ? (summary.totalRevenue / summary.totalOrders).toFixed(2).replace('.', ',') : '0,00'}\n\n`;
  
  if (summary.topItems.length > 0) {
    content += `ITENS MAIS VENDIDOS:\n`;
    content += `----------------------------------------\n`;
    summary.topItems.forEach((item, index) => {
      content += `${index + 1}. ${item.item}\n`;
      content += `   Quantidade: ${item.quantity}\n`;
      content += `   Faturamento: R$ ${item.revenue.toFixed(2).replace('.', ',')}\n\n`;
    });
  }
  
  content += `----------------------------------------\n`;
  content += `Relatório gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}\n`;
  content += `Sistema: Buteco São Benedito\n`;
  
  // Create and download the file
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `resumo-${format(date, 'yyyy-MM-dd')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy HH:mm');
}

export function formatDateShort(date: Date): string {
  return format(date, 'dd/MM');
}

export function getCurrentDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
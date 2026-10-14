import React from 'react';
import { Search, RotateCcw, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { KitchenOrder } from '../types/kitchen';

interface KitchenToolbarProps {
  orders: KitchenOrder[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  stationFilter: string;
  onStationFilterChange: (station: string) => void;
  onQuickSimulate: () => void;
  onResetSampleData: () => void;
}

export const KitchenToolbar: React.FC<KitchenToolbarProps> = ({
  orders,
  searchTerm,
  onSearchChange,
  stationFilter,
  onStationFilterChange,
  onQuickSimulate,
  onResetSampleData
}) => {
  // Statistics calculations
  const activeOrders = orders.filter(o => o.status !== 'finalizado');
  const delayedOrders = activeOrders.filter(o => {
    const elapsedMinutes = (Date.now() - new Date(o.created_at).getTime()) / (1000 * 60);
    return elapsedMinutes >= 18 && o.status !== 'pronto';
  });

  // Calculate average prep time for finished or ready orders
  const completedWithTimes = orders.filter(o => o.ready_at && o.created_at);
  const avgMinutes = completedWithTimes.length > 0
    ? Math.round(
        completedWithTimes.reduce((acc, curr) => {
          const diffMs = new Date(curr.ready_at!).getTime() - new Date(curr.created_at).getTime();
          return acc + diffMs / (1000 * 60);
        }, 0) / completedWithTimes.length
      )
    : 16;

  const stations = ['Todas', 'Chapa', 'Fritura', 'Forno', 'Montagem', 'Bebidas'];

  return (
    <div className="bg-slate-900/50 border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input & Station Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar cliente, comanda ou mesa..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto">
            {stations.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onStationFilterChange(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  stationFilter === st
                    ? 'bg-slate-800 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Operational Indicators and Quick Action */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" title="Média de preparo dos pedidos">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Média:</span>
              <strong className="text-slate-200 font-mono-numbers">{avgMinutes} min</strong>
            </div>

            {delayedOrders.length > 0 && (
              <div className="flex items-center gap-1.5 text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/60 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>{delayedOrders.length} em atraso (&gt;18m)</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <button
              type="button"
              onClick={onQuickSimulate}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              title="Gera um pedido de teste instantâneo na fila"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Simular</span>
              <span>Pedido</span>
            </button>

            <button
              type="button"
              onClick={onResetSampleData}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Restaurar pedidos padrão do sistema"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

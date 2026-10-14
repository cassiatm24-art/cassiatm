import React from 'react';
import { ChefHat, CheckCircle2, ArrowRight, RotateCcw, AlertTriangle, Bike, Store, Utensils } from 'lucide-react';
import { KitchenOrder, OrderStatus } from '../types/kitchen';
import { OrderItemRow } from './OrderItemRow';
import { ElapsedTimeBadge } from './ElapsedTimeBadge';
import { kitchenAudio } from '../utils/audio';

interface OrderCardProps {
  order: KitchenOrder;
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onToggleItem: (orderId: string, itemId: string, completed: boolean) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onUpdateStatus,
  onToggleItem
}) => {
  const totalItems = order.items.reduce((sum, it) => sum + it.quantity, 0);
  const completedItems = order.items.reduce((sum, it) => (it.completed ? sum + it.quantity : sum), 0);
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isAllItemsCompleted = totalItems > 0 && completedItems === totalItems;

  const handleAdvanceStatus = () => {
    if (order.status === 'na_fila') {
      kitchenAudio.playItemDone();
      onUpdateStatus(order.id, 'em_preparo');
    } else if (order.status === 'em_preparo') {
      kitchenAudio.playOrderReady();
      onUpdateStatus(order.id, 'pronto');
    } else if (order.status === 'pronto') {
      kitchenAudio.playItemDone();
      onUpdateStatus(order.id, 'finalizado');
    }
  };

  const handleRevertStatus = () => {
    if (order.status === 'em_preparo') {
      onUpdateStatus(order.id, 'na_fila');
    } else if (order.status === 'pronto') {
      onUpdateStatus(order.id, 'em_preparo');
    }
  };

  const getServiceTypeIcon = () => {
    switch (order.service_type) {
      case 'delivery':
        return <Bike className="w-3.5 h-3.5 text-sky-400" />;
      case 'balcao':
        return <Store className="w-3.5 h-3.5 text-amber-400" />;
      case 'mesa':
      default:
        return <Utensils className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getStatusLabel = () => {
    switch (order.status) {
      case 'na_fila':
        return { text: 'Na Fila', color: 'text-amber-400 bg-amber-950/40 border-amber-800/60' };
      case 'em_preparo':
        return { text: 'Em Preparo', color: 'text-blue-400 bg-blue-950/40 border-blue-800/60' };
      case 'pronto':
        return { text: 'Pronto p/ Entrega', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60' };
      default:
        return { text: 'Finalizado', color: 'text-slate-400 bg-slate-900 border-slate-700' };
    }
  };

  const statusInfo = getStatusLabel();

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all duration-200 hover:border-slate-700">
      {/* Top Header do Ticket */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-start justify-between gap-3 mb-2">
          {/* Número do pedido + Nome do cliente */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono-numbers text-xl font-extrabold text-amber-400 tracking-tight">
                #{order.order_number}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
              {order.priority !== 'normal' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  {order.priority.toUpperCase()}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-100 truncate mt-0.5" title={order.customer_name}>
              {order.customer_name}
            </h3>
          </div>

          {/* Contador de tempo de preparo em tempo real */}
          <div className="shrink-0 flex flex-col items-end">
            <ElapsedTimeBadge
              createdAt={order.created_at}
              startedAt={order.started_at}
              readyAt={order.ready_at}
              status={order.status}
            />
          </div>
        </div>

        {/* Local / Mesa e Tipo de Atendimento */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-1.5">
            {getServiceTypeIcon()}
            <span className="font-medium text-slate-300">
              {order.table_number || (order.service_type === 'balcao' ? 'Balcão' : order.service_type === 'delivery' ? 'Entrega' : 'Mesa')}
            </span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span className="capitalize">{order.service_type}</span>
          </div>

          {order.total_price !== undefined && (
            <span className="font-mono-numbers text-slate-400">
              R$ {order.total_price.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Observações da comanda (se houver) */}
      {order.observation && (
        <div className="px-4 py-2 bg-amber-950/20 border-b border-amber-900/30 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/90 font-medium">
            {order.observation}
          </p>
        </div>
      )}

      {/* Seção de Itens e Progresso */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Barra de progresso dos itens do pedido */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 font-medium">
              Itens ({completedItems}/{totalItems} prontos)
            </span>
            <span className="font-mono-numbers text-slate-300 font-semibold">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-300 ${
                isAllItemsCompleted ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Lista de itens com botão de alternância com 1 clique */}
          <div className="space-y-1.5">
            {order.items.map((item) => (
              <OrderItemRow
                key={item.id}
                item={item}
                orderId={order.id}
                onToggle={onToggleItem}
              />
            ))}
          </div>
        </div>

        {/* Barra de Ações com 1 Clique para mudar de frente */}
        <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-2">
          {/* Botão de retorno se necessário */}
          {order.status !== 'na_fila' && (
            <button
              type="button"
              onClick={handleRevertStatus}
              className="p-2.5 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
              title="Voltar status anterior"
              aria-label="Voltar status anterior"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Botão Principal de Transição com 1 Clique */}
          {order.status === 'na_fila' && (
            <button
              type="button"
              onClick={handleAdvanceStatus}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm active:scale-[0.99]"
            >
              <ChefHat className="w-4 h-4" />
              <span>Iniciar Preparo</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>
          )}

          {order.status === 'em_preparo' && (
            <button
              type="button"
              onClick={handleAdvanceStatus}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors shadow-sm active:scale-[0.99] ${
                isAllItemsCompleted
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Marcar como Pronto</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>
          )}

          {order.status === 'pronto' && (
            <button
              type="button"
              onClick={handleAdvanceStatus}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Entregar / Arquivar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

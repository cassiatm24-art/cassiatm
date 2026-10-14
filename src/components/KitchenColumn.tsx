import React from 'react';
import { Clock, ChefHat, CheckCircle2, Inbox } from 'lucide-react';
import { KitchenOrder, OrderStatus } from '../types/kitchen';
import { OrderCard } from './OrderCard';

interface KitchenColumnProps {
  title: string;
  subtitle: string;
  status: OrderStatus;
  orders: KitchenOrder[];
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onToggleItem: (orderId: string, itemId: string, completed: boolean) => void;
}

export const KitchenColumn: React.FC<KitchenColumnProps> = ({
  title,
  subtitle,
  status,
  orders,
  onUpdateStatus,
  onToggleItem
}) => {
  const getHeaderIcon = () => {
    switch (status) {
      case 'na_fila':
        return <Clock className="w-5 h-5 text-amber-400" />;
      case 'em_preparo':
        return <ChefHat className="w-5 h-5 text-blue-400" />;
      case 'pronto':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      default:
        return null;
    }
  };

  const getAccentBorder = () => {
    switch (status) {
      case 'na_fila':
        return 'border-t-2 border-t-amber-500/80';
      case 'em_preparo':
        return 'border-t-2 border-t-blue-500/80';
      case 'pronto':
        return 'border-t-2 border-t-emerald-500/80';
      default:
        return '';
    }
  };

  return (
    <div className={`flex flex-col rounded-xl bg-slate-950/70 border border-slate-800/90 shadow-md ${getAccentBorder()} min-h-[580px] h-full`}>
      {/* Cabeçalho da Frente */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              {getHeaderIcon()}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>{title}</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-mono-numbers text-xs font-bold text-slate-200 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-md">
              {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo dos Pedidos */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5">
        {orders.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800/80 rounded-xl bg-slate-900/20">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 mb-2">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-400">
              Nenhum pedido {title.toLowerCase()}
            </p>
            <p className="text-xs text-slate-500 max-w-[200px] mt-1">
              {status === 'na_fila'
                ? 'Novos pedidos enviados pelo PDV aparecerão aqui.'
                : status === 'em_preparo'
                ? 'Inicie o preparo dos pedidos da fila com 1 clique.'
                : 'Pedidos prontos aguardam entrega aos clientes.'}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={onUpdateStatus}
              onToggleItem={onToggleItem}
            />
          ))
        )}
      </div>
    </div>
  );
};

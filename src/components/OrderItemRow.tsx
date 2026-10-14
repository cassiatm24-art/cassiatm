import React from 'react';
import { Check, Flame, Waves, UtensilsCrossed, Wine, FlameKindling } from 'lucide-react';
import { OrderItem } from '../types/kitchen';
import { kitchenAudio } from '../utils/audio';

interface OrderItemRowProps {
  item: OrderItem;
  orderId: string;
  onToggle: (orderId: string, itemId: string, completed: boolean) => void;
}

export const OrderItemRow: React.FC<OrderItemRowProps> = ({
  item,
  orderId,
  onToggle
}) => {
  const handleToggle = () => {
    const nextState = !item.completed;
    if (nextState) {
      kitchenAudio.playItemDone();
    }
    onToggle(orderId, item.id, nextState);
  };

  const getStationIcon = (station?: string) => {
    switch (station) {
      case 'Chapa':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'Fritura':
        return <FlameKindling className="w-3.5 h-3.5 text-orange-400" />;
      case 'Bebidas':
        return <Wine className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Forno':
        return <Waves className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <UtensilsCrossed className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={`group flex items-start justify-between gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
        item.completed
          ? 'bg-emerald-950/20 border-emerald-900/40 opacity-75'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleToggle();
        }
      }}
      aria-label={`Marcar item ${item.name} como ${item.completed ? 'não pronto' : 'pronto'}`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {/* Quantidade destacada */}
        <span
          className={`shrink-0 font-mono-numbers font-bold text-sm px-1.5 py-0.5 rounded ${
            item.completed
              ? 'bg-emerald-900/40 text-emerald-300'
              : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
          }`}
        >
          {item.quantity}x
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-sm font-medium leading-tight ${
                item.completed
                  ? 'line-through text-slate-400'
                  : 'text-slate-100 group-hover:text-amber-200 transition-colors'
              }`}
            >
              {item.name}
            </span>

            {item.station && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                {getStationIcon(item.station)}
                <span>{item.station}</span>
              </span>
            )}
          </div>

          {item.notes && (
            <p
              className={`text-xs mt-1 font-sans ${
                item.completed ? 'text-slate-500 line-through' : 'text-amber-300/90 font-medium'
              }`}
            >
              ⚠️ {item.notes}
            </p>
          )}
        </div>
      </div>

      {/* Botão de atualização rápida de progresso do item */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className={`shrink-0 w-8 h-8 rounded flex items-center justify-center transition-all ${
          item.completed
            ? 'bg-emerald-500 text-slate-950 shadow-sm'
            : 'border border-slate-700 bg-slate-800/80 text-slate-400 hover:border-amber-400 hover:text-amber-300'
        }`}
        title={item.completed ? 'Item pronto (clique para desmarcar)' : 'Marcar item como concluído'}
      >
        <Check className={`w-4 h-4 stroke-[2.5] ${item.completed ? 'scale-105' : 'opacity-30 group-hover:opacity-100'}`} />
      </button>
    </div>
  );
};

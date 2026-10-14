import React, { useState } from 'react';
import { X, Plus, Trash2, Sparkles, Utensils, AlertTriangle } from 'lucide-react';
import { KitchenOrder, OrderItem, PriorityLevel, ServiceType } from '../types/kitchen';
import { kitchenAudio } from '../utils/audio';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (order: KitchenOrder) => void;
  nextOrderNumber: number;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onAddOrder,
  nextOrderNumber
}) => {
  const [customerName, setCustomerName] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('mesa');
  const [tableNumber, setTableNumber] = useState('Mesa 05');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [observation, setObservation] = useState('');
  const [items, setItems] = useState<Omit<OrderItem, 'id' | 'completed'>[]>([
    { name: 'Burger Duplo Artesanal', quantity: 1, notes: 'Ao ponto, com bacon extra', station: 'Chapa' },
    { name: 'Batata Rústica c/ Páprica', quantity: 1, notes: '', station: 'Fritura' }
  ]);

  if (!isOpen) return null;

  const handleAddItemRow = () => {
    setItems([
      ...items,
      { name: '', quantity: 1, notes: '', station: 'Chapa' }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleApplyPreset = (presetName: string) => {
    if (presetName === 'burger') {
      setCustomerName('Juliana Mendes');
      setServiceType('mesa');
      setTableNumber('Mesa 08');
      setObservation('Cliente prefere carne bem passada');
      setItems([
        { name: 'Smash Burger Trufado', quantity: 2, notes: 'Bem passado, queijo cheddar inglês', station: 'Chapa' },
        { name: 'Batatas Crinkle Crocantes', quantity: 1, notes: 'Sal moderado', station: 'Fritura' },
        { name: 'Milkshake de Frutas Vermelhas 400ml', quantity: 2, notes: 'Com chantilly', station: 'Bebidas' }
      ]);
    } else if (presetName === 'pizza') {
      setCustomerName('Fernando Albuquerque');
      setServiceType('delivery');
      setTableNumber('iFood #904');
      setObservation('Portaria liberar interfone antes');
      setItems([
        { name: 'Pizza Calabresa Especial 35cm', quantity: 1, notes: 'Cebola roxa e azeitonas pretas', station: 'Forno' },
        { name: 'Brotinho de Chocolate com Morango', quantity: 1, notes: 'Sobremesa', station: 'Forno' },
        { name: 'Refrigerante Guaraná 2L', quantity: 1, notes: 'Gelado', station: 'Bebidas' }
      ]);
    } else if (presetName === 'executivo') {
      setCustomerName('Doutor Paulo Cesar');
      setServiceType('mesa');
      setTableNumber('Mesa 02');
      setPriority('alta');
      setObservation('Horário de almoço apertado');
      setItems([
        { name: 'Filé Mignon ao Molho Madeira', quantity: 1, notes: 'Ponto menos, arroz branco e fritas', station: 'Chapa' },
        { name: 'Salada Ceasar Entrada', quantity: 1, notes: 'Molho à parte', station: 'Montagem' },
        { name: 'Suco Natural Abacaxi com Hortelã', quantity: 1, notes: 'Sem açúcar', station: 'Bebidas' }
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }

    const filteredItems = items.filter(it => it.name.trim().length > 0);
    if (filteredItems.length === 0) {
      alert('Adicione pelo menos um item ao pedido.');
      return;
    }

    const newOrder: KitchenOrder = {
      id: `ord-${Date.now()}`,
      order_number: nextOrderNumber,
      customer_name: customerName.trim(),
      service_type: serviceType,
      table_number: tableNumber.trim(),
      status: 'na_fila',
      priority,
      observation: observation.trim() || undefined,
      created_at: new Date().toISOString(),
      started_at: null,
      ready_at: null,
      items: filteredItems.map((it, idx) => ({
        id: `it-${Date.now()}-${idx}`,
        name: it.name.trim(),
        quantity: Math.max(1, Number(it.quantity) || 1),
        notes: it.notes?.trim() || undefined,
        completed: false,
        station: it.station as any
      }))
    };

    kitchenAudio.playNewOrder();
    onAddOrder(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Novo Pedido para a Cozinha</span>
                <span className="font-mono-numbers text-xs text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                  #{nextOrderNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                O pedido entrará imediatamente na coluna &quot;Na Fila&quot; da equipe de preparo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 flex items-center gap-1 shrink-0 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Preencher Rápido:
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset('burger')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 shrink-0 transition-colors"
          >
            🍔 Combo Smash
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('pizza')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 shrink-0 transition-colors"
          >
            🍕 Pizza Família
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('executivo')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 shrink-0 transition-colors"
          >
            🥩 Almoço Mignon
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Cliente *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: Carlos Oliveira"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Atendimento
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as ServiceType)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="mesa">Mesa</option>
                  <option value="balcao">Balcão</option>
                  <option value="delivery">Delivery</option>
                  <option value="viagem">Para Viagem</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Identificador
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Mesa 04 / Balcão"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Prioridade da Cozinha
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'alta', 'urgente'] as PriorityLevel[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                      priority === p
                        ? p === 'urgente'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : p === 'alta'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observações Especiais / Alergias
              </label>
              <input
                type="text"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ex: Alérgico a cebola, cliente com pressa..."
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Itens da Comanda ({items.length})
              </label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Prato</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-2.5"
                >
                  <div className="w-16 shrink-0">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-100 text-center font-mono-numbers text-sm"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      required
                      placeholder="Nome do prato ou bebida..."
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="w-28 shrink-0">
                    <select
                      value={item.station}
                      onChange={(e) => handleItemChange(idx, 'station', e.target.value)}
                      className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                    >
                      <option value="Chapa">Chapa</option>
                      <option value="Fritura">Fritura</option>
                      <option value="Forno">Forno</option>
                      <option value="Montagem">Montagem</option>
                      <option value="Bebidas">Bebidas</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="Observação (ponto, sem cebola...)"
                      value={item.notes}
                      onChange={(e) => handleItemChange(idx, 'notes', e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-400 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItemRow(idx)}
                    disabled={items.length <= 1}
                    className="p-1.5 rounded text-slate-500 hover:text-rose-400 disabled:opacity-20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Enviar para a Cozinha</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

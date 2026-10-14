import { useState, useEffect, useCallback } from 'react';
import { KitchenOrder, OrderStatus } from './types/kitchen';
import { supabaseService, INITIAL_ORDERS } from './services/supabaseService';
import { KitchenHeader } from './components/KitchenHeader';
import { KitchenToolbar } from './components/KitchenToolbar';
import { KitchenColumn } from './components/KitchenColumn';
import { NewOrderModal } from './components/NewOrderModal';
import { kitchenAudio } from './utils/audio';
import { RefreshCw, UtensilsCrossed } from 'lucide-react';

export default function App() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState('Todas');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load orders
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    const loaded = await supabaseService.fetchOrders();
    setOrders(loaded);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();

    // Subscribe to realtime changes if Supabase is connected
    const unsubscribe = supabaseService.subscribeRealtime(() => {
      loadOrders();
      kitchenAudio.playNewOrder();
    });

    return () => {
      unsubscribe();
    };
  }, [loadOrders]);

  // Handle status update with 1 click
  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    const updated = await supabaseService.updateOrderStatus(orderId, nextStatus, orders);
    setOrders(updated);
  };

  // Handle item progress update with 1 click
  const handleToggleItem = async (orderId: string, itemId: string, completed: boolean) => {
    const updated = await supabaseService.toggleItemCompletion(orderId, itemId, completed, orders);
    setOrders(updated);
  };

  // Add new order
  const handleAddOrder = async (newOrder: KitchenOrder) => {
    const updated = await supabaseService.addOrder(newOrder, orders);
    setOrders(updated);
  };

  // Reset to sample orders
  const handleResetSampleData = () => {
    if (confirm('Deseja restaurar os pedidos padrão de demonstração?')) {
      supabaseService.saveOrdersToLocalCache(INITIAL_ORDERS);
      setOrders(INITIAL_ORDERS);
    }
  };

  // Quick simulate an order
  const handleQuickSimulate = () => {
    const nextNum = orders.length > 0 ? Math.max(...orders.map(o => o.order_number)) + 1 : 1045;
    const sampleNames = ['Larissa Prado', 'Eduardo Santos', 'Patrícia Lima', 'Bruno Fontes', 'Renata Nogueira'];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomMesa = Math.floor(Math.random() * 15) + 1;

    const sampleOrder: KitchenOrder = {
      id: `ord-sim-${Date.now()}`,
      order_number: nextNum,
      customer_name: randomName,
      service_type: 'mesa',
      table_number: `Mesa ${String(randomMesa).padStart(2, '0')}`,
      status: 'na_fila',
      priority: Math.random() > 0.7 ? 'alta' : 'normal',
      observation: Math.random() > 0.5 ? 'Sem pimenta, com gelo extra' : undefined,
      created_at: new Date().toISOString(),
      started_at: null,
      ready_at: null,
      items: [
        { id: `it-1-${Date.now()}`, name: 'Costelinha Barbecue 600g', quantity: 1, notes: 'Bem dourada', completed: false, station: 'Chapa' },
        { id: `it-2-${Date.now()}`, name: 'Porção Batata Rústica', quantity: 1, notes: 'Molho tártaro', completed: false, station: 'Fritura' },
        { id: `it-3-${Date.now()}`, name: 'Chopp Pilsen Artesanal 500ml', quantity: 2, notes: 'Colarinho cremoso', completed: false, station: 'Bebidas' }
      ]
    };

    kitchenAudio.playNewOrder();
    handleAddOrder(sampleOrder);
  };

  // Filter orders according to search and station
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      searchTerm === '' ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_number.toString().includes(searchTerm) ||
      (order.table_number && order.table_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStation =
      stationFilter === 'Todas' ||
      order.items.some(item => item.station === stationFilter);

    return matchesSearch && matchesStation;
  });

  // Split into the 3 frentes
  const naFilaOrders = filteredOrders.filter(o => o.status === 'na_fila');
  const emPreparoOrders = filteredOrders.filter(o => o.status === 'em_preparo');
  const prontoOrders = filteredOrders.filter(o => o.status === 'pronto');

  const nextOrderNumber = orders.length > 0
    ? Math.max(...orders.map(o => o.order_number)) + 1
    : 1045;

  return (
    <div className="min-h-screen bg-[#0c0f17] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-white">
      {/* Top Bar Header */}
      <KitchenHeader
        onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
        naFilaCount={naFilaOrders.length}
        emPreparoCount={emPreparoOrders.length}
        prontoCount={prontoOrders.length}
      />

      {/* Toolbar & Filters */}
      <KitchenToolbar
        orders={orders}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        stationFilter={stationFilter}
        onStationFilterChange={setStationFilter}
        onQuickSimulate={handleQuickSimulate}
        onResetSampleData={handleResetSampleData}
      />

      {/* Main Kitchen Display Grid (Três Frentes) */}
      <main className="flex-1 p-4 sm:p-6 max-w-[1700px] w-full mx-auto">
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-sm font-medium">Carregando comandas da cozinha...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            {/* Frente 1: Na Fila */}
            <KitchenColumn
              title="Na Fila"
              subtitle="Aguardando início do preparo"
              status="na_fila"
              orders={naFilaOrders}
              onUpdateStatus={handleUpdateStatus}
              onToggleItem={handleToggleItem}
            />

            {/* Frente 2: Em Preparo */}
            <KitchenColumn
              title="Em Preparo"
              subtitle="Sendo confeccionado na cozinha"
              status="em_preparo"
              orders={emPreparoOrders}
              onUpdateStatus={handleUpdateStatus}
              onToggleItem={handleToggleItem}
            />

            {/* Frente 3: Pronto */}
            <KitchenColumn
              title="Pronto"
              subtitle="Pronto para entrega ou retirada"
              status="pronto"
              orders={prontoOrders}
              onUpdateStatus={handleUpdateStatus}
              onToggleItem={handleToggleItem}
            />
          </div>
        )}
      </main>

      {/* Bottom Bar Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 py-3">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-amber-400" />
            <span>KDS Pro Cozinha · Sistema de Gestão e Preparo em Tempo Real</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Três frentes operacionais ativas
          </div>
        </div>
      </footer>

      {/* New Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onAddOrder={handleAddOrder}
        nextOrderNumber={nextOrderNumber}
      />
    </div>
  );
}

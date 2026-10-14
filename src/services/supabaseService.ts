import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { KitchenOrder, OrderStatus, SupabaseConfig } from '../types/kitchen';

const CONFIG_STORAGE_KEY = 'kds_supabase_config_v1';
const ORDERS_STORAGE_KEY = 'kds_orders_cache_v1';

// Initial realistic orders for kitchen display
export const INITIAL_ORDERS: KitchenOrder[] = [
  {
    id: 'ord-101',
    order_number: 1041,
    customer_name: 'Lucas Andrade',
    service_type: 'mesa',
    table_number: 'Mesa 04',
    status: 'na_fila',
    priority: 'alta',
    observation: 'Cliente com pressa. Alérgico a frutos do mar.',
    total_price: 89.50,
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    started_at: null,
    ready_at: null,
    items: [
      { id: 'item-101-1', name: 'Burger Artesanal Defumado', quantity: 2, notes: 'Ao ponto, sem cebola', completed: false, station: 'Chapa' },
      { id: 'item-101-2', name: 'Batata Rústica c/ Alecrim', quantity: 1, notes: 'Molho barbecue à parte', completed: false, station: 'Fritura' },
      { id: 'item-101-3', name: 'Pink Lemonade 500ml', quantity: 2, notes: 'Com gelo e limão', completed: false, station: 'Bebidas' }
    ]
  },
  {
    id: 'ord-102',
    order_number: 1042,
    customer_name: 'Mariana Rios',
    service_type: 'balcao',
    table_number: 'Balcão 01',
    status: 'na_fila',
    priority: 'normal',
    observation: 'Embalagem para viagem separada',
    total_price: 52.00,
    created_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    started_at: null,
    ready_at: null,
    items: [
      { id: 'item-102-1', name: 'Sanduíche de Costela Desfiada', quantity: 1, notes: 'Queijo provolone tostado', completed: false, station: 'Montagem' },
      { id: 'item-102-2', name: 'Cerveja Artesanal IPA 355ml', quantity: 1, notes: 'Estupidamente gelada', completed: true, station: 'Bebidas' }
    ]
  },
  {
    id: 'ord-103',
    order_number: 1039,
    customer_name: 'Camila Ferreira',
    service_type: 'mesa',
    table_number: 'Mesa 12',
    status: 'em_preparo',
    priority: 'normal',
    observation: 'Mesa na área externa',
    total_price: 76.00,
    created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    started_at: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    ready_at: null,
    items: [
      { id: 'item-103-1', name: 'Smash Salad Duplo Especial', quantity: 2, notes: 'Ponto bem passado, dobro de bacon', completed: true, station: 'Chapa' },
      { id: 'item-103-2', name: 'Onion Rings Crocantes', quantity: 1, notes: 'Crocância máxima', completed: false, station: 'Fritura' },
      { id: 'item-103-3', name: 'Refrigerante Cola Zero', quantity: 2, notes: 'Com fatia de limão', completed: true, station: 'Bebidas' }
    ]
  },
  {
    id: 'ord-104',
    order_number: 1038,
    customer_name: 'Gabriel Siqueira',
    service_type: 'delivery',
    table_number: 'iFood #819',
    status: 'em_preparo',
    priority: 'urgente',
    observation: 'Entregador já aguardando na recepção',
    total_price: 115.00,
    created_at: new Date(Date.now() - 21 * 60 * 1000).toISOString(),
    started_at: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
    ready_at: null,
    items: [
      { id: 'item-104-1', name: 'Pizza Napolitana 35cm', quantity: 1, notes: 'Borda recheada de catupiry', completed: true, station: 'Forno' },
      { id: 'item-104-2', name: 'Coxinha de Costela Gourmet (6 un)', quantity: 1, notes: 'Molho de pimenta agridoce', completed: false, station: 'Fritura' },
      { id: 'item-104-3', name: 'Suco de Laranja Integral 500ml', quantity: 1, notes: 'Natural sem açúcar', completed: true, station: 'Bebidas' }
    ]
  },
  {
    id: 'ord-105',
    order_number: 1036,
    customer_name: 'Beatriz Vasconcelos',
    service_type: 'mesa',
    table_number: 'Mesa 07',
    status: 'pronto',
    priority: 'normal',
    observation: 'Pronto para garçom levar',
    total_price: 68.00,
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    started_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    ready_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    items: [
      { id: 'item-105-1', name: 'Risoto de Cogumelos Frescos', quantity: 1, notes: 'Azeite trufado finalizado', completed: true, station: 'Chapa' },
      { id: 'item-105-2', name: 'Água Mineral com Gás', quantity: 1, notes: 'Com gelo e rodela de limão', completed: true, station: 'Bebidas' }
    ]
  }
];

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  count?: number;
  tablesExist?: boolean;
}

class SupabaseService {
  private client: SupabaseClient | null = null;
  private config: SupabaseConfig = {
    url: '',
    anonKey: '',
    tableName: 'pedidos',
    itemsTableName: 'itens_pedido'
  };

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage() {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = { ...this.config, ...parsed };
        if (this.config.url && this.config.anonKey) {
          this.client = createClient(this.config.url, this.config.anonKey);
        }
      } else {
        const envUrl = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_URL;
        const envKey = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_ANON_KEY;
        if (envUrl && envKey) {
          this.config.url = envUrl;
          this.config.anonKey = envKey;
          this.client = createClient(envUrl, envKey);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar configurações do Supabase:', e);
    }
  }

  getConfig(): SupabaseConfig {
    return { ...this.config };
  }

  isConnected(): boolean {
    return !!(this.client && this.config.url && this.config.anonKey);
  }

  saveConfig(url: string, anonKey: string): boolean {
    this.config.url = url.trim();
    this.config.anonKey = anonKey.trim();

    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
      if (this.config.url && this.config.anonKey) {
        this.client = createClient(this.config.url, this.config.anonKey);
      } else {
        this.client = null;
      }
      return true;
    } catch (e) {
      console.error('Falha ao salvar configuração:', e);
      return false;
    }
  }

  // Testa conexão e integridade das tabelas
  async testConnection(url: string, anonKey: string): Promise<ConnectionTestResult> {
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();

    if (!cleanUrl || !cleanKey) {
      return {
        success: false,
        message: 'Por favor, informe a URL do projeto e a Chave Pública Anon.'
      };
    }

    try {
      const tempClient = createClient(cleanUrl, cleanKey);
      const { data, error, count } = await tempClient
        .from('pedidos')
        .select('id', { count: 'exact', head: false })
        .limit(1);

      if (error) {
        // Código 42P01: tabela não encontrada
        if (error.code === '42P01' || error.message.toLowerCase().includes('relation') || error.message.toLowerCase().includes('does not exist')) {
          return {
            success: false,
            tablesExist: false,
            message: "Conexão aceita, porém a tabela 'pedidos' ainda não existe no seu Supabase. Clique em 'Gerar SQL' e execute o script no SQL Editor do Supabase."
          };
        }
        return {
          success: false,
          message: `Erro retornado pelo Supabase: ${error.message} (Código: ${error.code})`
        };
      }

      return {
        success: true,
        tablesExist: true,
        count: count ?? (data ? data.length : 0),
        message: `Conexão bem sucedida com o Supabase! Tabela 'pedidos' pronta para receber comandas.`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Não foi possível contactar a URL do Supabase: ${err?.message || 'Verifique a URL informada'}`
      };
    }
  }

  // Obter pedidos (do Supabase ou cache local)
  async fetchOrders(): Promise<KitchenOrder[]> {
    if (this.client) {
      try {
        const { data: ordersData, error: ordersError } = await this.client
          .from('pedidos')
          .select('*, itens_pedido(*)')
          .order('created_at', { ascending: true });

        if (!ordersError && ordersData) {
          // If ordersData is empty array, it means user's database has 0 orders
          if (ordersData.length === 0) {
            return [];
          }

          const mapped: KitchenOrder[] = ordersData.map((o: any) => ({
            id: o.id,
            order_number: Number(o.order_number) || 1000,
            customer_name: o.customer_name || 'Cliente',
            service_type: o.service_type || 'mesa',
            table_number: o.table_number || '',
            status: o.status || 'na_fila',
            created_at: o.created_at || new Date().toISOString(),
            started_at: o.started_at,
            ready_at: o.ready_at,
            priority: o.priority || 'normal',
            total_price: o.total_price ? Number(o.total_price) : undefined,
            observation: o.observation || '',
            items: Array.isArray(o.itens_pedido)
              ? o.itens_pedido.map((it: any) => ({
                  id: it.id,
                  name: it.name,
                  quantity: it.quantity || 1,
                  notes: it.notes || '',
                  completed: !!it.completed,
                  station: it.station || 'Chapa'
                }))
              : []
          }));

          this.saveOrdersToLocalCache(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Erro ao conectar ao Supabase, recorrendo ao cache local:', err);
      }
    }

    return this.loadOrdersFromLocalCache();
  }

  loadOrdersFromLocalCache(): KitchenOrder[] {
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Falha ao ler cache local de pedidos:', e);
    }
    this.saveOrdersToLocalCache(INITIAL_ORDERS);
    return INITIAL_ORDERS;
  }

  saveOrdersToLocalCache(orders: KitchenOrder[]): void {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Erro ao salvar no cache local:', e);
    }
  }

  // Semear pedidos iniciais no Supabase
  async seedInitialOrdersToSupabase(): Promise<boolean> {
    if (!this.client) return false;

    try {
      for (const order of INITIAL_ORDERS) {
        const { data: insertedOrder, error: orderErr } = await this.client
          .from('pedidos')
          .insert({
            customer_name: order.customer_name,
            service_type: order.service_type,
            table_number: order.table_number,
            status: order.status,
            priority: order.priority,
            observation: order.observation,
            total_price: order.total_price || 0,
            started_at: order.started_at,
            ready_at: order.ready_at
          })
          .select()
          .single();

        if (!orderErr && insertedOrder && order.items.length > 0) {
          const itemsPayload = order.items.map(it => ({
            order_id: insertedOrder.id,
            name: it.name,
            quantity: it.quantity,
            notes: it.notes || '',
            completed: it.completed,
            station: it.station || 'Chapa'
          }));
          await this.client.from('itens_pedido').insert(itemsPayload);
        }
      }
      return true;
    } catch (e) {
      console.error('Erro ao semear pedidos:', e);
      return false;
    }
  }

  // Atualizar status do pedido
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    allOrders: KitchenOrder[]
  ): Promise<KitchenOrder[]> {
    const nowIso = new Date().toISOString();
    const updated = allOrders.map(order => {
      if (order.id === orderId) {
        const isStarting = newStatus === 'em_preparo' && order.status === 'na_fila';
        const isReady = newStatus === 'pronto';
        return {
          ...order,
          status: newStatus,
          started_at: isStarting ? nowIso : order.started_at,
          ready_at: isReady ? nowIso : order.ready_at
        };
      }
      return order;
    });

    this.saveOrdersToLocalCache(updated);

    if (this.client) {
      try {
        const payload: Record<string, any> = { status: newStatus };
        if (newStatus === 'em_preparo') {
          payload.started_at = nowIso;
        } else if (newStatus === 'pronto') {
          payload.ready_at = nowIso;
        }
        await this.client.from('pedidos').update(payload).eq('id', orderId);
      } catch (e) {
        console.warn('Falha ao sincronizar status no Supabase:', e);
      }
    }

    return updated;
  }

  // Atualizar progresso de cada item do pedido
  async toggleItemCompletion(
    orderId: string,
    itemId: string,
    completed: boolean,
    allOrders: KitchenOrder[]
  ): Promise<KitchenOrder[]> {
    const updated = allOrders.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item =>
          item.id === itemId ? { ...item, completed } : item
        );
        return {
          ...order,
          items: updatedItems
        };
      }
      return order;
    });

    this.saveOrdersToLocalCache(updated);

    if (this.client) {
      try {
        await this.client
          .from('itens_pedido')
          .update({ completed })
          .eq('id', itemId);
      } catch (e) {
        console.warn('Falha ao atualizar item no Supabase:', e);
      }
    }

    return updated;
  }

  // Criar novo pedido
  async addOrder(newOrder: KitchenOrder, allOrders: KitchenOrder[]): Promise<KitchenOrder[]> {
    const updated = [newOrder, ...allOrders];
    this.saveOrdersToLocalCache(updated);

    if (this.client) {
      try {
        const { data: insertedOrder, error: orderErr } = await this.client
          .from('pedidos')
          .insert({
            customer_name: newOrder.customer_name,
            service_type: newOrder.service_type,
            table_number: newOrder.table_number,
            status: newOrder.status,
            priority: newOrder.priority,
            observation: newOrder.observation,
            total_price: newOrder.total_price || 0
          })
          .select()
          .single();

        if (!orderErr && insertedOrder && newOrder.items.length > 0) {
          const itemsPayload = newOrder.items.map(it => ({
            order_id: insertedOrder.id,
            name: it.name,
            quantity: it.quantity,
            notes: it.notes || '',
            completed: it.completed,
            station: it.station || 'Chapa'
          }));
          await this.client.from('itens_pedido').insert(itemsPayload);
        }
      } catch (e) {
        console.warn('Erro ao inserir novo pedido no Supabase:', e);
      }
    }

    return updated;
  }

  // Remover ou arquivar pedido
  async removeOrder(orderId: string, allOrders: KitchenOrder[]): Promise<KitchenOrder[]> {
    const updated = allOrders.filter(o => o.id !== orderId);
    this.saveOrdersToLocalCache(updated);

    if (this.client) {
      try {
        await this.client.from('pedidos').delete().eq('id', orderId);
      } catch (e) {
        console.warn('Erro ao excluir pedido do Supabase:', e);
      }
    }

    return updated;
  }

  // Inscrever para mudanças em Tempo Real (Supabase Realtime Postgres Changes)
  subscribeRealtime(onReload: () => void): () => void {
    if (!this.client) {
      return () => {};
    }

    try {
      const channel = this.client
        .channel('kds_realtime_orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'pedidos' },
          () => {
            onReload();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'itens_pedido' },
          () => {
            onReload();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('KDS conectado ao Realtime do Supabase!');
          }
        });

      return () => {
        try {
          this.client?.removeChannel(channel);
        } catch {
          // ignore cleanup error
        }
      };
    } catch (e) {
      console.warn('Erro ao assinar Realtime:', e);
      return () => {};
    }
  }
}

export const supabaseService = new SupabaseService();

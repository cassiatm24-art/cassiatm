export type OrderStatus = 'na_fila' | 'em_preparo' | 'pronto' | 'finalizado';

export type ServiceType = 'mesa' | 'balcao' | 'delivery' | 'viagem';

export type PriorityLevel = 'normal' | 'alta' | 'urgente';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  completed: boolean;
  station?: 'Chapa' | 'Fritura' | 'Montagem' | 'Bebidas' | 'Forno';
}

export interface KitchenOrder {
  id: string;
  order_number: number;
  customer_name: string;
  service_type: ServiceType;
  table_number?: string;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string; // ISO
  started_at?: string | null;
  ready_at?: string | null;
  priority: PriorityLevel;
  total_price?: number;
  observation?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
  itemsTableName: string;
}

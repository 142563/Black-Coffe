export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  notes: string;
  totalAmount: number;
  status: string;
  createdAtUtc: string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  notes: string;
  items: { productId: string; quantity: number }[];
}

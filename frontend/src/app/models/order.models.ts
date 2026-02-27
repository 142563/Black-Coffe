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

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  ivaRate: number;
  ivaAmount: number;
  total: number;
}

export interface OrderPreviewItemInput {
  productId: string;
  quantity: number;
  variant?: string | null;
}

export interface OrderPreviewRequest {
  items: OrderPreviewItemInput[];
}

export interface OrderPreviewLine {
  productId: string;
  name: string;
  variant?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderPreviewResponse {
  items: OrderPreviewLine[];
  summary: OrderSummary;
}

export interface PlaceOrderRequest {
  customerName: string;
  customerPhone: string;
  customerNit?: string | null;
  serviceType?: string | null;
  notes?: string | null;
  items: OrderPreviewItemInput[];
}

export interface CreateOrderResponse {
  orderId: string;
  status: string;
  createdAt: string;
  summary: OrderSummary;
}

export interface InvoiceBusiness {
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  hoursText: string;
}

export interface InvoiceItem {
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Invoice {
  invoiceNumber: string;
  date: string;
  customerName?: string | null;
  customerNit?: string | null;
  items: InvoiceItem[];
  subtotal: number;
  shipping: number;
  ivaRate: number;
  ivaAmount: number;
  total: number;
  business: InvoiceBusiness;
  businessMessage: string;
}

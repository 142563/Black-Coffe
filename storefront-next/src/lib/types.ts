export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface CartAddInput {
  productId: string;
  name: string;
  unitPrice: number;
  quantity?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
  isAvailable: boolean;
}

export interface MenuBoardResponse {
  sections: MenuSection[];
}

export interface MenuSection {
  key: string;
  title: string;
  kind: "drink" | "food";
  note?: string | null;
  rows: MenuRow[];
}

export interface MenuRow {
  label: string;
  note?: string | null;
  options: MenuOption[];
}

export interface MenuOption {
  productId: string;
  label: string;
  sizeLabel: string;
  price: number;
  currency: string;
  available: boolean;
  group: "drink" | "food";
}

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

export interface TableDto {
  id: string;
  name: string;
  capacity: number;
  status: string;
  isActive: boolean;
}

export interface CreateReservationRequest {
  tableId: string;
  reservationAtUtc: string;
  partySize: number;
  notes: string;
}

export interface StorefrontSocialLinks {
  instagram: string;
  facebook: string;
}

export interface StorefrontSettings {
  name: string;
  tagline: string;
  logoUrl: string;
  accentColor: string;
  phone: string;
  whatsapp: string;
  address: string;
  hoursText: string;
  businessMessage: string;
  socialLinks: StorefrontSocialLinks;
}

export interface StorefrontBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  type: string;
  active: boolean;
  order: number;
}

export interface MenuCategory {
  key: string;
  name: string;
  iconKey: string;
  order: number;
  visible: boolean;
}

export interface FeaturedMenuItem {
  id: number;
  name: string;
  categoryKey: string;
  priceFrom: number;
  badgeText: string;
  imageUrl: string;
}

export interface ApiErrorShape {
  status?: number;
  message: string;
  detail?: string;
}

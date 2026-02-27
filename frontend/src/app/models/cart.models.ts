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

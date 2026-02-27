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
  kind: 'drink' | 'food';
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
  group: 'drink' | 'food';
}

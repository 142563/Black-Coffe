import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartAddInput, CartItem } from '../../models/cart.models';
import { Product } from '../../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'black_coffe_cart';
  private readonly itemsState = new BehaviorSubject<CartItem[]>(this.loadStoredItems());

  readonly items$ = this.itemsState.asObservable();

  get snapshot(): CartItem[] {
    return this.itemsState.value;
  }

  get total(): number {
    return this.snapshot.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  get totalItems(): number {
    return this.snapshot.reduce((sum, item) => sum + item.quantity, 0);
  }

  add(product: Product): void {
    this.addItem({
      productId: product.id,
      name: product.name,
      unitPrice: product.price
    });
  }

  addItem(input: CartAddInput): void {
    const quantityToAdd = input.quantity && input.quantity > 0 ? input.quantity : 1;
    const existing = this.snapshot.find((item) => item.productId === input.productId);
    if (existing) {
      this.setQuantity({
        productId: existing.productId,
        name: existing.name,
        unitPrice: existing.unitPrice
      }, existing.quantity + quantityToAdd);
      return;
    }

    this.setItems([
      ...this.snapshot,
      {
        productId: input.productId,
        name: input.name,
        unitPrice: input.unitPrice,
        quantity: quantityToAdd
      }
    ]);
  }

  setQuantity(input: CartAddInput, quantity: number): void {
    if (quantity <= 0) {
      this.remove(input.productId);
      return;
    }

    const existing = this.snapshot.find((item) => item.productId === input.productId);
    if (existing) {
      this.setItems(this.snapshot.map((item) =>
        item.productId === input.productId ? { ...item, quantity } : item
      ));
      return;
    }

    this.setItems([
      ...this.snapshot,
      {
        productId: input.productId,
        name: input.name,
        unitPrice: input.unitPrice,
        quantity
      }
    ]);
  }

  updateQuantity(productId: string, quantity: number): void {
    const existing = this.snapshot.find((item) => item.productId === productId);
    if (!existing) {
      return;
    }

    this.setQuantity({
      productId: existing.productId,
      name: existing.name,
      unitPrice: existing.unitPrice
    }, quantity);
  }

  getQuantity(productId: string): number {
    return this.snapshot.find((item) => item.productId === productId)?.quantity ?? 0;
  }

  increase(productId: string): void {
    const current = this.snapshot.find((item) => item.productId === productId);
    if (!current) {
      return;
    }

    this.setQuantity({
      productId: current.productId,
      name: current.name,
      unitPrice: current.unitPrice
    }, current.quantity + 1);
  }

  decrease(productId: string): void {
    const current = this.snapshot.find((item) => item.productId === productId);
    if (!current) {
      return;
    }

    this.setQuantity({
      productId: current.productId,
      name: current.name,
      unitPrice: current.unitPrice
    }, current.quantity - 1);
  }

  remove(productId: string): void {
    this.setItems(this.snapshot.filter((item) => item.productId !== productId));
  }

  clear(): void {
    this.setItems([]);
  }

  hasItems(): boolean {
    return this.totalItems > 0;
  }

  private setItems(items: CartItem[]): void {
    this.itemsState.next(items);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private loadStoredItems(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as CartItem[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((item) =>
        item &&
        typeof item.productId === 'string' &&
        typeof item.name === 'string' &&
        typeof item.unitPrice === 'number' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
      );
    } catch {
      return [];
    }
  }
}

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { StorefrontService } from '../../core/services/storefront.service';
import { ToastService } from '../../core/services/toast.service';
import { CartItem } from '../../models/cart.models';
import { MenuBoardResponse, MenuOption, MenuSection } from '../../models/catalog.models';
import { MenuCategory } from '../../models/storefront.models';
import { IconComponent } from '../../shared/icon/icon.component';

interface MenuCategoryView {
  key: string;
  label: string;
  icon: string;
  section?: MenuSection;
}

interface ProductCardView {
  key: string;
  title: string;
  note?: string | null;
  options: MenuOption[];
}

@Component({
  standalone: true,
  selector: 'app-catalog-page',
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="space-y-6">
      <section class="panel section" *ngIf="loading">
        <p class="section__eyebrow">MENU</p>
        <h2 class="section__title">Cargando menu</h2>
        <div class="skeleton-grid">
          <article class="skeleton-card" *ngFor="let item of skeletonRows">
            <div class="skeleton-line skeleton-line--lg w-2/3"></div>
            <div class="mt-3 space-y-2">
              <div class="skeleton-line w-full"></div>
              <div class="skeleton-line w-11/12"></div>
              <div class="skeleton-line w-10/12"></div>
            </div>
          </article>
        </div>
      </section>

      <section class="panel section" *ngIf="errorMessage && !loading">
        <h2 class="section__title">No se pudo cargar el menu</h2>
        <p class="section__copy">{{ errorMessage }}</p>
        <button class="btn-primary" type="button" (click)="reload()">Reintentar</button>
      </section>

      <section class="empty-state" *ngIf="!loading && !errorMessage && cardsByCategory.length === 0">
        <app-icon name="coffee" [size]="40" className="empty-state__icon"></app-icon>
        <h2 class="section__title section__title--md">No hay productos por el momento</h2>
        <p class="section__copy">Actualiza la carta o intenta recargar.</p>
        <div class="row-actions justify-center">
          <button class="btn-primary" type="button" (click)="reload()">Recargar menu</button>
        </div>
      </section>

      <section class="panel menu-intro" *ngIf="!loading && !errorMessage && cardsByCategory.length > 0">
        <p class="section__eyebrow">BLACK COFFE MENU</p>
        <h1 class="section__title">Elige tu cafe ideal</h1>
        <p class="section__copy">Selecciona categoria, tamano y cantidad. Todo con una experiencia fluida y comercial.</p>
      </section>

      <section class="menu-chip-bar" *ngIf="!loading && !errorMessage && cardsByCategory.length > 0">
        <button
          type="button"
          class="menu-chip"
          *ngFor="let category of cardsByCategory"
          [class.menu-chip--active]="activeCategory === category.key"
          (click)="scrollToCategory(category.key)"
        >
          <app-icon [name]="category.icon" [size]="16"></app-icon>
          <span>{{ category.label }}</span>
        </button>
      </section>

      <section
        #categorySection
        class="space-y-4"
        *ngFor="let category of cardsByCategory"
        [attr.id]="sectionDomId(category.key)"
        [attr.data-category]="category.key"
      >
        <header class="section-head">
          <div class="inline-flex items-center gap-2">
            <app-icon [name]="category.icon" [size]="18" className="text-brand-caramel"></app-icon>
            <h2>{{ category.label }}</h2>
          </div>
          <p *ngIf="category.section?.note">{{ category.section?.note }}</p>
        </header>

        <div class="product-grid">
          <article class="product-card" *ngFor="let card of cardsForCategory(category)">
            <div class="space-y-2">
              <h3>{{ card.title }}</h3>
              <p *ngIf="card.note" class="text-xs text-neutral-500">{{ card.note }}</p>
            </div>

            <div class="size-chip-row">
              <button
                class="size-chip"
                type="button"
                *ngFor="let option of card.options"
                [class.size-chip--active]="selectedOption(card).productId === option.productId"
                [disabled]="!option.available"
                (click)="selectOption(card, option)"
              >
                {{ displaySizeLabel(option.sizeLabel) }}
              </button>
            </div>

            <div class="product-meta">
              <strong>Q{{ selectedOption(card).price | number:'1.2-2' }}</strong>
              <span>{{ cartQuantityOf(selectedOption(card).productId) }} en carrito</span>
            </div>

            <div class="product-actions">
              <div class="counter">
                <button class="counter__btn" type="button" (click)="decreaseDraft(card)">-</button>
                <span class="counter__value">{{ draftQuantity(card) }}</span>
                <button class="counter__btn" type="button" (click)="increaseDraft(card)">+</button>
              </div>
              <button class="btn-primary" type="button" [disabled]="!selectedOption(card).available" (click)="addCardToCart(card)">
                Agregar
              </button>
            </div>
          </article>
        </div>
      </section>

      <section class="catalog-sticky" *ngIf="!loading && !errorMessage && cardsByCategory.length > 0">
        <div class="catalog-sticky__summary">
          <strong>{{ cartItemsCount }} {{ cartItemsCount === 1 ? 'item' : 'items' }} en carrito</strong>
          <span>Subtotal Q{{ cartSubtotal | number:'1.2-2' }} | IVA Q{{ cartIvaAmount | number:'1.2-2' }}</span>
        </div>
        <button class="btn-primary" type="button" [class.btn-disabled]="cartItemsCount === 0" (click)="openDrawer()">
          Ver carrito
        </button>
      </section>
    </div>
  `
})
export class CatalogPageComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly skeletonRows = Array.from({ length: 8 }, (_, index) => index);

  categories: MenuCategoryView[] = [];
  sections: MenuSection[] = [];
  loading = true;
  errorMessage = '';
  cartItemsCount = 0;
  cartSubtotal = 0;
  cartIvaAmount = 0;
  activeCategory = 'hot';
  cardsByCategory: MenuCategoryView[] = [];

  @ViewChildren('categorySection') categorySections?: QueryList<ElementRef<HTMLElement>>;

  private quantities: Record<string, number> = {};
  private selectedOptionIds: Record<string, string> = {};
  private draftQuantities: Record<string, number> = {};
  private cartSub?: Subscription;
  private sectionRefsSub?: Subscription;
  private sectionObserver?: IntersectionObserver;

  constructor(
    private readonly api: ApiService,
    private readonly cart: CartService,
    private readonly storefrontService: StorefrontService,
    private readonly toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    this.cartSub = this.cart.items$.subscribe((items) => {
      this.syncCartState(items);
    });

    await this.loadMenuBoard();
  }

  ngAfterViewInit(): void {
    this.sectionRefsSub = this.categorySections?.changes.subscribe(() => {
      this.setupSectionObserver();
    });

    this.setupSectionObserver();
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.sectionRefsSub?.unsubscribe();
    this.sectionObserver?.disconnect();
  }

  async reload(): Promise<void> {
    await this.loadMenuBoard();
  }

  cardsForCategory(category: MenuCategoryView): ProductCardView[] {
    const section = category.section;
    if (!section) {
      return [];
    }

    return section.rows.map((row, index) => ({
      key: `${section.key}-${index}`,
      title: row.label.replace('*', ''),
      note: row.note,
      options: row.options
    }));
  }

  displaySizeLabel(sizeLabel: string): string {
    const value = sizeLabel.toLowerCase();
    if (value === 'unit') {
      return 'Unidad';
    }

    return sizeLabel.toUpperCase();
  }

  sectionDomId(categoryKey: string): string {
    return `menu-section-${categoryKey}`;
  }

  scrollToCategory(categoryKey: string): void {
    const element = document.getElementById(this.sectionDomId(categoryKey));
    if (!element) {
      return;
    }

    this.activeCategory = categoryKey;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  selectOption(card: ProductCardView, option: MenuOption): void {
    if (!option.available) {
      return;
    }

    this.selectedOptionIds[card.key] = option.productId;
  }

  selectedOption(card: ProductCardView): MenuOption {
    const selectedId = this.selectedOptionIds[card.key];
    const selected = card.options.find((option) => option.productId === selectedId);
    if (selected) {
      return selected;
    }

    return card.options[0];
  }

  draftQuantity(card: ProductCardView): number {
    return this.draftQuantities[card.key] ?? 1;
  }

  increaseDraft(card: ProductCardView): void {
    const next = this.draftQuantity(card) + 1;
    this.draftQuantities[card.key] = Math.min(next, 20);
  }

  decreaseDraft(card: ProductCardView): void {
    const next = this.draftQuantity(card) - 1;
    this.draftQuantities[card.key] = Math.max(next, 1);
  }

  addCardToCart(card: ProductCardView): void {
    const selected = this.selectedOption(card);
    if (!selected.available) {
      return;
    }

    const quantity = this.draftQuantity(card);
    this.cart.addItem({
      productId: selected.productId,
      name: selected.label,
      unitPrice: selected.price,
      quantity
    });

    this.draftQuantities[card.key] = 1;
    this.toast.success(`${selected.label} agregado al carrito.`);
  }

  cartQuantityOf(productId: string): number {
    return this.quantities[productId] ?? 0;
  }

  openDrawer(): void {
    const event = new CustomEvent('open-cart-drawer');
    window.dispatchEvent(event);
  }

  private syncCartState(items: CartItem[]): void {
    const nextQuantities: Record<string, number> = {};
    for (const item of items) {
      nextQuantities[item.productId] = item.quantity;
    }

    this.quantities = nextQuantities;
    this.cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartSubtotal = this.cart.subtotal;
    this.cartIvaAmount = this.cart.ivaAmount;
  }

  private async loadMenuBoard(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const [response, categoryResponse] = await Promise.all([
        this.api.get<MenuBoardResponse>('/catalog/menu-board'),
        this.storefrontService.getMenuCategories()
      ]);

      this.sections = response.sections;
      this.categories = this.buildCategoryViews(categoryResponse);

      this.cardsByCategory = this.categories
        .map((category) => ({
          ...category,
          section: this.sections.find((section) => this.mapCategory(section.key) === category.key)
        }))
        .filter((category) => category.section?.rows.length);

      this.initializeSelectionState();

      const firstCategory = this.cardsByCategory[0];
      if (firstCategory) {
        this.activeCategory = firstCategory.key;
      }

      requestAnimationFrame(() => this.setupSectionObserver());
    } catch (error: unknown) {
      const httpError = error as { status?: number; error?: { message?: string; detail?: string }; message?: string };

      if (httpError?.status === 0) {
        this.errorMessage = 'No hay conexion con backend. Levanta la API en http://localhost:5088.';
      } else if (httpError?.status === 503) {
        this.errorMessage = httpError.error?.detail ?? 'Base de datos no disponible. Intenta nuevamente.';
      } else {
        this.errorMessage = httpError.error?.detail ?? httpError.message ?? 'Error al cargar el menu.';
      }

      this.toast.error(this.errorMessage);
    } finally {
      this.loading = false;
    }
  }

  private mapCategory(sectionKey: string): string {
    if (sectionKey.includes('hot')) {
      return 'hot';
    }

    if (sectionKey.includes('cold')) {
      return 'cold';
    }

    if (sectionKey.includes('savory')) {
      return 'savory';
    }

    return 'sweet';
  }

  private buildCategoryViews(categories: MenuCategory[]): MenuCategoryView[] {
    const iconMap: Record<string, string> = {
      hot: 'cup',
      cold: 'spark',
      savory: 'coffee',
      sweet: 'check'
    };

    if (!categories.length) {
      return [
        { key: 'hot', label: 'Hot Drinks', icon: 'cup' },
        { key: 'cold', label: 'Cold Drinks', icon: 'spark' },
        { key: 'savory', label: 'Food - Savory', icon: 'coffee' },
        { key: 'sweet', label: 'Food - Sweet', icon: 'check' }
      ];
    }

    return categories
      .filter((x) => x.visible)
      .sort((a, b) => a.order - b.order)
      .map((x) => ({
        key: x.key,
        label: x.name,
        icon: iconMap[x.iconKey] ?? 'spark'
      }));
  }

  private initializeSelectionState(): void {
    const selected: Record<string, string> = {};
    const quantities: Record<string, number> = {};

    for (const category of this.cardsByCategory) {
      const section = category.section;
      if (!section) {
        continue;
      }

      section.rows.forEach((row, index) => {
        const key = `${section.key}-${index}`;
        if (row.options.length > 0) {
          selected[key] = row.options[0].productId;
          quantities[key] = 1;
        }
      });
    }

    this.selectedOptionIds = selected;
    this.draftQuantities = quantities;
  }

  private setupSectionObserver(): void {
    this.sectionObserver?.disconnect();

    const sectionNodes = this.categorySections?.toArray() ?? [];
    if (sectionNodes.length === 0 || typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length === 0) {
        return;
      }

      const category = visible[0].target.getAttribute('data-category');
      if (category) {
        this.activeCategory = category;
      }
    }, {
      rootMargin: '-30% 0px -60% 0px',
      threshold: [0.2, 0.4, 0.6]
    });

    for (const sectionRef of sectionNodes) {
      this.sectionObserver.observe(sectionRef.nativeElement);
    }
  }
}

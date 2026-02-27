import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { ToastService } from './core/services/toast.service';
import { ToastComponent } from './shared/toast/toast.component';
import { IconComponent } from './shared/icon/icon.component';

interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ToastComponent, IconComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoggedIn = false;
  cartCount = 0;
  cartBadgeBump = false;
  mobileMenuOpen = false;
  isScrolled = false;
  currentUrl = '/';
  cartDrawerOpen = false;
  breadcrumbs: BreadcrumbItem[] = [];
  navPillStyle: Record<string, string> = {
    opacity: '0',
    transform: 'translateX(0px)',
    width: '0px'
  };

  @ViewChild('desktopNav') desktopNav?: ElementRef<HTMLElement>;
  @ViewChildren('desktopNavLink') desktopNavLinks?: QueryList<ElementRef<HTMLElement>>;

  private authSub?: Subscription;
  private cartSub?: Subscription;
  private routerSub?: Subscription;
  private navLinksSub?: Subscription;

  constructor(
    public readonly auth: AuthService,
    public readonly cart: CartService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {}

  get drawerItems() {
    return this.cart.snapshot;
  }

  get drawerSubtotal(): number {
    return this.cart.total;
  }

  ngOnInit(): void {
    this.currentUrl = this.normalizeUrl(this.router.url);
    this.updateBreadcrumbs();
    this.isScrolled = window.scrollY > 10;

    this.authSub = this.auth.auth$.subscribe((authState) => {
      this.isLoggedIn = Boolean(authState?.accessToken);
    });

    let isFirstEmission = true;
    this.cartSub = this.cart.items$.subscribe((items) => {
      const nextCount = items.reduce((total, item) => total + item.quantity, 0);
      if (!isFirstEmission && nextCount !== this.cartCount) {
        this.cartBadgeBump = false;
        requestAnimationFrame(() => {
          this.cartBadgeBump = true;
          setTimeout(() => {
            this.cartBadgeBump = false;
          }, 220);
        });
      }

      this.cartCount = nextCount;
      isFirstEmission = false;
    });

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentUrl = this.normalizeUrl(this.router.url);
        this.mobileMenuOpen = false;
        this.updateBreadcrumbs();
        requestAnimationFrame(() => this.updateNavPill());
      });
  }

  ngAfterViewInit(): void {
    this.navLinksSub = this.desktopNavLinks?.changes.subscribe(() => {
      this.updateNavPill();
    });

    this.updateNavPill();
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.cartSub?.unsubscribe();
    this.routerSub?.unsubscribe();
    this.navLinksSub?.unsubscribe();
    document.body.classList.remove('overflow-hidden');
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateNavPill();
  }

  @HostListener('window:open-cart-drawer')
  onOpenCartDrawerEvent(): void {
    this.openCartDrawer();
  }

  isRouteActive(route: string, exact = false): boolean {
    if (exact) {
      return this.currentUrl === route;
    }

    return this.currentUrl === route || this.currentUrl.startsWith(`${route}/`);
  }

  logout(): void {
    this.auth.logout();
    this.mobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  openCartDrawer(): void {
    this.cartDrawerOpen = true;
    document.body.classList.add('overflow-hidden');
    requestAnimationFrame(() => this.updateNavPill());
  }

  closeCartDrawer(): void {
    this.cartDrawerOpen = false;
    document.body.classList.remove('overflow-hidden');
    requestAnimationFrame(() => this.updateNavPill());
  }

  increaseDrawerItem(productId: string): void {
    this.cart.increase(productId);
  }

  decreaseDrawerItem(productId: string): void {
    this.cart.decrease(productId);
  }

  removeDrawerItem(productId: string): void {
    this.cart.remove(productId);
    this.toast.success('Producto removido del carrito.');
  }

  clearDrawerItems(): void {
    this.cart.clear();
    this.toast.success('Carrito vaciado.');
  }

  goToCheckout(): void {
    this.closeCartDrawer();
    this.router.navigateByUrl('/checkout');
  }

  goToCartPage(): void {
    this.closeCartDrawer();
    this.router.navigateByUrl('/cart');
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
  }

  private updateBreadcrumbs(): void {
    if (this.currentUrl === '/') {
      this.breadcrumbs = [];
      return;
    }

    const routeNameMap: Record<string, string> = {
      catalog: 'Menu',
      cart: 'Carrito',
      checkout: 'Checkout',
      reservations: 'Reservas',
      profile: 'Mi cuenta',
      login: 'Login'
    };

    const key = this.currentUrl.split('/').filter(Boolean)[0] ?? '';
    const pageLabel = routeNameMap[key] ?? key;

    this.breadcrumbs = [{ label: 'Inicio', url: '/' }, { label: pageLabel }];
  }

  private updateNavPill(): void {
    const navElement = this.desktopNav?.nativeElement;
    const links = this.desktopNavLinks?.toArray() ?? [];
    if (!navElement || links.length === 0) {
      this.navPillStyle = { opacity: '0', transform: 'translateX(0px)', width: '0px' };
      return;
    }

    const activeByClass = links.find((linkRef) => linkRef.nativeElement.classList.contains('active'));
    if (activeByClass) {
      const node = activeByClass.nativeElement;
      this.navPillStyle = {
        opacity: '1',
        transform: `translateX(${node.offsetLeft}px)`,
        width: `${node.offsetWidth}px`
      };
      return;
    }

    const activeLink = links.find((linkRef) => {
      const node = linkRef.nativeElement;
      const route = node.dataset['route'] ?? '/';
      const exact = node.dataset['exact'] === 'true';
      return this.isRouteActive(route, exact);
    });

    if (!activeLink) {
      this.navPillStyle = { opacity: '0', transform: 'translateX(0px)', width: '0px' };
      return;
    }

    const activeNode = activeLink.nativeElement;
    const left = activeNode.offsetLeft;
    const width = activeNode.offsetWidth;

    this.navPillStyle = {
      opacity: '1',
      transform: `translateX(${left}px)`,
      width: `${width}px`
    };
  }
}

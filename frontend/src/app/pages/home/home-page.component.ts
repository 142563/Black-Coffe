import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Group, Material, Mesh, Object3D, PerspectiveCamera, PointLight, Scene, SpotLight, WebGLRenderer } from 'three';
import { AuthService } from '../../core/services/auth.service';
import { StorefrontService } from '../../core/services/storefront.service';
import { FeaturedMenuItem, StorefrontSettings } from '../../models/storefront.models';

type ThreeModule = typeof import('three');

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-page">
      <section
        class="hero-stage"
        [class.hero-stage--ready]="heroReady"
        [ngStyle]="heroStageStyle"
        (mousemove)="onHeroPointerMove($event)"
        (mouseleave)="onHeroPointerLeave()"
      >
        <div class="hero-stage__noise"></div>
        <div class="hero-stage__vignette"></div>
        <div class="hero-stage__cursor-light"></div>
        <div class="hero-stage__cursor-ember"></div>
        <div class="hero-stage__glow hero-stage__glow--left"></div>
        <div class="hero-stage__glow hero-stage__glow--right"></div>
        <div class="hero-stage__rim hero-stage__rim--top"></div>
        <div class="hero-stage__rim hero-stage__rim--bottom"></div>

        <div class="hero-stage__viewport">
          <div class="hero-stage__cup-track">
            <div class="hero-stage__cup-float">
              <div class="hero-stage__cup-tilt" [style.transform]="heroCupInteractiveTransform">
                <div class="hero-stage__cup-shadow"></div>
                <div class="hero-stage__cup-aura"></div>
                <div #cupCanvasHost class="hero-stage__cup-render" aria-hidden="true"></div>
              </div>
            </div>
          </div>

          <div class="hero-stage__brand" [style.transform]="heroBrandTransform">
            <img
              class="hero-stage__logo hero-stage__reveal hero-stage__reveal--logo"
              [src]="resolveLogoUrl(settings.logoUrl)"
              alt="Black Coffe"
            />
            <p class="hero-stage__brand-name hero-stage__reveal hero-stage__reveal--brand">{{ settings.name }}</p>
            <h1 class="hero-stage__headline hero-stage__reveal hero-stage__reveal--headline">Mas que una bebida...</h1>
            <p class="hero-stage__subheadline hero-stage__reveal hero-stage__reveal--subheadline">es un estilo de vida.</p>
            <p class="hero-stage__tagline hero-stage__reveal hero-stage__reveal--tagline">{{ settings.tagline }}</p>

            <div class="hero-stage__actions hero-stage__reveal hero-stage__reveal--actions">
              <a class="btn-primary hero-stage__cta-primary" routerLink="/catalog">Ver menu</a>
              <a class="btn-outline hero-stage__cta-secondary" routerLink="/reservations">Reservar</a>
            </div>
          </div>
        </div>
      </section>

      <div class="page-shell home-page__content" *ngIf="featured.length > 0">
        <section class="panel section home-page__featured" id="featured">
          <p class="section__eyebrow">SELECCION</p>
          <h2 class="section__title section__title--md">Favoritos de Black Coffe</h2>
          <div class="grid gap-4 md:grid-cols-3">
            <article class="featured-card" *ngFor="let item of featured">
              <div class="featured-card__image">
                <img [src]="resolveFeaturedImage(item.imageUrl)" [alt]="item.name" loading="lazy" />
              </div>
              <div class="space-y-2">
                <span class="badge">{{ item.badgeText }}</span>
                <h3>{{ item.name }}</h3>
                <p>Desde Q{{ item.priceFrom | number:'1.2-2' }}</p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  `
})
export class HomePageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cupCanvasHost', { static: true }) private readonly cupCanvasHost?: ElementRef<HTMLDivElement>;

  readonly fallbackImage = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80';
  readonly defaultLogo = 'assets/logo-black-coffe.jpeg';
  heroReady = false;
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private heroTiltX = 0;
  private heroTiltY = 0;
  private heroLightX = 50;
  private heroLightY = 32;
  private heroShiftX = 0;
  private heroShiftY = 0;
  private readonly pointerRotationTarget = { x: 0, y: 0 };
  private readonly pointerRotationCurrent = { x: 0, y: 0 };
  private readonly pointerLightTarget = { x: 0, y: 1.6, z: 5.8 };
  private readonly pointerLightCurrent = { x: 0, y: 1.6, z: 5.8 };
  private animationFrameId = 0;
  private sceneStartedAt = 0;
  private resizeObserver?: ResizeObserver;
  private prefersReducedMotion = false;
  private three?: ThreeModule;
  private renderer?: WebGLRenderer;
  private scene?: Scene;
  private camera?: PerspectiveCamera;
  private cupRig?: Group;
  private pointerLight?: PointLight;
  private keyLight?: SpotLight;
  private rimLight?: PointLight;

  settings: StorefrontSettings = {
    name: 'Black Coffe',
    tagline: 'Cafe premium, rapido y a tu manera',
    logoUrl: '/assets/logo-black-coffe.jpeg',
    accentColor: '#C6A15B',
    phone: '+502 0000-0000',
    whatsapp: '+502 0000-0000',
    address: 'Escuintla, Guatemala',
    hoursText: 'Lun-Vie 7:00-19:00 | Sab-Dom 8:00-18:00',
    businessMessage: 'Pedidos listos en 10-15 min | Calidad premium | Reservas disponibles',
    socialLinks: {
      instagram: 'https://instagram.com/',
      facebook: 'https://facebook.com/'
    }
  };

  featured: FeaturedMenuItem[] = [];

  constructor(
    public readonly auth: AuthService,
    private readonly storefrontService: StorefrontService
  ) {}

  async ngOnInit(): Promise<void> {
    setTimeout(() => {
      this.heroReady = true;
    }, 80);

    try {
      const [settings, featured] = await Promise.all([
        this.storefrontService.getSettings(),
        this.storefrontService.getFeatured()
      ]);
      this.settings = settings;
      this.featured = featured;
    } catch {
      this.featured = [];
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || !this.cupCanvasHost) {
      return;
    }

    this.prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    void this.initHeroScene();
  }

  ngOnDestroy(): void {
    this.disposeHeroScene();
  }

  resolveFeaturedImage(rawImage: string): string {
    if (!rawImage || rawImage.startsWith('/assets/products/')) {
      return this.fallbackImage;
    }

    return rawImage;
  }

  resolveLogoUrl(rawImage: string): string {
    if (!rawImage || rawImage.startsWith('/')) {
      return this.defaultLogo;
    }

    return rawImage;
  }

  get heroStageStyle(): Record<string, string> {
    return {
      '--pointer-x': `${this.heroLightX}%`,
      '--pointer-y': `${this.heroLightY}%`,
      '--light-shift-x': `${this.heroShiftX}px`,
      '--light-shift-y': `${this.heroShiftY}px`
    };
  }

  get heroCupInteractiveTransform(): string {
    return 'translate3d(0, 0, 0)';
  }

  get heroBrandTransform(): string {
    return `translate3d(${this.heroTiltY * -0.55}px, ${this.heroTiltX * 0.3}px, 0)`;
  }

  onHeroPointerMove(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement | null;
    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const normalizedX = (x - 0.5) * 2;
    const normalizedY = (y - 0.5) * 2;

    this.heroLightX = x * 100;
    this.heroLightY = y * 100;
    this.heroShiftX = normalizedX * 28;
    this.heroShiftY = normalizedY * 18;
    this.heroTiltY = this.clamp(normalizedX * 12, -12, 12);
    this.heroTiltX = this.clamp(normalizedY * -10, -10, 10);
    this.pointerRotationTarget.x = normalizedY * -0.16;
    this.pointerRotationTarget.y = normalizedX * 0.28;
    this.pointerLightTarget.x = normalizedX * 2.8;
    this.pointerLightTarget.y = 1.6 - normalizedY * 1.2;
    this.pointerLightTarget.z = 5.8;
  }

  onHeroPointerLeave(): void {
    this.heroTiltX = 0;
    this.heroTiltY = 0;
    this.heroLightX = 50;
    this.heroLightY = 32;
    this.heroShiftX = 0;
    this.heroShiftY = 0;
    this.pointerRotationTarget.x = 0;
    this.pointerRotationTarget.y = 0;
    this.pointerLightTarget.x = 0;
    this.pointerLightTarget.y = 1.6;
    this.pointerLightTarget.z = 5.8;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private async initHeroScene(): Promise<void> {
    const host = this.cupCanvasHost?.nativeElement;
    if (!host) {
      return;
    }

    this.three ??= await import('three');
    const THREE = this.three;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
    camera.position.set(0, 1.05, 10.4);
    camera.lookAt(0, 0.7, 0);

    const ambient = new THREE.AmbientLight(0x715735, 1.08);
    scene.add(ambient);

    const fillLight = new THREE.HemisphereLight(0xa87937, 0x080605, 1.1);
    scene.add(fillLight);

    const keyLight = new THREE.SpotLight(0xffdfb2, 24, 30, Math.PI / 7.2, 0.4, 1.05);
    keyLight.position.set(4.2, 6.4, 8.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0002;
    scene.add(keyLight);
    scene.add(keyLight.target);
    keyLight.target.position.set(0, 0.9, 0);

    const rimLight = new THREE.PointLight(0xc37a2d, 14, 24, 2.2);
    rimLight.position.set(-4.2, 1.1, -4.8);
    scene.add(rimLight);

    const pointerLight = new THREE.PointLight(0xefbf6d, 18, 20, 2);
    pointerLight.position.set(this.pointerLightTarget.x, this.pointerLightTarget.y, this.pointerLightTarget.z);
    scene.add(pointerLight);

    const cupRig = new THREE.Group();
    cupRig.visible = false;
    cupRig.position.y = this.prefersReducedMotion ? 0.24 : 6.1;
    cupRig.rotation.set(this.prefersReducedMotion ? -0.04 : 0.52, this.prefersReducedMotion ? 0.26 : -0.62, this.prefersReducedMotion ? -0.02 : -0.14);
    scene.add(cupRig);

    cupRig.visible = await this.loadCupModel(cupRig);

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.cupRig = cupRig;
    this.pointerLight = pointerLight;
    this.keyLight = keyLight;
    this.rimLight = rimLight;

    this.syncHeroSceneSize();

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.syncHeroSceneSize());
      this.resizeObserver.observe(host);
    }

    this.startHeroSceneLoop();
  }

  private async loadCupModel(cupRig: Group): Promise<boolean> {
    if (!this.three) {
      return false;
    }

    const THREE = this.three;

    try {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync('/models/vaso.glb');
      const model = gltf.scene;

      model.traverse((object: Object3D) => {
        const mesh = object as Mesh & { isMesh?: boolean; castShadow: boolean; receiveShadow: boolean };
        if (mesh.isMesh) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      this.fitCupModel(model, THREE);
      cupRig.add(model);
      return true;
    } catch (error) {
      console.error('No se pudo cargar public/models/vaso.glb', error);
      return false;
    }
  }

  private fitCupModel(model: Object3D, THREE: ThreeModule): void {
    const orientationBox = new THREE.Box3().setFromObject(model);
    const orientationSize = orientationBox.getSize(new THREE.Vector3());

    if (orientationSize.x > orientationSize.y && orientationSize.x > orientationSize.z) {
      model.rotation.z = Math.PI / 2;
    } else if (orientationSize.z > orientationSize.y && orientationSize.z > orientationSize.x) {
      model.rotation.x = -Math.PI / 2;
    }

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    model.position.x -= center.x;
    model.position.y -= center.y;
    model.position.z -= center.z;

    const desiredHeight = 7.2;
    const scale = desiredHeight / Math.max(size.y, 0.001);
    model.scale.setScalar(scale);

    const scaledBox = new THREE.Box3().setFromObject(model);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    const scaledSize = scaledBox.getSize(new THREE.Vector3());

    model.position.x -= scaledCenter.x;
    model.position.y -= scaledCenter.y - scaledSize.y * 0.08;
    model.position.z -= scaledCenter.z;
  }

  private startHeroSceneLoop(): void {
    if (!this.three) {
      return;
    }

    const THREE = this.three;

    this.ngZone.runOutsideAngular(() => {
      const renderFrame = (timestamp: number) => {
        if (!this.renderer || !this.scene || !this.camera || !this.cupRig) {
          return;
        }

        if (this.sceneStartedAt === 0) {
          this.sceneStartedAt = timestamp;
        }

        const elapsedMs = timestamp - this.sceneStartedAt;
        const introProgress = this.prefersReducedMotion ? 1 : Math.min(elapsedMs / 1650, 1);
        const introEase = this.easeOutCubic(introProgress);
        const settleEase = this.prefersReducedMotion ? 1 : this.easeOutBack(Math.min(elapsedMs / 1950, 1));

        this.pointerRotationCurrent.x += (this.pointerRotationTarget.x - this.pointerRotationCurrent.x) * 0.075;
        this.pointerRotationCurrent.y += (this.pointerRotationTarget.y - this.pointerRotationCurrent.y) * 0.075;
        this.pointerLightCurrent.x += (this.pointerLightTarget.x - this.pointerLightCurrent.x) * 0.08;
        this.pointerLightCurrent.y += (this.pointerLightTarget.y - this.pointerLightCurrent.y) * 0.08;
        this.pointerLightCurrent.z += (this.pointerLightTarget.z - this.pointerLightCurrent.z) * 0.08;

        const idleOffset = this.prefersReducedMotion || introProgress < 1
          ? 0
          : Math.sin(elapsedMs * 0.00115) * 0.12;

        this.cupRig.position.y = THREE.MathUtils.lerp(6.1, 0.24, introEase) + idleOffset;
        this.cupRig.position.x = this.pointerRotationCurrent.y * 0.45;
        this.cupRig.rotation.x = THREE.MathUtils.lerp(0.52, -0.04, settleEase) + this.pointerRotationCurrent.x;
        this.cupRig.rotation.y = THREE.MathUtils.lerp(-0.62, 0.26, settleEase) + this.pointerRotationCurrent.y;
        this.cupRig.rotation.z = THREE.MathUtils.lerp(-0.14, -0.02, settleEase) - this.pointerRotationCurrent.y * 0.12;

        if (this.pointerLight) {
          this.pointerLight.position.set(this.pointerLightCurrent.x, this.pointerLightCurrent.y, this.pointerLightCurrent.z);
        }

        if (this.keyLight) {
          this.keyLight.intensity = 30 + (this.pointerRotationCurrent.y * 8);
        }

        if (this.rimLight) {
          this.rimLight.position.x = -3.8 - this.pointerRotationCurrent.y * 1.1;
          this.rimLight.position.y = 0.6 + this.pointerRotationCurrent.x * 0.9;
        }

        this.renderer.render(this.scene, this.camera);
        this.animationFrameId = window.requestAnimationFrame(renderFrame);
      };

      this.animationFrameId = window.requestAnimationFrame(renderFrame);
    });
  }

  private syncHeroSceneSize(): void {
    const host = this.cupCanvasHost?.nativeElement;
    if (!host || !this.renderer || !this.camera) {
      return;
    }

    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);

    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private disposeHeroScene(): void {
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;

    if (this.scene) {
      this.scene.traverse((object: Object3D) => {
        const mesh = object as Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }

        const material = (mesh as { material?: Material | Material[] }).material;
        if (Array.isArray(material)) {
          material.forEach((item) => item.dispose());
        } else {
          material?.dispose();
        }
      });
    }

    this.renderer?.dispose();
    this.cupCanvasHost?.nativeElement.replaceChildren();
    this.renderer = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.cupRig = undefined;
    this.pointerLight = undefined;
    this.keyLight = undefined;
    this.rimLight = undefined;
  }

  private easeOutCubic(value: number): number {
    return 1 - Math.pow(1 - value, 3);
  }

  private easeOutBack(value: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
  }
}

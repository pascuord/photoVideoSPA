// src/app/shared/components/hero-carousel/hero-carousel.component.ts
import { Component, OnInit, inject, PLATFORM_ID, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, OnDestroy, signal, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

type Slide = {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  subtitle?: string;
  thumbnailUrl?: string;
  watermark_text?: string;
};

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <section class="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
    <swiper-container
      *ngIf="slides.length"
      #sc
      class="h-full"
      modules="navigation,pagination,keyboard,a11y,autoplay"
      navigation="true"
      pagination="true"
      pagination-clickable="true"
      keyboard="true"
      loop="true"
      slides-per-view="1"
      centered-slides="true"
      [attr.autoplay]="autoplayAttr"
      a11y="true"
      style="
        --swiper-navigation-color: white;
        --swiper-pagination-color: white;
        --swiper-navigation-size: 28px;
      ">
      <swiper-slide *ngFor="let s of slides; trackBy: trackId; let i = index">
        <div class="relative w-full h-full select-none">
          <img *ngIf="s.type==='image'"
               class="w-full h-full object-cover"
               [attr.fetchpriority]="i===0 ? 'high' : null"
               [attr.loading]="i===0 ? null : 'lazy'"
               [src]="s.thumbnailUrl || s.url"
               decoding="async"
               alt="" />

          <video *ngIf="s.type==='video'"
                 class="w-full h-full object-cover"
                 [attr.poster]="s.thumbnailUrl || null"
                 muted playsinline preload="metadata"></video>

          <!-- marca de agua -->
          <div class="pointer-events-none absolute inset-0 grid place-items-center opacity-25">
            <span class="text-2xl md:text-4xl font-bold -rotate-12">
              {{ s.watermark_text || '© Tu Marca' }}
            </span>
          </div>

          <!-- LEYENDA: transiciones con Tailwind (fade + slide-up) -->
          <div class="absolute inset-x-0 bottom-0 p-8 pointer-events-none">
            <div
              class="max-w-2xl rounded-2xl bg-neutral-900/40 backdrop-blur shadow-soft border border-white/10 p-6
                     transition-all duration-500 ease-out will-change-transform
                     opacity-0 translate-y-3"
              [class.opacity-100]="activeIdx() === i"
              [class.translate-y-0]="activeIdx() === i">
              <h2 class="font-display text-3xl md:text-5xl leading-tight transition-all duration-500 ease-out delay-75
                         opacity-0 translate-y-2"
                  [class.opacity-100]="activeIdx() === i"
                  [class.translate-y-0]="activeIdx() === i">
                {{ s.title }}
              </h2>
              <p class="mt-2 text-neutral-200/80 transition-all duration-500 ease-out delay-150
                        opacity-0 translate-y-2"
                 [class.opacity-100]="activeIdx() === i"
                 [class.translate-y-0]="activeIdx() === i">
                {{ s.subtitle }}
              </p>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper-container>
  </section>
  `
})
export class HeroCarouselComponent implements OnInit, AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  slides: Slide[] = [];
  autoplayAttr: string | null = null;

  // índice activo para la transición de leyenda
  activeIdx = signal(0);

  private cleanup: Array<() => void> = [];

  private uiBound = false;
  @ViewChild('sc', { static: false, read: ElementRef }) scRef?: ElementRef<HTMLElement>;
  private cd = inject(ChangeDetectorRef);
  private elHost = inject(ElementRef<HTMLElement>);
  // Helper: espera hasta que exista el swiper en el DOM (máx N intentos)
  private async waitForSwiper(maxTries = 50, interval = 40): Promise<HTMLElement | null> {
    for (let i = 0; i < maxTries; i++) {
      const el =
        this.scRef?.nativeElement ??
        (this.elHost.nativeElement.querySelector('swiper-container') as HTMLElement | null);
      if (el) return el;
      await new Promise(r => setTimeout(r, interval));
    }
    return null;
  }

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const { register } = await import('swiper/element/bundle');
    register();

    const base = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:3000';
  const list = await firstValueFrom(this.http.get<Slide[]>(`${base}/api/media?limit=6`));
    this.slides = (list ?? []).map((m) => ({ ...m, type: (m as any).type || 'image' }));

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.autoplayAttr = reduce
      ? null
      : JSON.stringify({ delay: 4500, pauseOnMouseEnter: true, disableOnInteraction: false });

    // Empuja un ciclo para que se pinte el *ngIf y el #sc
    this.cd.detectChanges();

    // Espera a que el elemento exista y entonces engancha UI
    const el = await this.waitForSwiper();
    if (el) this.bindSwiperUI(el); // ⬅️ pásale el elemento
  }

  ngAfterViewInit() {
    // Fallback: si por timing aún no estaba, reintenta una vez más
    queueMicrotask(async () => {
      if (this.uiBound) return;
      const el = await this.waitForSwiper();
      if (el) this.bindSwiperUI(el);
    });
  }

  private async bindSwiperUI(el: HTMLElement) {
    console.log('bindSwiperUI', this.uiBound, this.scRef);
    if (this.uiBound) return;
    // Espera a que el custom element esté definido e inicializado
    await customElements.whenDefined('swiper-container');

    // Espera a que Swiper cree el shadowRoot y la instancia .swiper
    await new Promise<void>((resolve) => {
      if ((el as any).swiper) return resolve();
      const id = setInterval(() => {
        if ((el as any).swiper) {
          clearInterval(id);
          resolve();
        }
      }, 30);
      this.cleanup.push(() => clearInterval(id));
    });

    this.uiBound = true;

    // Índice activo inicial + prefetch
    this.activeIdx.set((el as any).swiper?.realIndex ?? 0);
    this.prefetchAround(this.activeIdx());

    const onSlideChange = () => {
      const idx = (el as any).swiper?.realIndex ?? (el as any).swiper?.activeIndex ?? 0;
      this.activeIdx.set(idx);
      this.prefetchAround(idx);
    };
    el.addEventListener('slidechange', onSlideChange);
    this.cleanup.push(() => el.removeEventListener('slidechange', onSlideChange));

    // Respeta prefers-reduced-motion para no cargar animaciones
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) this.bindMotionForUI(el);
  }

  private async bindMotionForUI(el: HTMLElement) {
    // Motion One
    const { animate } = await import('motion');
    const root: Document | ShadowRoot = (el.shadowRoot ?? document);

    // Flechas
    const next = root.querySelector('.swiper-button-next') as HTMLElement | null;
    const prev = root.querySelector('.swiper-button-prev') as HTMLElement | null;
    const press = (n: HTMLElement) => {
      const inA  = () => animate(n, { transform: 'scale(1.08)' }, { duration: 0.25 });
      const outA = () => animate(n, { transform: 'scale(1)' },    { duration: 0.25 });
      const dnA  = () => animate(n, { transform: 'scale(0.95)' }, { duration: 0.15 });
      const upA  = () => animate(n, { transform: 'scale(1.08)' }, { duration: 0.18 });
      n.addEventListener('mouseenter', inA);
      n.addEventListener('mouseleave', outA);
      n.addEventListener('pointerdown', dnA);
      n.addEventListener('pointerup',   upA);
      this.cleanup.push(() => {
        n.removeEventListener('mouseenter', inA);
        n.removeEventListener('mouseleave', outA);
        n.removeEventListener('pointerdown', dnA);
        n.removeEventListener('pointerup',   upA);
      });
    };
    if (next) press(next);
    if (prev) press(prev);

    // Bullets (se regeneran → observa y re-aplica)
    const bindBullets = () => {
      const bullets = root.querySelectorAll('.swiper-pagination-bullet') as NodeListOf<HTMLElement>;
      bullets.forEach((b) => {
        const enter = () => animate(b, { transform: 'scale(1.12)' }, { duration: 0.2 });
        const leave = () => animate(b, { transform: 'scale(1)' },    { duration: 0.2 });
        b.addEventListener('mouseenter', enter);
        b.addEventListener('mouseleave', leave);
        this.cleanup.push(() => {
          b.removeEventListener('mouseenter', enter);
          b.removeEventListener('mouseleave', leave);
        });
      });
    };
    bindBullets();

    const pag = root.querySelector('.swiper-pagination');
    if (pag) {
      const mo = new MutationObserver(() => bindBullets());
      mo.observe(pag, { childList: true, subtree: true });
      this.cleanup.push(() => mo.disconnect());
    }
  }

  ngOnDestroy(): void {
    this.cleanup.forEach((fn) => fn());
  }

  trackId = (_: number, s: Slide) => s.id;

  // --- Prefetch de la siguiente(s) imagen(es) ---
  private prefetched = new Set<string>();
  private prefetchImage(url?: string) {
    if (!url || this.prefetched.has(url)) return;
    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = url;
    this.prefetched.add(url);
  }
  private prefetchAround(activeIndex: number) {
    if (!this.slides?.length) return;
    const next = (activeIndex + 1) % this.slides.length;
    const nn   = (activeIndex + 2) % this.slides.length;
    const u1 = this.slides[next].url || (this.slides[next] as any).storage_path;
    const u2 = this.slides[nn].url  || (this.slides[nn]  as any).storage_path;
    this.prefetchImage(u1);
    this.prefetchImage(u2);
  }
}

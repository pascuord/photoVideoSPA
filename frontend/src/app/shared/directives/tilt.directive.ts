import {
  Directive, ElementRef, Input, OnInit, OnDestroy, inject, PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appTilt]',
  standalone: true,
})
export class TiltDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);

  /** Permite sobreescribir opciones por atributo: [appTilt]="{ max: 6 }" */
  @Input('appTilt') opts?: Partial<{
    max: number;
    speed: number;
    perspective: number;
    scale: number;
    glare: boolean;
    'max-glare': number;
    gyroscope: boolean;
  }>;

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Solo habilitar en escritorio con puntero “fine” y sin reduce-motion
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const isDesktop = window.innerWidth >= 1024;
    if (reduce || !finePointer || !isDesktop) return;

    const { default: VanillaTilt } = await import('vanilla-tilt');

    const defaultOpts = {
      max: 4,
      speed: 500,
      perspective: 900,
      scale: 1.02,
      glare: false,
      gyroscope: false,
    };

    VanillaTilt.init(this.el.nativeElement, { ...defaultOpts, ...(this.opts ?? {}) });
  }

  ngOnDestroy() {
    try {
      (this.el.nativeElement as any)?.vanillaTilt?.destroy?.();
    } catch {}
  }
}

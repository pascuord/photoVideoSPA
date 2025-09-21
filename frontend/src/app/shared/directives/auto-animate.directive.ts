import {
  Directive, ElementRef, Input, OnInit, OnDestroy, inject, PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appAutoAnimate]',
  standalone: true,
})
export class AutoAnimateDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);

  // Puedes pasar opciones: [appAutoAnimate]="{ duration: 180, easing: 'ease-out' }"
  @Input('appAutoAnimate') options?: any;

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const { default: autoAnimate } = await import('@formkit/auto-animate');
    autoAnimate(this.el.nativeElement, this.options ?? { duration: 180, easing: 'ease-out' });
  }

  ngOnDestroy() {
    try {
      // La lib añade un controlador en el elemento:
      (this.el.nativeElement as any)?.autoAnimate?.disable?.();
    } catch {}
  }
}

// src/app/shared/components/like-button.component.ts
import { Component, Input, OnInit, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { InteractService, StatsDto } from '../../core/services/interact.service';
import { PLATFORM_ID } from '@angular/core';
import { LoginModalService } from '../../core/services/login-modal.service';
import { PendingActionService } from '../../core/services/pending-action.service';

@Component({
  selector: 'app-like-button',
  standalone: true,
  imports: [CommonModule],
  template: `
  <button
    #btn
    type="button"
    [disabled]="pending()"
    (click)="onToggle()"
    [attr.aria-pressed]="liked()"
    [attr.aria-label]="liked() ? 'Quitar me gusta' : 'Me gusta'"
    class="relative inline-flex items-center justify-center rounded-full p-2
           bg-black/60 text-white/90 backdrop-blur border border-white/10
           transition hover:scale-105 active:scale-95 focus-ring
           disabled:opacity-60 disabled:cursor-not-allowed"
    [class.bg-pink-600/90]="liked()"
    [class.border-pink-500/60]="liked()"
  >
    <svg class="w-5 h-5"
         viewBox="0 0 24 24"
         [attr.fill]="liked() ? 'currentColor' : 'none'"
         stroke="currentColor"
         stroke-width="1.5">
      <path d="M12 21s-6.716-4.432-9.33-8.043C.76 10.66 1.26 7.5 3.64 6.02c1.66-1.05 3.85-.72 5.26.68L12 9.8l3.1-3.1c1.41-1.4 3.6-1.73 5.26-.68 2.38 1.48 2.88 4.64.97 6.94C18.716 16.568 12 21 12 21z"/>
    </svg>

    <span *ngIf="likes() > 0"
          class="absolute -right-2 -top-1 text-[10px] leading-none rounded-full
                 bg-black/70 border border-white/10 px-1 py-0.5">
      {{ likes() }}
    </span>

    <!-- capa para confetti -->
    <span #fx class="pointer-events-none absolute -inset-8 overflow-visible"></span>
  </button>
  `,
})
export class LikeButtonComponent implements OnInit {
  @Input({ required: true }) contentType!: 'image' | 'video' | 'post';
  @Input({ required: true }) contentId!: string;
  @Input() preloadStats?: StatsDto;

  @ViewChild('btn', { static: true }) btnRef!: ElementRef<HTMLElement>;
  @ViewChild('fx', { static: true }) fxRef!: ElementRef<HTMLElement>;

  private it = inject(InteractService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private loginModal = inject(LoginModalService);
  private pendingSvc = inject(PendingActionService);

  likes = signal(0);
  liked = signal(false);
  pending = signal(false);

  private reduce = true;

  async ngOnInit() {
    try {
      if (this.preloadStats) {
        this.likes.set(this.preloadStats.likes);
        this.liked.set(!!(this.preloadStats as any).likedByMe);
      } else {
        const s: any = await this.it.getStats(this.contentType, this.contentId);
        this.likes.set(s.likes ?? 0);
        this.liked.set(!!s.likedByMe);
      }
    } catch (e) {
      console.warn('No se pudieron cargar stats:', e);
    }

    if (isPlatformBrowser(this.platformId)) {
      this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  async onToggle() {
    if (this.pending()) return; // evita doble click

    // No logueado → guardamos intención + modal (fallback redirección si cierra)
    if (!(await this.it.isLoggedIn())) {
      this.pendingSvc.queueLike(this.contentType, this.contentId);
      const result = await this.loginModal.open();
      if (result === 'closed') {
        this.router.navigate(['/auth'], { queryParams: { redirect: this.router.url } });
      }
      return;
    }

    // --- flujo con sesión ---
    const btnEl = this.btnRef?.nativeElement ?? null;
    const prevLiked = this.liked();
    const prevLikes = this.likes();

    try {
      this.pending.set(true);

      // Micro-bounce seguro
      if (!this.reduce && isPlatformBrowser(this.platformId) && btnEl) {
        const { animate } = await import('motion');
        animate(btnEl, { transform: ['scale(1)', 'scale(1.15)', 'scale(1)'] }, { duration: 0.28 });
      }

      // Optimistic UI
      this.liked.set(!prevLiked);
      this.likes.set(prevLikes + (prevLiked ? -1 : 1));

      if (!prevLiked && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }

      // Llamada real
      const r = await this.it.toggleLike(this.contentType, this.contentId);

      // Ajuste si difiere
      if (r.liked !== this.liked()) {
        this.liked.set(r.liked);
        this.likes.set(prevLikes + (r.liked ? 1 : 0) - (prevLiked ? 1 : 0));
      }

      // Confetti
      if (
        !prevLiked &&
        this.liked() &&
        !this.reduce &&
        isPlatformBrowser(this.platformId) &&
        btnEl
      ) {
        this.fireConfetti(btnEl);
      }
    } catch (e) {
      this.liked.set(prevLiked);
      this.likes.set(prevLikes);
      console.error('Error toggling like:', e);
      alert('No se pudo actualizar el like. Comprueba tu conexión o sesión.');
    } finally {
      this.pending.set(false);
    }
  }

  private async fireConfetti(anchorEl?: HTMLElement) {
    if (!isPlatformBrowser(this.platformId)) return;
    const host = this.fxRef?.nativeElement;
    if (!host) return;

    host.style.overflow = 'visible';

    const size = Math.max(180, (anchorEl?.offsetWidth ?? 48) * 3);
    const box = document.createElement('span');
    Object.assign(box.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: `${size}px`,
      height: `${size}px`,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: '60',
      display: 'block',
    } as CSSStyleDeclaration);
    host.appendChild(box);

    const cleanup = (anim?: any) => {
      try {
        anim?.destroy?.();
      } catch {}
      box.remove();
    };

    try {
      const [{ default: lottie }, { confettiData }] = await Promise.all([
        import('lottie-web'),
        import('../../shared/lottie/confetti.data'),
      ]);

      const anim = lottie.loadAnimation({
        container: box,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData: confettiData as any,
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice', hideOnTransparent: true },
      });

      let started = false;
      const start = () => {
        if (!started) {
          started = true;
          anim.goToAndPlay(0, true);
        }
      };

      anim.addEventListener('DOMLoaded', start);
      anim.addEventListener('complete', () => cleanup(anim));

      setTimeout(start, 120);
      setTimeout(() => {
        const g = box.querySelector('svg g');
        if (!g || (g as SVGGElement).childElementCount === 0) {
          cleanup(anim);
          this.fireCanvasConfetti(host, size);
        }
      }, 220);
    } catch (e) {
      console.error('Lottie failed, using fallback:', e);
      this.fireCanvasConfetti(host, size);
    }
  }

  private async fireCanvasConfetti(host: HTMLElement, size: number) {
    const { default: confetti } = await import('canvas-confetti');

    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: `${size}px`,
      height: `${size}px`,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: '60',
    } as CSSStyleDeclaration);
    canvas.width = size;
    canvas.height = size;
    host.appendChild(canvas);

    const fire = confetti.create(canvas, { resize: false, useWorker: true });
    fire({
      particleCount: 26,
      startVelocity: 34,
      spread: 75,
      scalar: 0.75,
      ticks: 140,
      origin: { x: 0.5, y: 0.5 },
      disableForReducedMotion: true,
    });

    setTimeout(() => canvas.remove(), 1200);
  }
}

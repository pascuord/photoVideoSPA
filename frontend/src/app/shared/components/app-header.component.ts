// src/app/shared/components/app-header/app-header.component.ts
import {
  Component,
  HostListener,
  inject,
  signal,
  ElementRef,
  PLATFORM_ID,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
// import { animate } from 'motion/dom'; // Removed, use dynamic import below

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-300 pt-[env(safe-area-inset-top)]"
    [class.bg-neutral-950/70]="scrolled()"
    [class.backdrop-blur]="scrolled()"
    [class.shadow-soft]="scrolled()"
  >
    <div class="mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
      <!-- Brand -->
      <a
        routerLink="/"
        class="font-display text-xl md:text-2xl select-none inline-flex items-center gap-2 focus-ring rounded-full px-2 py-1"
        data-press-anim
      >
        <span class="inline-block rounded-full w-2 h-2 bg-brand-400"></span>
        <span class="text-green-300" [textContent]="'<pascuord/>'"></span>
      </a>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-2 text-sm" role="navigation" aria-label="Principal">
        <!-- Inicio -->
        <a
          routerLink="/"
          routerLinkActive="text-white"
          [routerLinkActiveOptions]="{ exact: true }"
          #rlaHome="routerLinkActive"
          [attr.aria-current]="rlaHome.isActive ? 'page' : null"
          class="group relative px-3 py-2 rounded-full hover:bg-white/5 transition inline-flex items-center gap-2 opacity-90 hover:opacity-100 focus-ring"
          data-press-anim
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.2 3 10h2v9h5v-6h4v6h5v-9h2l-9-6.8Z"/></svg>
          <span>Inicio</span>
          <span
            class="pointer-events-none absolute left-3 right-3 -bottom-0.5 h-0.5 bg-brand-400 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"
            [class.scale-x-100]="rlaHome.isActive"
          ></span>
        </a>

        <!-- Galería -->
        <a
          routerLink="/gallery"
          routerLinkActive="text-white"
          #rlaGal="routerLinkActive"
          [attr.aria-current]="rlaGal.isActive ? 'page' : null"
          class="group relative px-3 py-2 rounded-full hover:bg-white/5 transition inline-flex items-center gap-2 opacity-90 hover:opacity-100 focus-ring"
          data-press-anim
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2 10 3.5-4.5 2.5 3 3.5-4.5L20 15H6Z"/><circle cx="8" cy="8" r="1.25"/></svg>
          <span>Galería</span>
          <span
            class="pointer-events-none absolute left-3 right-3 -bottom-0.5 h-0.5 bg-brand-400 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"
            [class.scale-x-100]="rlaGal.isActive"
          ></span>
        </a>

        <!-- Blog -->
        <a
          routerLink="/blog"
          routerLinkActive="text-white"
          #rlaBlog="routerLinkActive"
          [attr.aria-current]="rlaBlog.isActive ? 'page' : null"
          class="group relative px-3 py-2 rounded-full hover:bg-white/5 transition inline-flex items-center gap-2 opacity-90 hover:opacity-100 focus-ring"
          data-press-anim
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 4h14v2H5V4Zm0 4h14v2H5V8Zm0 4h9v2H5v-2Zm0 4h9v2H5v-2Z"/></svg>
          <span>Blog</span>
          <span
            class="pointer-events-none absolute left-3 right-3 -bottom-0.5 h-0.5 bg-brand-400 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"
            [class.scale-x-100]="rlaBlog.isActive"
          ></span>
        </a>

        <!-- Auth -->
        <ng-container *ngIf="auth.isLoggedIn(); else signinDesktop">
          <span class="mx-1 h-5 w-px bg-white/10"></span>
          <span class="opacity-80 hidden lg:inline">Hola, {{ auth.user()?.email }}</span>
          <button
            class="ml-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500 text-white hover:bg-brand-600 focus-ring"
            (click)="logout()"
            data-press-anim
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 17v-2h4v2h-4Zm-2-8h8v2H8V9Zm3-7h2v4h-2V2ZM4 11h2v2H4v-2Zm14 0h2v2h-2v-2Zm-7 9h2v2h-2v-2Z"/></svg>
            Salir
          </button>
        </ng-container>
        <ng-template #signinDesktop>
          <a
            routerLink="/auth"
            [queryParams]="{ redirect: router.url }"
            class="ml-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 text-white/90 hover:bg-white/10 focus-ring"
            data-press-anim
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-8 2.5-8 5v1h16v-1c0-2.5-3-5-8-5Z"/></svg>
            Acceder
          </a>
        </ng-template>
      </nav>

      <!-- Mobile: hamburguesa -->
      <button
        class="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 focus-ring"
        (click)="mobileOpen.set(true)"
        aria-label="Abrir menú"
        aria-haspopup="true"
        [attr.aria-expanded]="mobileOpen()"
        data-press-anim
      >
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/></svg>
      </button>
    </div>

    <!-- Mobile panel -->
    <div
      *ngIf="mobileOpen()"
      class="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      (click)="mobileOpen.set(false)"
    >
      <nav
        class="absolute right-0 top-0 h-full w-[75vw] max-w-xs bg-neutral-950 shadow-xl p-4 flex flex-col gap-1"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-label="Menú móvil"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold">Menú</span>
          <button
            class="w-10 h-10 grid place-items-center rounded-full hover:bg-white/10 focus-ring"
            (click)="mobileOpen.set(false)"
            aria-label="Cerrar menú"
            data-press-anim
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="m6 6 12 12M6 18 18 6"/></svg>
          </button>
        </div>

        <a routerLink="/" (click)="mobileOpen.set(false)"
           class="px-3 py-2 rounded-lg hover:bg-white/10 inline-flex items-center gap-3 focus-ring"
           data-press-anim>
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2 3 10h2v9h5v-6h4v6h5v-9h2l-9-6.8Z"/></svg>
          Inicio
        </a>
        <a routerLink="/gallery" (click)="mobileOpen.set(false)"
           class="px-3 py-2 rounded-lg hover:bg-white/10 inline-flex items-center gap-3 focus-ring"
           data-press-anim>
          <svg class="w-5 h-5" viewBox="0 0 24 24  " fill="currentColor"><path d="M4 5h16v14H4V5Zm2 10 3.5-4.5 2.5 3 3.5-4.5L20 15H6Z"/></svg>
          Galería
        </a>
        <a routerLink="/blog" (click)="mobileOpen.set(false)"
           class="px-3 py-2 rounded-lg hover:bg-white/10 inline-flex items-center gap-3 focus-ring"
           data-press-anim>
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h14v2H5V4Zm0 4h14v2H5V8Zm0 4h9v2H5v-2Zm0 4h9v2H5v-2Z"/></svg>
          Blog
        </a>

        <div class="mt-2 pt-2 border-t border-white/10">
          <ng-container *ngIf="auth.isLoggedIn(); else signinMobile">
            <div class="px-3 py-2 text-sm opacity-80">Hola, {{ auth.user()?.email }}</div>
            <button
              class="mt-2 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-brand-500 text-white hover:bg-brand-600 focus-ring"
              (click)="logout(); mobileOpen.set(false)"
              data-press-anim
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16 13v-2H7V8l-5 4 5 4v-3h9Z"/></svg>
              Salir
            </button>
          </ng-container>
          <ng-template #signinMobile>
            <a
              routerLink="/auth"
              [queryParams]="{ redirect: router.url }"
              class="mt-2 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-white/15 hover:bg-white/10 focus-ring"
              data-press-anim
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-8 2.5-8 5v1h16v-1c0-2.5-3-5-8-5Z"/></svg>
              Acceder
            </a>
          </ng-template>
        </div>
      </nav>
    </div>
  </header>
  `,
})
export class AppHeaderComponent implements AfterViewInit, OnDestroy {
  auth = inject(AuthService);
  router = inject(Router);
  el = inject(ElementRef<HTMLElement>);
  platformId = inject(PLATFORM_ID);

  scrolled = signal(false);
  mobileOpen = signal(false);

  private _cleanup: Array<() => void> = [];

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 8);
  }

  async logout() {
    await this.auth.signOut();
  }

  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Respeta accesibilidad
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    // Importa Motion One solo en cliente
    const { animate } = await import('motion');

    // Aplica micro-interacciones a todos los marcados con data-press-anim
    const pressables = this.el.nativeElement.querySelectorAll(
      '[data-press-anim]',
    ) as NodeListOf<HTMLElement>;

    pressables.forEach((el) => {
      const onEnter = () => animate(el, { scale: 1.04 }, { duration: 0.18 });

      const onLeave = () => animate(el, { scale: 1 }, { duration: 0.18 });

      const onDown = () => animate(el, { scale: 0.97 }, { duration: 0.1 });

      const onUp = () => animate(el, { scale: 1.04 }, { duration: 0.16 });

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointerup', onUp);

      this._cleanup.push(() => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('pointerup', onUp);
      });
    });
  }

  ngOnDestroy() {
    this._cleanup.forEach((fn) => fn());
  }
}

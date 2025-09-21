import {
  Component,
  OnInit,
  AfterViewInit,
  PLATFORM_ID,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { AntiDownloadDirective } from '../shared/directives/anti-download.directive';
import { LikeButtonComponent } from '../shared/components/like-button.component';
import { TiltDirective } from '../shared/directives/tilt.directive';
import { AutoAnimateDirective } from '../shared/directives/auto-animate.directive';
import { RouterLink } from '@angular/router';

interface ImportMetaEnv {
  [key: string]: string | undefined;
}
interface ImportMeta {
  env: ImportMetaEnv;
}

type MediaItem = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  watermark_text?: string;
  postSlug?: string;
  hasPost: boolean;
};

@Component({
  selector: 'app-gallery-page',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    AntiDownloadDirective,
    LikeButtonComponent,
    // ⬇️ activamos las directivas visuales
    TiltDirective,
    AutoAnimateDirective,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-screen-xl px-4 py-8" appAntiDownload>
      <h1 class="font-display text-3xl mb-6">Galería</h1>

      @if (loading()) {
      <!-- Skeleton -->
      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        @for (s of [1,2,3,4,5,6,7,8]; track s) {
        <div class="h-48 rounded-2xl skel"></div>
        }
      </div>
      } @else { @if (error()) {
      <div
        class="mb-4 rounded border border-red-500/20 bg-red-950/30 p-3 text-red-300"
      >
        {{ error() }}
        <button class="ml-2 underline" (click)="reload()">Reintentar</button>
      </div>
      } @if (items().length === 0) {
      <p class="text-neutral-400">No hay elementos aún.</p>
      } @else {

      <!-- Grid animado (mejor que masonry para auto-animate) -->
      <div
        class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        appAutoAnimate
        [appAutoAnimate]="{ duration: 180, easing: 'ease-out' }"
      >
        @for (m of items(); track m.id) {
        <ng-container
          [ngTemplateOutlet]="card"
          [ngTemplateOutletContext]="{ $implicit: m }"
        ></ng-container>
        }
      </div>

      <!-- Template reutilizable de card -->
      <ng-template #card let-m>
        <!-- Si hay postSlug → toda la card es un enlace -->
        <a
          *ngIf="m.postSlug; else noLinkCard"
          class="group block"
          [routerLink]="['/blog', m.postSlug]"
          [attr.aria-label]="'Abrir post: ' + m.title"
        >
          <article
            style="content-visibility:auto; contain-intrinsic-size: 400px"
            class="relative overflow-hidden rounded-2xl shadow-soft
             transform-gpu will-change-transform transition
             hover:-translate-y-0.5 hover:shadow-xl"
            (contextmenu)="$event.preventDefault()"
            [appTilt]="{ max: 4, scale: 1.02, speed: 500, perspective: 900 }"
          >
            <div class="relative w-full aspect-[4/3] overflow-hidden">
              <!-- Low-res borrosa mientras carga -->
              <img
                *ngIf="
                  m.thumbnailUrl && m.thumbnailUrl !== m.url && !isLoaded(m.id)
                "
                [src]="m.thumbnailUrl"
                [alt]="m.title"
                class="absolute inset-0 w-full h-full object-cover select-none pointer-events-none
                    blur-sm scale-[1.02] opacity-80 transition-opacity duration-300"
                loading="lazy"
                decoding="async"
              />

              <!-- Hi-res con fade-in -->
              <img
                [src]="hiResSrc(m)"
                [alt]="m.title"
                class="absolute inset-0 w-full h-full object-cover select-none pointer-events-none
                 opacity-0 transition-opacity duration-500"
                [class.opacity-100]="isLoaded(m.id)"
                (load)="markLoaded(m.id)"
                loading="lazy"
                decoding="async"
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                (error)="onImgError(m, $event)"
              />
            </div>

            <!-- Marca de agua sutil -->
            <div
              class="pointer-events-none absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-25 transition"
            >
              <span class="text-2xl font-bold -rotate-12">{{
                m.watermark_text || '© Tu Marca'
              }}</span>
            </div>

            <!-- Barra de acciones -->
            <div
              class="absolute inset-x-3 bottom-3 flex items-center justify-between"
            >
              <div
                class="rounded-full bg-black/50 backdrop-blur px-3 py-1 text-xs text-white/90"
              >
                {{ m.title }}
              </div>

              <!-- Chip “Ver post” -->
              <div class="transition hover:scale-105 active:scale-95">
                <span
                  class="pointer-events-none rounded-full bg-white/80 text-black text-[11px] px-2 py-1
                      opacity-0 group-hover:opacity-100 border border-black/10"
                >
                  Ver post
                </span>  
              </div>               
              <div class="pointer-events-auto">
                @defer (on viewport) {
                <app-like-button
                  [contentType]="'image'"
                  [contentId]="m.id"
                ></app-like-button>
                } @placeholder {
                <div
                  class="px-3 py-1.5 rounded-full border border-white/20 text-white/70 text-xs bg-black/40 backdrop-blur"
                >
                  ♡ Like
                </div>
                }
              </div>
            </div>
          </article>
        </a>

        <!-- Sin postSlug → card sin enlace (igual que ahora) -->
        <ng-template #noLinkCard>
          <article
            style="content-visibility:auto; contain-intrinsic-size: 400px"
            class="relative overflow-hidden rounded-2xl group shadow-soft
             transform-gpu will-change-transform transition
             hover:-translate-y-0.5 hover:shadow-xl"
            (contextmenu)="$event.preventDefault()"
            [appTilt]="{ max: 4, scale: 1.02, speed: 500, perspective: 900 }"
          >
            <div class="relative w-full aspect-[4/3] overflow-hidden">
              <img
                *ngIf="
                  m.thumbnailUrl && m.thumbnailUrl !== m.url && !isLoaded(m.id)
                "
                [src]="m.thumbnailUrl"
                [alt]="m.title"
                class="absolute inset-0 w-full h-full object-cover select-none pointer-events-none
                    blur-sm scale-[1.02] opacity-80 transition-opacity duration-300"
                loading="lazy"
                decoding="async"
              />

              <img
                [src]="hiResSrc(m)"
                [alt]="m.title"
                class="absolute inset-0 w-full h-full object-cover select-none pointer-events-none
                 opacity-0 transition-opacity duration-500"
                [class.opacity-100]="isLoaded(m.id)"
                (load)="markLoaded(m.id)"
                loading="lazy"
                decoding="async"
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                (error)="onImgError(m, $event)"
              />
            </div>

            <div
              class="pointer-events-none absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-25 transition"
            >
              <span class="text-2xl font-bold -rotate-12">{{
                m.watermark_text || '© Tu Marca'
              }}</span>
            </div>

            <div
              class="absolute inset-x-3 bottom-3 flex items-center justify-between"
            >
              <div
                class="rounded-full bg-black/50 backdrop-blur px-3 py-1 text-xs text-white/90"
              >
                {{ m.title }}
              </div>

              <div class="pointer-events-auto">
                @defer (on viewport) {
                <app-like-button
                  [contentType]="'image'"
                  [contentId]="m.id"
                ></app-like-button>
                } @placeholder {
                <div
                  class="px-3 py-1.5 rounded-full border border-white/20 text-white/70 text-xs bg-black/40 backdrop-blur"
                >
                  ♡ Like
                </div>
                }
              </div>
            </div>
          </article>
        </ng-template>
      </ng-template>

      } }
    </section>
  `,
})
export default class GalleryPage implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  items = signal<MediaItem[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loaded = new Set<string>();
  markLoaded(id: string) {
    this.loaded.add(id);
  }
  isLoaded(id: string) {
    return this.loaded.has(id);
  }

  hiResSrc(m: MediaItem) {
    return m.url && m.thumbnailUrl && m.thumbnailUrl !== m.url
      ? m.url
      : m.url || m.thumbnailUrl || '';
  }

  ngOnInit() {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.load(true);
    }
  }

  reload() {
    this.load(true);
  }

  private load(force = false) {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!force && this.items().length) return;

    this.loading.set(true);
    this.error.set(null);

    const base =
      ((import.meta as any)['env']?.['VITE_API_BASE_URL'] as string) ??
      'http://localhost:3000';

    this.http
      .get<MediaItem[]>(`${base}/api/media`, { withCredentials: false })
      .pipe(
        catchError((err) => {
          const msg = err?.message ?? `Error cargando la galería`;
          this.error.set(msg);
          return of<MediaItem[]>([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((list) => this.items.set(list ?? []));
  }

  onImgError(m: MediaItem, ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (m.thumbnailUrl && img.src.includes(m.thumbnailUrl)) {
      img.src = m.url;
    } else {
      img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
    }
  }
}

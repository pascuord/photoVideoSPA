import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

type LinkedMedia = { type: 'image'|'video'; url: string; thumbnailUrl?: string; title?: string; watermark_text?: string; slug: string; };
type BlogPost = { id: string; slug: string; title: string; coverUrl?: string; created_at: string; linkedMedia?: LinkedMedia; body: string; };

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterLink],
  template: `
<section class="relative p-6 max-w-6xl mx-auto">
  
  <header class="mb-6 flex items-end justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold">Blog</h1>
      <p class="text-sm text-white/60">Artículos, notas y making-of.</p>
    </div>
  </header>

  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <a *ngFor="let p of posts"
       [routerLink]="['/blog', p.slug]"
       (contextmenu)="$event.preventDefault()"
       class="group relative overflow-hidden rounded-2xl
              bg-white/5 backdrop-blur-sm border border-white/10
              shadow-sm hover:shadow-xl hover:border-white/20
              transition-all duration-300">

      <!-- Media -->
      <div class="relative aspect-video overflow-hidden">
        <img
          *ngIf="p.coverUrl || p.linkedMedia?.thumbnailUrl || p.linkedMedia?.url; else noCover"
          [src]="p.coverUrl || p.linkedMedia?.thumbnailUrl || p.linkedMedia?.url"
          [alt]="p.title"
          class="h-full w-full object-cover select-none pointer-events-none"
          draggable="false"
        />

        <ng-template #noCover>
          <div class="h-full w-full grid place-items-center text-sm text-white/60 bg-white/5">
            No cover
          </div>
        </ng-template>

        <!-- Degradado para legibilidad -->
        <div class="pointer-events-none absolute inset-0
                    bg-gradient-to-t from-black/60 via-black/0 to-transparent"></div>

        <!-- Badge de tipo si hay linkedMedia -->
        <div *ngIf="p.linkedMedia"
             class="absolute bottom-2 right-2 text-[11px] tracking-wide
                    bg-black/60 text-white px-2 py-1 rounded-md border border-white/10">
          {{ p.linkedMedia.type | uppercase }}
        </div>
      </div>

      <!-- Body -->
      <div class="p-4">
        <h2 class="font-semibold leading-snug line-clamp-2
                   group-hover:text-white transition-colors">
          {{ p.title }}
        </h2>

        <div class="mt-2 flex items-center justify-between text-xs text-white/60">
          <span>{{ p.created_at | date:'mediumDate' }}</span>
          <span class="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100">
            Leer <svg class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 5l7 7-7 7v-5H4v-4h9V5z"/>
            </svg>
          </span>
        </div>
      </div>
    </a>
  </div>
</section>
`,

})
export default class BlogPage implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  posts: BlogPost[] = [];

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    console.log('Loading blog posts...');
    this.posts = await firstValueFrom(this.http.get<BlogPost[]>('/backend/blog'));
    console.log('posts ', this.posts);
  }
}

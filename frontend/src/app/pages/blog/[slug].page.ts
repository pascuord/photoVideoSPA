import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from '../../core/api-url'; // 👈 NUEVO

type Media = { type: 'image'|'video'; url: string; thumbnailUrl?: string; watermark_text?: string; title?: string; slug: string; };
type BlogPost = { slug: string; title: string; body: string; coverUrl?: string; linkedMedia?: Media; created_at: string; };

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterLink],
  template: `
  <article class="max-w-3xl mx-auto p-6" (contextmenu)="$event.preventDefault()">
    <a routerLink="/blog" class="text-sm opacity-70 hover:opacity-100">← Back to blog</a>
    <h1 class="text-3xl font-bold mt-2 mb-3">{{ post?.title }}</h1>
    <p class="text-xs opacity-60 mb-4">{{ post?.created_at | date:'medium' }}</p>

    <div *ngIf="post?.coverUrl" class="relative rounded-xl overflow-hidden mb-6">
      <img [src]="post?.coverUrl" [alt]="post?.title" class="w-full h-auto select-none pointer-events-none" draggable="false"/>
    </div>

    <div *ngIf="post?.linkedMedia" class="mb-6">
      <div class="text-sm font-semibold mb-2">Referenced media</div>
      <div class="relative rounded-xl overflow-hidden bg-black/5">
        <ng-container [ngSwitch]="post!.linkedMedia!.type">
          <img *ngSwitchCase="'image'" [src]="post!.linkedMedia!.thumbnailUrl || post!.linkedMedia!.url"
               [alt]="post!.linkedMedia!.title || 'linked image'"
               class="w-full h-auto select-none pointer-events-none" draggable="false" />
          <video *ngSwitchCase="'video'" [src]="post!.linkedMedia!.url" controls class="w-full h-auto" draggable="false"></video>
        </ng-container>
        <div class="pointer-events-none absolute inset-0 grid place-items-center opacity-25">
          <span class="text-xl font-bold -rotate-12">{{ post!.linkedMedia!.watermark_text || '© Tu Marca' }}</span>
        </div>
      </div>
    </div>

    <div class="prose max-w-none">
      <p style="white-space: pre-wrap">{{ post?.body }}</p>
    </div>
  </article>
  `,
})
export default class BlogDetailPage implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  post?: BlogPost;

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;
    console.log('Loading blog post ', slug);
    this.post = await firstValueFrom(this.http.get<BlogPost>(apiUrl(`/blog/${slug}`))); // 👈
    console.log('Loaded post ', this.post);
  }
}

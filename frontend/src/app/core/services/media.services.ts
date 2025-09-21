import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private base = 'http://localhost:3000/api';

  async list(type?: 'image'|'video') {
    const url = new URL(`${this.base}/media`);
    if (type) url.searchParams.set('type', type);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error fetching media');
    return res.json(); // [{ id, title, url, thumbnailUrl, watermark_text, ... }]
  }
}

// src/app/core/services/interact.service.ts
import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '<YOUR_SUPABASE_URL>';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '<YOUR_SUPABASE_ANON_KEY>';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export type StatsDto = { likes: number; comments: number; shares: number; likedByMe?: boolean };

const API_BASE: string | undefined = (import.meta as any).env?.VITE_API_BASE_URL?.trim();

/** Construye la URL del API:
 *  - PROD:   https://tu-backend.com/api/...
 *  - DEV:    /backend/...  (Vite -> proxy -> http://localhost:3000/api/...)
 */
function apiUrl(path: string) {
  if (API_BASE) return `${API_BASE.replace(/\/$/, '')}/api${path}`;
  return `/backend${path}`;
}

@Injectable({ providedIn: 'root' })
export class InteractService {

  private async headers(requireAuth = false): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const h: Record<string, string> = {};
    if (token) h['Authorization'] = `Bearer ${token}`;
    if (requireAuth && !token) throw new Error('Necesitas iniciar sesión');
    return h;
  }

  async isLoggedIn(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  }

  async getStats(contentType: string, contentId: string): Promise<StatsDto> {
    const h = await this.headers(false);
    const res = await fetch(apiUrl(`/stats/${contentType}/${contentId}`), { headers: h });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Error fetching stats: HTTP ${res.status} ${txt}`);
    }
    return res.json();
  }

  async toggleLike(contentType: string, contentId: string): Promise<{ liked: boolean }> {
    const h = await this.headers(true);
    const res = await fetch(apiUrl('/likes'), {
      method: 'POST',
      headers: { ...h, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType, contentId }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Error toggling like: HTTP ${res.status} ${txt}`);
    }
    return res.json();
  }

  async addComment(contentType: string, contentId: string, body: string) {
    const h = await this.headers(true);
    const res = await fetch(apiUrl('/comments'), {
      method: 'POST',
      headers: { ...h, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType, contentId, body }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Error creating comment: HTTP ${res.status} ${txt}`);
    }
    return res.json();
  }

  async share(contentType: string, contentId: string, network: string) {
    const res = await fetch(apiUrl('/shares'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType, contentId, network }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Error incrementing share: HTTP ${res.status} ${txt}`);
    }
    return res.json();
  }
}

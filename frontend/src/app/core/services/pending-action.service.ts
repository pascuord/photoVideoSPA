// src/app/core/services/pending-action.service.ts
import { Injectable } from '@angular/core';
import { InteractService } from './interact.service';

type ContentType = 'image' | 'video' | 'post';
type PendingLike = { kind: 'like'; contentType: ContentType; contentId: string; ts: number };

const KEY = 'pendingLike';
const TTL_MS = 10 * 60 * 1000; // 10 minutos

@Injectable({ providedIn: 'root' })
export class PendingActionService {
  queueLike(contentType: ContentType, contentId: string) {
    const payload: PendingLike = { kind: 'like', contentType, contentId, ts: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(payload));
  }

  peekLike(): PendingLike | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw) as PendingLike;
      // caducado
      if (Date.now() - (obj?.ts ?? 0) > TTL_MS) {
        localStorage.removeItem(KEY);
        return null;
      }
      if (obj?.kind !== 'like' || !obj.contentId || !obj.contentType) return null;
      return obj;
    } catch {
      localStorage.removeItem(KEY);
      return null;
    }
  }

  popLike(): PendingLike | null {
    const v = this.peekLike();
    localStorage.removeItem(KEY);
    return v;
  }

  clear() {
    localStorage.removeItem(KEY);
  }

  /**
   * Ejecuta la acción pendiente (si hay) solo si el usuario está logueado.
   */
  async runIfAny(interact: InteractService): Promise<void> {
    const pending = this.peekLike();
    if (!pending) return;
    const logged = await interact.isLoggedIn();
    if (!logged) return; // aún no hay sesión, ya se ejecutará luego

    try {
      await interact.toggleLike(pending.contentType, pending.contentId);
    } catch (e) {
      // Si falla, igualmente limpiamos para no entrar en bucle
      console.warn('No se pudo ejecutar pendingLike:', e);
    } finally {
      this.clear();
    }
  }
}

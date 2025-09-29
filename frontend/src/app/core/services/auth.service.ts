import { Injectable, Signal, computed, signal } from '@angular/core';
import { supabase } from './supabase.client';

export type AuthUser = {
  id: string;
  email?: string;
  avatar_url?: string | null;
  display_name?: string | null;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _loading = signal(true);
  private _user = signal<AuthUser | null>(null);

  loading: Signal<boolean> = this._loading.asReadonly();
  user: Signal<AuthUser | null> = this._user.asReadonly();
  isLoggedIn: Signal<boolean> = computed(() => !!this._user());

  constructor() {
    this.bootstrap();
    supabase.auth.onAuthStateChange(async (_event, session) => {
      await this.hydrateFromSession();
    });
  }

  private async bootstrap() {
    await this.hydrateFromSession();
  }

  private async hydrateFromSession() {
    this._loading.set(true);
    const { data } = await supabase.auth.getSession();
    const s = data.session;
    if (s?.user) {
      // perfil básico (intenta leer de profiles, opcional)
      let display_name = s.user.user_metadata?.['name'] ?? null;
      let avatar_url = s.user.user_metadata?.['avatar_url'] ?? null;
      try {
        const { data: p } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', s.user.id)
          .single();
        if (p) {
          display_name = p.display_name ?? display_name;
          avatar_url = p.avatar_url ?? avatar_url;
        }
      } catch {
        /* ignore */
      }
      this._user.set({ id: s.user.id, email: s.user.email ?? '', display_name, avatar_url });
    } else {
      this._user.set(null);
    }
    this._loading.set(false);
  }

  async signInWithEmail(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin, shouldCreateUser: true },
    });

    if (error) throw error;
    return true;
  }

  async signOut() {
    await supabase.auth.signOut();
    this._user.set(null);
  }
}

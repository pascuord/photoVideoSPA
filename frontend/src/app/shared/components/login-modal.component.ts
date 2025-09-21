import {
  Component, EventEmitter, Output, inject, signal, PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../core/services/interact.service';

@Component({
  standalone: true,
  selector: 'app-login-modal',
  imports: [CommonModule, FormsModule],
  template: `
  <!-- Overlay -->
  <div class="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
       (click)="onClose()"
       role="dialog" aria-modal="true" aria-label="Iniciar sesión">
    <!-- Panel (misma línea visual que /auth) -->
    <div class="w-full max-w-md mx-auto bg-black text-white rounded-xl shadow-2xl border border-neutral-200 p-6"
         (click)="$event.stopPropagation()">
      <h2 class="text-2xl font-bold mb-4">Acceder</h2>

      <!-- Formulario como en /auth -->
      <form (submit)="sendMagicLink($event)" class="space-y-3">
        <input [(ngModel)]="email"
               name="email"
               type="email"
               required
               placeholder="tu@email.com"
               class="w-full border rounded px-3 py-2" />

        <button type="submit"
                [disabled]="sending()"
                class="px-3 py-2 rounded bg-white text-black w-full disabled:opacity-60">
          Enviar magic link
        </button>

        <p class="text-xs">
          Revisa tu email y abre el enlace para iniciar sesión.
        </p>

        <p *ngIf="sent()" class="text-sm text-emerald-700">
          ✅ Te enviamos un enlace de acceso.
        </p>

        <p *ngIf="error()" class="text-sm text-red-600">
          {{ error() }}
        </p>
      </form>

      <div class="mt-4 flex justify-end">
        <button (click)="onClose()"
                class="text-sm text-neutral-100 hover:text-neutral-300">
          Cerrar
        </button>
      </div>
    </div>
  </div>
  `,
})
export class LoginModalComponent {
  @Output() done = new EventEmitter<'closed'|'email-sent'>();

  private platformId = inject(PLATFORM_ID);

  email = '';
  sending = signal(false);
  sent = signal(false);
  error = signal<string | null>(null);

  onClose() { this.done.emit('closed'); }

  // Si en el futuro añades Google en /auth, vuelve a activar este método y el botón
  async loginWithGoogle() {
    if (!isPlatformBrowser(this.platformId)) return;
    const redirect = `${location.origin}/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirect },
    });
  }

  async sendMagicLink(ev: Event) {
    ev.preventDefault();
    if (!isPlatformBrowser(this.platformId)) return;

    this.error.set(null);
    this.sending.set(true);

    try {
      const redirect = `${location.origin}/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email: this.email.trim(),
        options: { emailRedirectTo: redirect },
      });
      if (error) throw error;
      this.sent.set(true);
      this.done.emit('email-sent');
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo enviar el enlace.');
    } finally {
      this.sending.set(false);
    }
  }
}

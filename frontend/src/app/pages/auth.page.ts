import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from '../core/services/supabase.client';
import { InteractService } from '../core/services/interact.service';
import { PendingActionService } from '../core/services/pending-action.service';
import { ModalComponent } from '../shared/ui/modal.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
  <section class="max-w-md mx-auto p-6">

    <!-- Debug temporal -->
    <div class="fixed bottom-2 right-2 text-xs bg-yellow-200 px-2 py-1 rounded shadow">
      showDialog: {{ showDialog }}
    </div>
    <h1 class="text-2xl font-bold mb-4">Acceder</h1>

    <ng-container *ngIf="auth.isLoggedIn(); else loginForm">
      <div class="p-4 rounded bg-green-50">
        Sesión iniciada como <strong>{{ auth.user()?.email }}</strong>.
      </div>
      <button class="mt-4 px-3 py-2 rounded bg-black text-white" (click)="logout()">Cerrar sesión</button>
    </ng-container>

    <ng-template #loginForm>
      <form (submit)="onSubmit($event)" class="space-y-3">
        <input [(ngModel)]="email" name="email" type="email" required
               placeholder="tu@email.com"
               class="w-full border rounded px-3 py-2" />
        <button type="submit"
                class="px-3 py-2 rounded bg-black text-white w-full disabled:opacity-60"
                [disabled]="isSending">
          {{ isSending ? 'Enviando...' : 'Enviar magic link' }}
        </button>
        <p class="text-xs opacity-70">Revisa tu email y abre el enlace para iniciar sesión.</p>
      </form>
    </ng-template>
  </section>

  <!-- Modal genérico -->
  <app-modal
    [(open)]="showDialog"
    title="Enlace enviado"
    ariaLabel="Aviso de acceso"
    (closed)="onModalClosed()">
    <p class="text-sm">
      Te envié un enlace de acceso. Revisa tu correo (incluida la carpeta de spam).
    </p>
  </app-modal>

  `,
})
export default class AuthPage implements OnDestroy {
  auth = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  email = '';
  isSending = false;

  private unsub?: () => void;
  private interact = inject(InteractService);
  private pending = inject(PendingActionService);

  // Estado del modal
  showDialog = false;
  dialogTitle = '';
  dialogMessage = '';
  goHomeOnClose = false;

  constructor() {
    const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
    const sub = supabase.auth.onAuthStateChange(async (evt, session) => {
      if (evt === 'SIGNED_IN' && session) {
        await this.pending.runIfAny(this.interact);
        this.router.navigateByUrl(redirect);
      }
    });
    this.unsub = sub.data?.subscription?.unsubscribe;
  }

  ngOnDestroy() { this.unsub?.(); }

  cdr = inject(ChangeDetectorRef);

  async onSubmit(e: Event) {
    e.preventDefault();
    if (!this.email) return;
    this.isSending = true;
    try {
      await this.auth.signInWithEmail(this.email.trim());
      // Mostrar modal en vez de alert()
      this.dialogTitle = 'Enlace enviado';
      this.dialogMessage = 'Te envié un enlace de acceso. Revisa tu correo (incluida la carpeta de spam).';
      this.showDialog = true;
      this.goHomeOnClose = true;
      console.log('Magic link sent');
    } catch (err: any) {
      this.dialogTitle = 'No se pudo enviar el enlace';
      this.dialogMessage = err?.message || 'Ha ocurrido un error. Inténtalo de nuevo más tarde.';
      this.showDialog = true;
      this.goHomeOnClose = false;
    } finally {
      this.isSending = false;
      this.cdr.detectChanges(); // fuerza render si estás zoneless
    }
  }

  async logout() { await this.auth.signOut(); }

  onModalClosed() {
    if (this.goHomeOnClose) this.router.navigateByUrl('/');
    this.showDialog = false;
    this.cdr.detectChanges(); // fuerza render si estás zoneless
  }

}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, inject, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div
    *ngIf="open"
    class="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    [attr.aria-labelledby]="title ? 'modal-title' : null"
    [attr.aria-label]="!title ? ariaLabel || null : null"
    (click)="onBackdrop($event)"
  >
    <div
      class="w-full max-w-md mx-auto bg-black text-white rounded-xl shadow-2xl border border-neutral-200 p-6"
      [ngClass]="panelClass"
      (click)="$event.stopPropagation()"
    >
      <h2 *ngIf="title" id="modal-title" class="text-2xl font-bold mb-4">{{ title }}</h2>

      <div class="modal-body">
        <ng-content></ng-content>
      </div>

      <div class="mt-4 flex justify-end">
        <button type="button"
                class="text-sm text-neutral-100 hover:text-neutral-300"
                (click)="close()"
                autofocus>
          {{ primaryText }}
        </button>
      </div>
    </div>
  </div>
  `,
})
export class ModalComponent {
  private cdr = inject(ChangeDetectorRef);

  // Inputs
  @Input() open = false;
  @Input() title = '';
  @Input() ariaLabel = '';
  @Input() primaryText = 'Cerrar';
  @Input() closeOnBackdrop = true;
  @Input() panelClass = '';

  // Outputs
  @Output() closed = new EventEmitter<void>();
  @Output() openChange = new EventEmitter<boolean>(); // para [(open)]

  close() {
    // 1) Auto-cierre del propio modal
    this.open = false;

    // 2) Sincroniza al padre con two-way binding
    this.openChange.emit(false);

    // 3) Evento "closed" para quien lo necesite
    this.closed.emit();

    // 4) Forzar render si estás zoneless
    this.cdr.detectChanges();
  }

  onBackdrop(event: MouseEvent) {
    if (!this.closeOnBackdrop) return;
    if (event.target === event.currentTarget) this.close();
  }

  @HostListener('document:keydown.escape') onEsc() {
    if (this.open) this.close();
  }
}

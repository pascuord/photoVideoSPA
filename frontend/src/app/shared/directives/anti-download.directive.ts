// src/app/shared/directives/anti-download.directive.ts
import { Directive, HostListener, Renderer2, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appAntiDownload]',
  standalone: true,
})
export class AntiDownloadDirective implements OnInit {
  @Input() disableKeyboardShortcuts = true;
  @Input() disableSelection = true;
  @Input() disableCallout = true; // iOS long-press callout
  /** Pausar los bloqueos si hay un modal abierto (role=dialog aria-modal="true") */
  @Input() suspendWhenDialogOpen = true;

  constructor(
    private el: ElementRef,
    private r2: Renderer2,
  ) {}

  ngOnInit() {
    // Evita arrastrar contenido
    this.r2.setAttribute(this.el.nativeElement, 'draggable', 'false');

    // CSS antiselección y anti arrastre
    if (this.disableSelection) {
      this.r2.setStyle(this.el.nativeElement, 'user-select', 'none');
      this.r2.setStyle(this.el.nativeElement, '-webkit-user-select', 'none');
      this.r2.setStyle(this.el.nativeElement, '-webkit-user-drag', 'none');
    }

    // iOS/Android: desactiva callout de texto/imagen en long-press
    if (this.disableCallout) {
      this.r2.setStyle(this.el.nativeElement, '-webkit-touch-callout', 'none');
    }
  }

  // Bloquea menú contextual (clic derecho y long-press)
  @HostListener('contextmenu', ['$event'])
  onContextMenu(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    return false;
  }

  // Bloquea arrastre (dragstart)
  @HostListener('dragstart', ['$event'])
  onDragStart(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    return false;
  }

  // Atajos comunes (Ctrl/Cmd+S, Ctrl/Cmd+P, Ctrl+U, F12, etc.)
  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (!this.disableKeyboardShortcuts) return true;

    // 1) Si hay un modal abierto, no interceptar
    if (this.suspendWhenDialogOpen) {
      const openDialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (openDialog) return true;
    }

    // 2) No bloquear cuando el foco está en inputs/areas o contenteditable
    const t = e.target as HTMLElement | null;
    if (t) {
      const tag = t.tagName?.toLowerCase?.() || '';
      if (tag === 'input' || tag === 'textarea' || t.isContentEditable) return true;
    }

    // 3) key puede ser undefined en algunos eventos → defensivo
    const k = typeof e.key === 'string' ? e.key.toLowerCase() : '';
    const mod = e.ctrlKey || e.metaKey;

    // Atajos que bloqueas
    const block =
      (mod && (k === 's' || k === 'p' || k === 'u')) || // guardar, imprimir, ver código fuente
      k === 'f12' || // devtools
      (mod && e.shiftKey && (k === 'i' || k === 'c' || k === 'j')); // devtools variaciones

    if (block) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    return true;
  }
}

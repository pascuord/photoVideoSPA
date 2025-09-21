import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <section class="p-8 text-center">
      <h1 class="text-2xl font-bold">Página no encontrada</h1>
      <p class="mt-2 opacity-70">Volviendo a la galería…</p>
    </section>
  `,
})
export default class PageNotFound {
  constructor() {
    // Redirige suave a /gallery si quieres:
    setTimeout(() => location.assign('/gallery'), 300);
  }
}

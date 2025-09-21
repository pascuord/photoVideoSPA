import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  host: {
    class: 'block bg-neutral-950 text-neutral-300 border-t border-white/10',
  },
  template: `
    <footer aria-label="Pie de página">
      <div class="py-10 md:py-12 grid gap-10 text-center place-items-center">
        <!-- Brand / About -->
        <section class="max-w-xl">
          <h2 class="text-lg font-semibold text-white">{{ name }}</h2>
          <p class="text-sm text-neutral-400 mt-1">{{ role }}</p>
          <p class="mt-3 text-sm text-neutral-400 leading-relaxed">
            {{ bio }}
          </p>
          <p class="mt-3">
            <span
              class="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-white/80"
            >
              <span
                class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
              ></span>
              Disponible para proyectos
            </span>
          </p>
        </section>

        <!-- Navegación + Contacto -->
        <nav
          aria-label="Enlaces y contacto"
          class="grid grid-cols-1 sm:grid-cols-2 gap-8 place-items-center w-full max-w-3xl"
        >
          <div>
            <h3 class="text-sm font-semibold text-white mb-3">Secciones</h3>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/" class="hover:text-white/90">Inicio</a></li>
              <li>
                <a routerLink="/gallery" class="hover:text-white/90">Galería</a>
              </li>
              <li>
                <a routerLink="/blog" class="hover:text-white/90">Blog</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-white mb-3">Contacto</h3>
            <ul class="space-y-2 text-sm">
              <li>
                <a
                  [href]="'mailto:' + email"
                  class="hover:text-white/90"
                  rel="noopener"
                >
                  {{ email }}
                </a>
              </li>
              <li class="flex items-center justify-center gap-4 mt-2">
                <a
                  *ngIf="github"
                  [href]="github"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  class="hover:text-white/90"
                >
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58V21c-3.34.73-4.04-1.6-4.04-1.6-.55-1.38-1.34-1.75-1.34-1.75-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.84 2.83 1.31 3.52 1 .11-.79.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.02-.33 3.34 1.23a11.6 11.6 0 0 1 6.08 0c2.32-1.56 3.34-1.23 3.34-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.62-2.81 5.64-5.49 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5z"
                    />
                  </svg>
                </a>
                <a
                  *ngIf="linkedin"
                  [href]="linkedin"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  class="hover:text-white/90"
                >
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M4.98 3.5a2.5 2.5 0 1 0 0 5.001 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM9 9h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05C20.4 8.59 21 11 21 14.26V21h-4v-6.14c0-1.46-.02-3.34-2.03-3.34-2.03 0-2.34 1.59-2.34 3.23V21H9z"
                    />
                  </svg>
                </a>
                <a
                  *ngIf="instagram"
                  [href]="instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  class="hover:text-white/90"
                >
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.343 3.608 1.318.975.975 1.256 2.242 1.318 3.608.058 1.266.07 1.646.07 4.84s-.012 3.575-.07 4.84c-.062 1.366-.343 2.633-1.318 3.608-.975.975-2.242 1.256-3.608 1.318-1.266.058-1.646.07-4.85.07-3.204 0-3.584-.012-4.85-.07-1.366-.062-2.633-.343-3.608-1.318-.975-.975-1.256-2.242-1.318-3.608C2.175 15.619 2.163 15.24 2.163 12s.012-3.575.07-4.84c.062-1.366.343-2.633 1.318-3.608.975-.975 2.242-1.256 3.608-1.318C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.773.13 4.653.428 3.678 1.403 2.703 2.378 2.405 3.498 2.347 4.778 2.289 6.058 2.275 6.467 2.275 9.725v4.55c0 3.258.014 3.667.072 4.947.058 1.28.356 2.4 1.331 3.375.975.975 2.095 1.273 3.375 1.331 1.28.058 1.689.072 4.947.072s3.667-.014 4.947-.072c1.28-.058 2.4-.356 3.375-1.331.975-.975 1.273-2.095 1.331-3.375.058-1.28.072-1.689.072-4.947v-4.55c0-3.258-.014-3.667-.072-4.947-.058-1.28-.356-2.4-1.331-3.375C19.348.428 18.228.13 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zM18.406 4.317a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Extras -->
        <section class="space-y-3 max-w-xl">
          <h3 class="text-sm font-semibold text-white">Ubicación</h3>
          <p class="text-sm text-neutral-400">{{ location }}</p>

          <h3 class="text-sm font-semibold text-white mt-5">Stack</h3>
          <p class="text-sm text-neutral-400">
            Angular · Tailwind CSS · Supabase · Vite
          </p>
        </section>
      </div>

      <div class="border-t border-white/10">
        <div
          class="py-5 flex flex-col items-center justify-center gap-3 text-center"
        >
          <p class="text-xs text-neutral-500">
            © {{ year }} {{ name }}. Todos los derechos reservados.
          </p>
          <a
            href="#top"
            class="text-xs hover:text-white/90 inline-flex items-center gap-2"
          >
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 5l7 7-1.4 1.4L13 9.8V19h-2V9.8l-4.6 3.6L5 12z" />
            </svg>
            Volver arriba
          </a>
        </div>
      </div>
    </footer>
  `,
})
export class AppFooterComponent {
  @Input() name = 'Pascual Ordiñana Soler';
  @Input() role = 'Desarrollador Frontend';
  @Input() bio =
    'Construyo interfaces limpias y accesibles, con foco en rendimiento y UX.';
  @Input() email = 'pascuord@gmail.com';
  @Input() github?: string = 'https://github.com/pascuord';
  @Input() linkedin?: string = 'https://www.linkedin.com/in/pascualordiñana';
  @Input() instagram?: string = 'https://www.instagram.com/pascuord/';
  @Input() location = 'Valencia, España';

  year = new Date().getFullYear();
}

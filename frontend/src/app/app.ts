import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from './shared/components/app-header.component';
import { AppFooterComponent } from './shared/app-footer/app-footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeaderComponent, AppFooterComponent],
  template: `
    <a id="top" class="sr-only">top</a>
    <app-header></app-header>
    <main class="pt-16 md:pt-20 min-h-[60vh]">
      <router-outlet />
    </main>
    <app-footer></app-footer>
  `,
  styles: [],
})
export class AppComponent {}

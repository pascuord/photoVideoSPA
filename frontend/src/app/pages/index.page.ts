import { Component } from '@angular/core';

import GalleryPage from './gallery.page';
import { HeroCarouselComponent } from "../shared/components/hero-carousel.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [GalleryPage, HeroCarouselComponent],
  template: `
    <ng-container>
      <app-hero-carousel></app-hero-carousel>
      <app-gallery-page></app-gallery-page>
    </ng-container>
  `,
})
export default class HomeComponent {
}

import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';

import './styles.css'; // ⬅️ importa los estilos globales (si aún no lo haces)

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));

import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  createComponent,
  Inject,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { take } from 'rxjs/operators';
import { LoginModalComponent } from '../../shared/components/login-modal.component';

@Injectable({ providedIn: 'root' })
export class LoginModalService {
  constructor(
    private appRef: ApplicationRef,
    private env: EnvironmentInjector,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(PLATFORM_ID) private pid: Object,
  ) {}

  open(): Promise<'closed' | 'email-sent'> {
    console.log('[LoginModalService] open()');
    // En SSR no hacemos nada
    if (!isPlatformBrowser(this.pid)) {
      return Promise.resolve('closed');
    }

    return new Promise((resolve) => {
      // crea el componente
      const compRef = createComponent<LoginModalComponent>(LoginModalComponent, {
        environmentInjector: this.env,
      }) as ComponentRef<LoginModalComponent>;

      // cleanup helper
      const destroy = () => {
        // restaurar scroll
        this.doc.documentElement.style.overflow = '';
        this.appRef.detachView(compRef.hostView);
        compRef.destroy();
      };

      compRef.instance.done.pipe(take(1)).subscribe((result) => {
        destroy();
        resolve(result);
      });

      // adjunta al DOM + detect changes
      this.appRef.attachView(compRef.hostView);
      this.doc.body.appendChild(compRef.location.nativeElement);
      compRef.changeDetectorRef.detectChanges(); // ⬅️ IMPORTANTE

      // bloquea scroll del documento mientras está abierto
      this.doc.documentElement.style.overflow = 'hidden';
    });
  }
}

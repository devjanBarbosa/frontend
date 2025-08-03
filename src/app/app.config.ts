import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations'; // 1. Importe as Animações
import { provideToastr } from 'ngx-toastr'; // 2. Importe o Toastr

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    
    // --- ADICIONE ESTAS DUAS LINHAS ---
    provideAnimations(), // 3. Ativa o motor de animações do Angular
    provideToastr({      // 4. Configura o ngx-toastr
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
  ]
};
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

// --- NOVAS IMPORTAÇÕES AQUI ---
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
     provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top', // Garante que a página role para o topo em cada navegação
      })),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),

    // --- ADICIONE ESTA LINHA ---
    // Isto disponibiliza todos os componentes e serviços do Chart.js para a sua aplicação
    provideCharts(withDefaultRegisterables()),
  ]
};
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

// 1. Importe a função de registro do Swiper aqui
import { register } from 'swiper/element/bundle';

// 2. Execute a função de registro ANTES de a aplicação iniciar
register();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
// 1. O import busca a classe correta no arquivo correto
import { AppComponent } from './app/app';
import { register } from 'swiper/element';
  register();
// 2. O bootstrap usa a classe correta
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
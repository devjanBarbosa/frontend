import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // RouterModule já deve estar aqui
import { HeaderComponent } from './components/header/header'; // Import do seu Header
import { WhatsappButtonComponent } from './components/whatsapp-button/whatsapp-button';
import { FooterComponent } from "./components/footer/footer";
import { SeoService } from './services/seo';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    WhatsappButtonComponent,
    FooterComponent
],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  title = 'frontend';

   constructor(private router: Router,
        private seoService: SeoService 
   ) {}

    ngOnInit(): void {
    this.seoService.init(); 
  }
  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
}
}
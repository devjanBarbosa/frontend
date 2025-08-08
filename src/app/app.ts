import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // RouterModule já deve estar aqui
import { HeaderComponent } from './components/header/header'; // Import do seu Header
import { WhatsappButtonComponent } from './components/whatsapp-button/whatsapp-button'; 


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    WhatsappButtonComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  title = 'frontend';
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-button.html',
  styleUrls: ['./whatsapp-button.scss']
})
export class WhatsappButtonComponent {
  
  // --- CONFIGURE AQUI ---
  numeroTelefone = '5521997883761'; // Coloque o seu número com o código do país e estado
  mensagemPadrao = 'Olá! Gostaria de saber mais sobre os produtos da Leda Cosméticos.';
  
  whatsappUrl: string;

  constructor() {
    // Codifica a mensagem para que ela funcione corretamente num URL
    const mensagemCodificada = encodeURIComponent(this.mensagemPadrao);
    this.whatsappUrl = `https://wa.me/${this.numeroTelefone}?text=${mensagemCodificada}`;
  }
}
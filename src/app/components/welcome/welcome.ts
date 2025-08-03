import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // 1. Importe o RouterModule

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule], // 2. Adicione o RouterModule aqui
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.scss']
})
export class WelcomeComponent {
  // Nenhuma outra alteração é necessária aqui
}
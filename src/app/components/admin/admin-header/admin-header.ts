import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth'; // Verifique o caminho para o seu AuthService

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-header.html',
  styleUrls: ['./admin-header.scss']
})
export class AdminHeaderComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Função para fazer logout do painel
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
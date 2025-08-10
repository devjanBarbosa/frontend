import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from "@angular/router";
import { AdminHeaderComponent } from '../../components/admin/admin-header/admin-header';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, RouterModule, AdminHeaderComponent],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent {

  constructor(private router: Router) {}

  logout(): void {
    // Aqui você deve limpar os dados de autenticação.
    // O mais comum é remover o token JWT do localStorage.
    localStorage.removeItem('authToken'); // Use o nome exato do seu token

    // Redireciona o utilizador para a página de login.
    this.router.navigate(['/login']);
  }
}

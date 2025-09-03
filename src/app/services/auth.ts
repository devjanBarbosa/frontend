import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

// Interface para os dados de login
export interface DadosAutenticacao {
  email: string;
  senha?: string; // Senha é opcional aqui, pois só é usada no login
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api`;
  
  // BehaviorSubject para manter o estado de autenticação reativo
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasAuthCookie());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // --- MÉTODO DE LOGIN ATUALIZADO ---
  login(dados: DadosAutenticacao): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, dados, { withCredentials: true }).pipe(
      tap(() => {
        // Se o login for bem-sucedido, o backend define o cookie.
        // Nós apenas atualizamos o nosso estado interno.
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  // --- MÉTODO DE LOGOUT ATUALIZADO ---
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe(() => {
      this.isAuthenticatedSubject.next(false);
      this.router.navigate(['/login']);
    });
  }

  // Verifica se o utilizador está autenticado
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Método simples para verificar a existência do cookie no arranque da aplicação
  // NOTA: Isto não valida o token, apenas verifica se o cookie existe.
  // A validação real acontece no backend em cada requisição.
  private hasAuthCookie(): boolean {
    return document.cookie.split(';').some((item) => item.trim().startsWith('auth_token='));
  }
}

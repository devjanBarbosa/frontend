import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth'; // Verifique se o caminho para o seu AuthService está correto

export const authGuard: CanActivateFn = (route, state) => {
  
  // Injeta o serviço de autenticação e o router
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se o usuário está logado usando o método do seu AuthService
  if (authService.isLoggedIn()) {
    // Se estiver logado, permite o acesso à rota
    return true; 
  } else {
    // Se NÃO estiver logado, redireciona para a página de login
    router.navigate(['/login']);
    // E bloqueia o acesso à rota original (admin)
    return false; 
  }
};
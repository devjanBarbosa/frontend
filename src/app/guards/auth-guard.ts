import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usa o método isLoggedIn do serviço para verificar a autenticação
  if (authService.isLoggedIn()) {
    return true;
  }

  // Se não estiver autenticado, redireciona para a página de login
  router.navigate(['/login']);
  return false;
};

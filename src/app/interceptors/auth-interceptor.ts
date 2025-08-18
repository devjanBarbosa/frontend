import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Clona a requisição e define 'withCredentials' como true.
  // Isto instrui o navegador a enviar cookies com a requisição.
  const authReq = req.clone({
    withCredentials: true,
  });

  return next(authReq);
};

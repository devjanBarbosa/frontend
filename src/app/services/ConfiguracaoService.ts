import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracaoService {
  private readonly apiUrl = `${environment.apiUrl}/api/config`;

  constructor(private http: HttpClient) { }

  /**
   * Busca o valor da taxa de entrega configurado na API.
   * @returns Um Observable com o valor numérico da taxa de entrega.
   */
  getTaxaEntrega(): Observable<number> {
    return this.http.get<{ taxaEntrega: string }>(`${this.apiUrl}/taxa-entrega`).pipe(
      map(response => parseFloat(response.taxaEntrega) || 0), // Converte a string para número, com fallback para 0
      catchError(() => {
        console.error('Não foi possível buscar a taxa de entrega da API. Usando valor padrão 0.');
        return of(0); // Retorna 0 em caso de erro na API
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interface para definir a estrutura da resposta do backend
export interface EnderecoCep {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CepService {
  // Endpoint do seu backend Spring Boot
  private readonly backendCepUrl = `${environment.apiUrl}/api/cep`;

  constructor(private http: HttpClient) { }

  /**
   * Busca um endereço a partir de um CEP via backend Spring Boot.
   * @param cep O CEP a ser consultado (apenas números).
   * @returns Um Observable com os dados do endereço ou nulo se não for encontrado ou inválido.
   */
  buscar(cep: string): Observable<EnderecoCep | null> {
    // Remove caracteres não numéricos do CEP
    const cepNumerico = cep.replace(/\D/g, '');

    if (cepNumerico.length !== 8) {
      return of(null); // Retorna nulo se o CEP for inválido
    }

    return this.http.get<EnderecoCep>(`${this.backendCepUrl}/${cepNumerico}`).pipe(
  map(endereco => (endereco.erro ? null : endereco)),
  catchError(() => of(null))
);}
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Interface para definir a estrutura da resposta da API ViaCEP
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
  private readonly viaCepUrl = 'https://viacep.com.br/ws/';

  constructor(private http: HttpClient) { }

  /**
   * Busca um endereço a partir de um CEP na API ViaCEP.
   * @param cep O CEP a ser consultado (apenas números).
   * @returns Um Observable com os dados do endereço ou nulo se não for encontrado ou inválido.
   */
  buscar(cep: string): Observable<EnderecoCep | null> {
    // Remove caracteres não numéricos do CEP
    const cepNumerico = cep.replace(/\D/g, '');

    if (cepNumerico.length !== 8) {
      return of(null); // Retorna nulo se o CEP for inválido
    }

    return this.http.get<EnderecoCep>(`${this.viaCepUrl}${cepNumerico}/json/`).pipe(
      map(endereco => (endereco.erro ? null : endereco)), // Se a API retornar erro, tratamos como nulo
      catchError(() => of(null)) // Em caso de erro na requisição (ex: 404), também retorna nulo
    );
  }
}

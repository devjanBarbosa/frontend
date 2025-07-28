import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interface para a Categoria, melhorando a segurança de tipo
export interface Categoria {
  id: number; // ou string, dependendo do seu backend
  nome: string;
}

// Interface do Produto atualizada
export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  urlImagem: string;
  estoque: number;
  categoria: Categoria; // Usando a interface Categoria ao invés de 'any'
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:8080/api/produtos';
  private readonly uploadUrl = 'http://localhost:8080/api/upload';

  constructor(private http: HttpClient) {}

  listarProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  buscarProdutoPorId(id: string): Observable<Produto> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Produto>(url).pipe(
      catchError(this.handleError)
    );
  }

  criarProduto(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, produto).pipe(
      catchError(this.handleError)
    );
  }

  atualizarProduto(id: string, produto: Produto): Observable<Produto> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Produto>(url, produto).pipe(
      catchError(this.handleError)
    );
  }

  excluirProduto(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  }

  // Método privado para centralizar o tratamento de erros HTTP
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente ou de rede
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // O backend retornou um código de falha
      // O corpo da resposta pode conter pistas sobre o que deu errado
      errorMessage = `Erro do servidor: Código ${error.status}, mensagem: ${error.message}`;
    }
    console.error(errorMessage);
    // Retorna um observable com uma mensagem de erro para o usuário
    return throwError(() => new Error(errorMessage));
  }

   uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ url: string }>(this.uploadUrl, formData);
  }
}
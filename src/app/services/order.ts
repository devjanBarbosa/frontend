import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// --- INTERFACES ---

// Interface para ENVIAR um novo pedido (Payload)
export interface PedidoPayload {
  nomeCliente: string;
  whatsappCliente: string;
  metodoEntrega: string;
  metodoPagamento: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  itens: {
    produtoId: string; // Corrigido de produto: { id: string } para alinhar com o backend
    quantidade: number;
  }[];
}

// Interface para RECEBER os dados de um item de um pedido
export interface ItemPedido {
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
}

// Interface para RECEBER os dados de um pedido completo
export interface Pedido {
  id: string;
  dataCriacao: string;
  nomeCliente: string;
  whatsappCliente: string;
  status: string;
  subtotal: number;
  taxaEntrega: number;
  valorTotal: number;
  itens: ItemPedido[];
  metodoEntrega: 'RETIRADA_NA_LOJA' | 'ENTREGA_LOCAL'; // Tipo mais específico
  metodoPagamento: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  pixCopiaECola?: string;
  pixQrCodeBase64?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/api/pedidos`;

  constructor(private http: HttpClient) { }

  // --- MÉTODOS ---

  criarPedido(pedido: PedidoPayload): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido).pipe(
      catchError(this.handleError)
    );
  }

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getPedidoById(id: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  atualizarStatus(id: string, status: string): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      catchError(this.handleError)
    );
  }

  // --- NOVO MÉTODO PRIVADO PARA TRATAR ERROS ---
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente ou de rede
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // O backend retornou um código de falha
      errorMessage = `Erro do servidor: Código ${error.status}, mensagem: ${error.message}`;
    }
    console.error(errorMessage);
    // Retorna um observable com uma mensagem de erro amigável
    return throwError(() => new Error('Algo deu errado; por favor, tente novamente mais tarde.'));
  }
}
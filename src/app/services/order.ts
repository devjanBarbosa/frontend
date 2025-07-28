import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Interface para representar os dados de uma encomenda que vêm do backend
export interface Pedido {
  id: string;
  dataDoPedido: string; // Vem como string, podemos formatar depois
  nomeCliente: string;
  status: string;
  valorTotal: number;
  itens: any[]; // Simplificado por agora
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = 'http://localhost:8080/api/pedidos';

  constructor(private http: HttpClient) { }

  // --- NOVO MÉTODO ---
  // Busca todas as encomendas. O AuthInterceptor vai adicionar o token automaticamente.
  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }
  // Adicione este novo método ao seu OrderService

getPedidoById(id: string): Observable<Pedido> {
  return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
}
}
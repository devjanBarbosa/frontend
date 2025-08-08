import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusPedido } from './status-pedido.enum';

// Interface para representar os dados de uma encomenda que vêm do backend
export interface Pedido {
  id: string;
  dataDoPedido: string; // Vem como string, podemos formatar depois
  nomeCliente: string;
  whatsappCliente: string; 
  status: StatusPedido;
  valorTotal: number;
  itens: any[]; // Simplificado por agora
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = 'http://localhost:8080/api/pedidos';

  constructor(private http: HttpClient) { }

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }
  // Adicione este novo método ao seu OrderService

getPedidoById(id: string): Observable<Pedido> {
  return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
}
  

   atualizarStatus(id: string, status: StatusPedido): Observable<Pedido> {
    const url = `${this.apiUrl}/${id}/status`;
    const body = { status }; // Forma curta de { status: status }
    return this.http.patch<Pedido>(url, body);
  }
}



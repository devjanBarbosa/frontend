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
  itens: any[];
  tipoEntrega: 'ENTREGA_LOCAL' | 'RETIRADA_NA_LOJA';
  metodoPagamento: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  pixCopiaECola: string;
  pixQrCodeBase64: string;
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
  

   atualizarStatus(id: string, novoStatus: string): Observable<Pedido> {
    const url = `${this.apiUrl}/${id}/status`;
    return this.http.patch<Pedido>(url, { status: novoStatus });
  }
}



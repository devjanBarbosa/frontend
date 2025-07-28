import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Interface que representa os dados da encomenda a serem enviados
export interface PedidoPayload {
  nomeCliente: string;
  whatsappCliente: string;
  endereco: string;
  bairro: string;
  complemento?: string;
  metodoEntrega: string;
  metodoPagamento: string;
  itens: {
    produto: { id: string };
    quantidade: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly apiUrl = 'http://localhost:8080/api/pedidos';

  constructor(private http: HttpClient) { }

  criarEncomenda(pedido: PedidoPayload): Observable<any> {
    return this.http.post(this.apiUrl, pedido);
  }
}
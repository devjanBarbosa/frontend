import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CartItem } from './cart';

// 1. A interface "Pedido" é definida e EXPORTADA aqui
export interface Pedido {
  id: string;
  dataDoPedido: string;
  nomeCliente: string;
  status: string;
  valorTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private readonly apiUrl = 'http://localhost:8080/api/pedidos';

  constructor(private http: HttpClient) { }

  // O método agora sabe o que é um "Pedido[]" porque a interface foi definida acima
  listarPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }
   criarPedido(pedidoData: { itens: CartItem[], nomeCliente: string, whatsappCliente: string }): Observable<Pedido> {
    
    // Transforma os dados do carrinho para o formato que o backend espera
    const pedidoParaApi = {
      nomeCliente: pedidoData.nomeCliente,
      whatsappCliente: pedidoData.whatsappCliente,
      tipoEntrega: 'RETIRADA_NA_LOJA', // Exemplo, podemos tornar isso dinâmico depois
      itens: pedidoData.itens.map(item => ({
        produto: { id: item.produto.id },
        quantidade: item.quantidade
      }))
    };

    return this.http.post<Pedido>(this.apiUrl, pedidoParaApi);
  }
}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Interface que representa os dados da encomenda a serem enviados
export interface PedidoPayload {
  nomeCliente: string;
  whatsappCliente: string;
  metodoEntrega: string;
  metodoPagamento: string;
  // --- CAMPOS ATUALIZADOS ---
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  // -------------------------
  itens: {
    produtoId: string; // Verifique se este já foi corrigido
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
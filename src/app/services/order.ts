import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Pedido {
  id: string;
  dataDoPedido: string;
  nomeCliente: string;
  status: string;
  valorTotal: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = 'http://localhost:8080/api/pedidos';
  constructor(private http: HttpClient) { }
  listarPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. O import agora pega tanto o serviço QUANTO a interface do mesmo arquivo
import { OrderService } from '../../services/order';
import { Pedido } from '../../services/order';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.scss']
})
export class OrderListComponent implements OnInit {

  // 2. A propriedade "pedidos" é agora uma lista do tipo "Pedido"
  pedidos: Pedido[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.listarPedidos().subscribe({
      next: (dados) => {
        this.pedidos = dados;
      },
      error: (err) => {
        console.error('Erro ao buscar pedidos:', err);
        alert('Ocorreu um erro ao buscar os pedidos.');
      }
    });
  }
}
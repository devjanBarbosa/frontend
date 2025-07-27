import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Pedido } from '../../services/order';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.scss']
})
export class OrderListComponent implements OnInit {
  
  pedidos: Pedido[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.listarPedidos().subscribe({
      next: (dados) => {
        this.pedidos = dados;
      },
      error: (err) => {
        console.error('Erro ao buscar pedidos:', err);
        alert('Ocorreu um erro ao buscar os pedidos. Verifique o console para mais detalhes.');
      }
    });
  }
}
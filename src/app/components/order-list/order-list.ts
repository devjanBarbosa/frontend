import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Pedido } from '../../services/order';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.scss']
})
export class OrderListComponent implements OnInit {
  
  pedidos: Pedido[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.carregarPedidos();
  }

  carregarPedidos(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.orderService.getPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.isLoading = false;
        console.log('Pedidos carregados:', this.pedidos);
      },
      error: (err) => {
        this.errorMessage = 'Falha ao carregar as encomendas. Verifique se está logado como administrador.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}
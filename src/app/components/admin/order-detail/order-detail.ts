import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService, Pedido } from '../../../services/order';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.scss']
})
export class OrderDetailComponent implements OnInit {
  
  pedido$: Observable<Pedido> | undefined;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const pedidoId = this.route.snapshot.paramMap.get('id');
    if (pedidoId) {
      this.pedido$ = this.orderService.getPedidoById(pedidoId);
    }
  }
}
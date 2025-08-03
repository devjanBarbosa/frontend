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
  pedidoId: string | null = null; // Guardamos o ID para usar no botão

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    // Busca o ID da rota quando o componente é inicializado
    this.pedidoId = this.route.snapshot.paramMap.get('id');
    this.carregarPedido();
  }

  // Método para carregar (ou recarregar) os detalhes do pedido
  carregarPedido(): void {
    if (this.pedidoId) {
      this.pedido$ = this.orderService.getPedidoById(this.pedidoId);
    }
  }

  // --- ESTE É O MÉTODO QUE O SEU BOTÃO CHAMA ---
  // Se este método estiver em falta, o botão não fará nada.
  concluirPedido(): void {
    if (!this.pedidoId) return;

    // Pede confirmação ao utilizador antes de prosseguir
    if (confirm('Tem a certeza que deseja marcar esta encomenda como "Entregue"?')) {
      this.orderService.concluirPedido(this.pedidoId).subscribe({
        next: () => {
          alert('Encomenda concluída com sucesso!');
          this.carregarPedido(); // Recarrega os dados para mostrar o novo status "ENTREGUE"
        },
        error: (err) => {
          alert('Ocorreu um erro ao concluir a encomenda.');
          console.error(err);
        }
      });
    }
  }
}
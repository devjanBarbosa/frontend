import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService, Pedido } from '../../../services/order';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TitleCasePipe],
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.scss']
})
export class OrderDetailComponent implements OnInit {
  
  pedido$: Observable<Pedido | null> | undefined;
  isLoading = true;
  
  listaDeStatus: string[] = [
    'PENDENTE', 
    'EM_PREPARACAO', 
    'PRONTO_PARA_RETIRADA', 
    'SAIU_PARA_ENTREGA', 
    'ENTREGUE', 
    'CANCELADO'
  ];
  statusSelecionado: string = '';

  private pedidoAtual: Pedido | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const pedidoId = this.route.snapshot.paramMap.get('id');
    if (pedidoId) {
      this.carregarPedido(pedidoId);
    } else {
      this.isLoading = false;
      this.pedido$ = of(null);
    }
  }

  carregarPedido(id: string): void {
    this.isLoading = true;
    this.pedido$ = this.orderService.getPedidoById(id).pipe(
      tap(data => {
        this.pedidoAtual = data;
        this.statusSelecionado = data.status;
        this.isLoading = false;
      }),
      catchError(() => {
        this.isLoading = false;
        this.pedidoAtual = null;
        this.toastr.error('Pedido não encontrado.');
        return of(null);
      })
    );
  }

  atualizarStatus(): void {
    if (!this.pedidoAtual || this.statusSelecionado === this.pedidoAtual.status) {
      return;
    }

    // A chamada para o serviço agora envia o status no formato correto
    this.orderService.atualizarStatus(this.pedidoAtual.id, this.statusSelecionado).subscribe({
      next: (pedidoAtualizado) => {
        this.toastr.success(`Status do pedido #${this.pedidoAtual?.id.substring(0,8)} alterado com sucesso!`);
        // Recarrega os dados para garantir que tudo está sincronizado
        this.carregarPedido(this.pedidoAtual!.id);
      },
      error: (err) => {
        this.toastr.error('Ocorreu um erro ao atualizar o status.');
        console.error(err);
      }
    });
  }
  
  imprimirPedido(): void {
    window.print();
  }

  copiarPix(): void {
    if (this.pedidoAtual?.pixCopiaECola) {
      navigator.clipboard.writeText(this.pedidoAtual.pixCopiaECola).then(() => {
        this.toastr.success('Código PIX copiado para a área de transferência!');
      }, () => {
        this.toastr.error('Falha ao copiar o código PIX.');
      });
    }
  }
}

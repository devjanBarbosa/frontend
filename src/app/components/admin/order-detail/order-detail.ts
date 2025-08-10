import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService, Pedido } from '../../../services/order'; // Verifique o caminho
import { FormsModule } from '@angular/forms'; // Importe o FormsModule
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // Adicione FormsModule e TitleCasePipe
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.scss']
})
export class OrderDetailComponent implements OnInit {
  
  pedido$: Observable<Pedido> | undefined;
  pedido: Pedido | undefined; // Para uso síncrono
  isLoading = true;

  // Lista de todos os status possíveis para o dropdown
  listaDeStatus: string[] = [
    'PENDENTE', 
    'EM_PREPARACAO', 
    'PRONTO_PARA_RETIRADA', 
    'SAIU_PARA_ENTREGA', 
    'ENTREGUE', 
    'CANCELADO'
  ];
  statusSelecionado: string = '';

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
    }
  }

  carregarPedido(id: string): void {
    this.isLoading = true;
    this.pedido$ = this.orderService.getPedidoById(id);
    this.pedido$.subscribe({
      next: (data) => {
        this.pedido = data;
        this.statusSelecionado = data.status; // Define o status inicial do select
        this.isLoading = false;
      },
      error: () => {
        this.pedido = undefined;
        this.isLoading = false;
      }
    });
  }

  // Função para atualizar o status
  atualizarStatus(): void {
    if (!this.pedido || this.statusSelecionado === this.pedido.status) {
      return; // Não faz nada se o status não mudou
    }

    // Chama o serviço para salvar a alteração no backend
    this.orderService.atualizarStatus(this.pedido.id, this.statusSelecionado).subscribe({
      next: (pedidoAtualizado) => {
        this.toastr.success(`Status do pedido #${this.pedido?.id.substring(0,8)} alterado com sucesso!`);
        // Recarrega os dados com a resposta do servidor para garantir consistência
        this.pedido = pedidoAtualizado;
        this.statusSelecionado = pedidoAtualizado.status;
      },
      error: (err) => {
        this.toastr.error('Ocorreu um erro ao atualizar o status.');
        console.error(err);
      }
    });
  }
  
  // Função para imprimir (abre a janela de impressão do navegador)
  imprimirPedido(): void {
    window.print();
  }

  // Função para formatar o nome do status para exibição
  formatarStatus(status: string): string {
    return status.replace('_', ' ');
  }
}
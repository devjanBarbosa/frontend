import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Pedido } from '../../services/order';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.scss']
})
export class OrderListComponent implements OnInit {
  
   todosOsPedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = []; // Usaremos esta lista para exibir na tela

  // Métricas para o Dashboard
  pedidosPendentes = 0;
  pedidosEmPreparacao = 0;
  pedidosProntosParaEntrega = 0;

  isLoading = true;
  errorMessage: string | null = null;

  constructor(private orderService: OrderService, private toastr: ToastrService) {} // Injete o Toastr

  ngOnInit(): void {
    this.carregarPedidos();
  }

  carregarPedidos(): void {
    this.isLoading = true;
    this.orderService.getPedidos().subscribe({
      next: (data) => {
        this.todosOsPedidos = data.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()); // Ordena por mais recente
        this.pedidosFiltrados = this.todosOsPedidos;
        this.calcularMetricas();
        this.isLoading = false;
      },
      error: (err) => { /* ... seu tratamento de erro ... */ }
    });
  }
  
  // NOVO: Calcula as métricas para o dashboard
  calcularMetricas(): void {
    this.pedidosPendentes = this.todosOsPedidos.filter(p => p.status === 'PENDENTE').length;
    this.pedidosEmPreparacao = this.todosOsPedidos.filter(p => p.status === 'EM_PREPARACAO').length;
    this.pedidosProntosParaEntrega = this.todosOsPedidos.filter(p => p.status === 'PRONTO_PARA_RETIRADA' || p.status === 'SAIU_PARA_ENTREGA').length;
  }

  // NOVO: Lógica para os filtros
  filtrarPorStatus(event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    if (status) {
      this.pedidosFiltrados = this.todosOsPedidos.filter(p => p.status === status);
    } else {
      this.pedidosFiltrados = this.todosOsPedidos;
    }
  }
  
  buscarPorCliente(event: Event): void {
    const termo = (event.target as HTMLInputElement).value.toLowerCase();
    this.pedidosFiltrados = this.todosOsPedidos.filter(p => p.nomeCliente.toLowerCase().includes(termo));
  }

  // NOVO: Lógica para a mudança rápida de status
  mudarStatus(pedidoId: string, event: Event): void {
    const novoStatus = (event.target as HTMLSelectElement).value;
    // Aqui você chamaria um método no seu OrderService para atualizar o status
    // Ex: this.orderService.atualizarStatus(pedidoId, novoStatus).subscribe(...)
    // No sucesso, você pode mostrar um toast de confirmação e recarregar os dados.
    this.toastr.success(`Status do pedido #${pedidoId.substring(0,8)} alterado para ${novoStatus}!`);
    this.carregarPedidos(); // Recarrega para atualizar as métricas
  }
}
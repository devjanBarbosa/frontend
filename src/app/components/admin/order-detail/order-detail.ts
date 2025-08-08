import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common'; // Pipes importados
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order';
import { Pedido } from '../../../services/order'; // Assumindo que a interface está aqui
import { StatusPedido, ListaStatusPedido } from '../../../services/status-pedido.enum';

// --- NOVA IMPORTAÇÃO ---
import Swal from 'sweetalert2'; // Importamos a biblioteca que acabámos de instalar

@Component({
  selector: 'app-order-detail',
  standalone: true,
  // Adicionamos os pipes ao array de imports
  imports: [CommonModule, RouterModule, FormsModule, DatePipe, CurrencyPipe, TitleCasePipe],
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.scss']
})
export class OrderDetailComponent implements OnInit {
  
  pedido: Pedido | null = null;
  listaDeStatus = ListaStatusPedido;
  statusSelecionado: StatusPedido | null = null;
  isLoading = true; // Variável para controlar o ecrã de loading

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.carregarPedido();
  }

  carregarPedido(): void {
    this.isLoading = true;
    const pedidoId = this.route.snapshot.paramMap.get('id');
    if (pedidoId) {
      this.orderService.getPedidoById(pedidoId).subscribe({
        next: (dadosDoPedido) => {
          this.pedido = dadosDoPedido;
          this.statusSelecionado = dadosDoPedido.status;
          this.isLoading = false; // Desativa o loading quando os dados chegam
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Não foi possível carregar os detalhes do pedido.',
          });
        }
      });
    }
  }

  // --- MÉTODO ATUALIZADO COM SWEETALERT2 ---
  atualizarStatus(): void {
    if (!this.pedido || !this.statusSelecionado) {
      return;
    }

    const statusFormatado = this.statusSelecionado.replace('_', ' ').toLowerCase();

    // Usando SweetAlert2 para confirmação
    Swal.fire({
      title: 'Tem a certeza?',
      text: `Deseja realmente alterar o status do pedido para "${statusFormatado}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5a9a5a', // Um verde amigável
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, alterar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      // Se o utilizador clicar em "Sim, alterar!"
      if (result.isConfirmed) {
        this.orderService.atualizarStatus(this.pedido!.id, this.statusSelecionado!).subscribe({
          next: (pedidoAtualizado) => {
            this.pedido = pedidoAtualizado;
            this.statusSelecionado = pedidoAtualizado.status;
            // Alerta de sucesso
            Swal.fire(
              'Atualizado!',
              'O status do pedido foi alterado com sucesso.',
              'success'
            );
          },
          error: (err) => {
            console.error(err);
            // Alerta de erro
            Swal.fire(
              'Erro!',
              'Ocorreu uma falha ao tentar atualizar o status.',
              'error'
            );
          }
        });
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderService, Pedido } from '../../services/order';
import { ToastrService } from 'ngx-toastr'; // 1. Importe o ToastrService

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-success.html',
  styleUrls: ['./order-success.scss']
})
export class OrderSuccessComponent implements OnInit {

   tempoExpiracao = 10 * 60; // 10 minutos em segundos
    tempoRestante: string = '';
    private timerInterval: any;

  pedido$: Observable<Pedido> | undefined;

  numeroWhatsApp = '5521997883761';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private toastr: ToastrService // 2. Injete o ToastrService
  ) {}

  ngOnInit(): void {
    const pedidoId = this.route.snapshot.paramMap.get('id');
    if (pedidoId) {
      this.pedido$ = this.orderService.getPedidoById(pedidoId);
    }
  }

  getLinkWhatsApp(pedido: Pedido): string {
    const mensagem = `Olá! Acabei de fazer o pedido #${pedido.id.substring(0, 8)} e gostaria de enviar o comprovativo do Pix.`;
    return `https://wa.me/${this.numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
  }

  // --- NOVA FUNÇÃO PARA COPIAR O CÓDIGO PIX ---
  copiarPix(codigo: string | null): void {
    if (!codigo) return;

    navigator.clipboard.writeText(codigo).then(() => {
      // Exibe uma notificação de sucesso
      this.toastr.success('Código PIX copiado para a área de transferência!');
    }, (err) => {
      console.error('Falha ao copiar o código: ', err);
      this.toastr.error('Não foi possível copiar o código.');
    });
  }

  iniciarContador(): void {
        this.timerInterval = setInterval(() => {
            const minutos = Math.floor(this.tempoExpiracao / 60);
            const segundos = this.tempoExpiracao % 60;

            this.tempoRestante = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

            if (--this.tempoExpiracao < 0) {
                clearInterval(this.timerInterval);
                // Lógica para quando o tempo expirar (ex: mostrar mensagem "Pedido expirado")
            }
        }, 1000);
    }

}
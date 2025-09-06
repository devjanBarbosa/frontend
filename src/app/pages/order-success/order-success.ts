import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, Subscription, interval, of, startWith, switchMap, takeWhile, tap, map } from 'rxjs';
import { OrderService, Pedido } from '../../services/order';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-success.html',
  styleUrls: ['./order-success.scss']
})
export class OrderSuccessComponent implements OnInit, OnDestroy {

  pedido$: Observable<Pedido | null> | undefined;
  private pollingSubscription: Subscription | undefined;
  
  tempoRestante: string = '';
  private timerSubscription: Subscription | undefined;

  numeroWhatsApp = '5521997883761';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const pedidoId = this.route.snapshot.paramMap.get('id');
    if (pedidoId) {
      this.pedido$ = this.orderService.getPedidoById(pedidoId).pipe(
        tap(pedido => {
          if (pedido && pedido.status === 'PENDENTE') {
            const dataCriacao = new Date(pedido.dataCriacao); 
            const dataExpiracao = new Date(dataCriacao.getTime() + 10 * 60000);
            this.iniciarContador(dataExpiracao);
            this.iniciarVerificacaoDeStatus(pedidoId);
          }
        })
      );
    } else {
        this.pedido$ = of(null);
    }
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
    this.timerSubscription?.unsubscribe();
  }

  private iniciarVerificacaoDeStatus(pedidoId: string): void {
    this.pollingSubscription = interval(5000) // A cada 5 segundos
      .pipe(
        startWith(0), // Executa imediatamente
        switchMap(() => this.orderService.getPedidoById(pedidoId)),
        takeWhile(pedido => pedido.status === 'PENDENTE', true) // Continua enquanto o status for PENDENTE
      )
      .subscribe(pedido => {
        if (pedido && pedido.status !== 'PENDENTE') {
          this.pollingSubscription?.unsubscribe();
          this.timerSubscription?.unsubscribe();
          this.toastr.success('Pagamento confirmado! Estamos preparando seu pedido.', 'Sucesso!');
          this.router.navigate(['/']); // Redireciona para a home
        }
      });
  }

  private iniciarContador(dataExpiracao: Date): void {
    this.timerSubscription = interval(1000).pipe(
      map(() => {
        const agora = new Date().getTime();
        const distancia = dataExpiracao.getTime() - agora;
        
        if (distancia < 0) {
          return '00:00';
        }
        
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);
        
        return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
      }),
      takeWhile(tempo => tempo !== '00:00', true)
    ).subscribe(tempoFormatado => {
      this.tempoRestante = tempoFormatado;
      if(tempoFormatado === '00:00') {
         this.toastr.warning('O tempo para pagamento expirou.', 'PIX Expirado');
         this.pollingSubscription?.unsubscribe(); // Para a verificação também
      }
    });
  }

  getLinkWhatsApp(pedido: Pedido): string {
    const mensagem = `Olá! Acabei de fazer o pedido #${pedido.id.substring(0, 8)} e gostaria de enviar o comprovativo do Pix.`;
    return `https://wa.me/${this.numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
  }

  copiarPix(codigo: string | null | undefined): void {
    if (!codigo) return;
    navigator.clipboard.writeText(codigo).then(() => {
      this.toastr.success('Código PIX copiado para a área de transferência!');
    }, (err) => {
      this.toastr.error('Não foi possível copiar o código.');
    });
  }
}
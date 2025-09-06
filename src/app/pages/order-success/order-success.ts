import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, Subscription, interval, of, startWith, switchMap, takeWhile, tap, map } from 'rxjs';
import { OrderService, Pedido } from '../../services/order';
import { ToastrService } from 'ngx-toastr';
import { GoogleAnalyticsService } from '../../services/googleAnalyticsService';

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
    private router: Router,
    private googleAnalyticsService: GoogleAnalyticsService
  ) {}

  ngOnInit(): void {
    const pedidoId = this.route.snapshot.paramMap.get('id');
    if (pedidoId) {
      this.pedido$ = this.orderService.getPedidoById(pedidoId).pipe(
        tap(pedido => {
          // --- CORREÇÃO APLICADA AQUI ---
          // Agora, a conversão é reportada logo que os dados do pedido chegam.
          if (pedido) {
            this.reportarConversaoUmaVez(pedido);

            // A lógica do timer e do polling só inicia se o pagamento estiver pendente.
            if (pedido.status === 'PENDENTE') {
              const dataCriacao = new Date(pedido.dataCriacao); 
              const dataExpiracao = new Date(dataCriacao.getTime() + 10 * 60000);
              this.iniciarContador(dataExpiracao);
              this.iniciarVerificacaoDeStatus(pedidoId);
            }
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

  private reportarConversaoUmaVez(pedido: Pedido): void {
    const conversionSentKey = `conversion_sent_${pedido.id}`;
    
    if (!sessionStorage.getItem(conversionSentKey)) {
      
      const itemsParaAnalytics = pedido.itens.map(item => ({
        item_id: item.produtoId,
        item_name: item.nomeProduto,
        price: item.precoUnitario,
        quantity: item.quantidade
      }));

      this.googleAnalyticsService.reportarCompra(pedido.id, pedido.valorTotal, itemsParaAnalytics);
      
      sessionStorage.setItem(conversionSentKey, 'true');
    }
  }

  private iniciarVerificacaoDeStatus(pedidoId: string): void {
    this.pollingSubscription = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.orderService.getPedidoById(pedidoId)),
        takeWhile(pedido => !!pedido && pedido.status === 'PENDENTE', true)
      )
      .subscribe(pedido => {
        if (pedido && pedido.status !== 'PENDENTE') {
          this.pollingSubscription?.unsubscribe();
          this.timerSubscription?.unsubscribe();
          this.toastr.success('Pagamento confirmado! Estamos preparando seu pedido.', 'Sucesso!');
          
          setTimeout(() => {
            this.router.navigate(['/']); 
          }, 3000);
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
         this.pollingSubscription?.unsubscribe();
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

  public formatarQrCodeBase64(base64String: string): string {
    if (base64String.startsWith('data:image')) {
      return base64String;
    }
    return `data:image/png;base64,${base64String}`;
  }
}
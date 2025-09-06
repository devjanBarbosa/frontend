import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, of } from 'rxjs';
import { takeUntil, switchMap, tap, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { CartService, CartItem } from '../../services/cart';
import { OrderService, PedidoPayload } from '../../services/order';
import { CepService } from '../../services/CepService';
import { ConfiguracaoService } from '../../services/ConfiguracaoService';
import { GoogleAnalyticsService } from '../../services/googleAnalyticsService';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  @ViewChild('numeroInput') numeroInput!: ElementRef<HTMLInputElement>;

  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  subtotal = 0;
  total = 0;
  desconto = 0;
  taxaEntrega = 0;
  isCepLoading = false;
  isCepValid = false;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private toastr: ToastrService,
    private cepService: CepService,
    private configuracaoService: ConfiguracaoService,
     private googleAnalyticsService: GoogleAnalyticsService
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    this.carregarDadosIniciais();
    this.observarMudancasNoFormulario();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get metodoEntrega(): AbstractControl | null { return this.checkoutForm.get('metodoEntrega'); }
  get cep(): AbstractControl | null { return this.checkoutForm.get('cep'); }
  get totalItens(): number { return this.cartItems.reduce((acc, item) => acc + item.quantidade, 0); }

  private iniciarFormulario(): void {
    this.checkoutForm = this.fb.group({
      nomeCliente: ['', Validators.required],
      whatsappCliente: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]],
      metodoEntrega: ['Delivery', Validators.required],
      cep: [''],
      endereco: [''],  // não mais disabled
      bairro: [''],
      numero: [''],
      complemento: ['']
    });
  }

  private carregarDadosIniciais(): void {
    this.configuracaoService.getTaxaEntrega()
      .pipe(takeUntil(this.destroy$))
      .subscribe(taxa => { this.taxaEntrega = taxa; this.calcularTotal(); });

    this.cartService.items$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => { this.cartItems = items; this.calcularTotal(); });
  }

  private observarMudancasNoFormulario(): void {
    this.metodoEntrega?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => { this.ajustarValidadoresDeEndereco(value === 'Delivery'); this.calcularTotal(); });

    this.ajustarValidadoresDeEndereco(this.metodoEntrega?.value === 'Delivery');

    this.cep?.valueChanges.pipe(
      takeUntil(this.destroy$),
      tap(() => { this.isCepValid = false; this.checkoutForm.patchValue({ endereco: '', bairro: '' }); }),
      switchMap(cepValue => {
        if (cepValue && cepValue.length === 8 && this.cep?.valid) {
          this.isCepLoading = true;
          return this.cepService.buscar(cepValue).pipe(
            catchError(() => { this.toastr.error('CEP não encontrado.', 'Erro de CEP'); return of(null); })
          );
        }
        return of(null);
      })
    ).subscribe(endereco => {
      this.isCepLoading = false;
      if (endereco?.logradouro) {
        this.checkoutForm.patchValue({ endereco: endereco.logradouro, bairro: endereco.bairro });
        this.isCepValid = true;
        setTimeout(() => {
          this.numeroInput.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          this.numeroInput.nativeElement.focus();
        }, 50);
      }
    });
  }

  private ajustarValidadoresDeEndereco(isDelivery: boolean): void {
    const campos = { cep: [Validators.required, Validators.pattern('^[0-9]{8}$')], numero: [Validators.required] };
    for (const [campo, validadores] of Object.entries(campos)) {
      const control = this.checkoutForm.get(campo);
      if (isDelivery) control?.setValidators(validadores);
      else control?.clearValidators();
      control?.updateValueAndValidity();
    }
  }

  private calcularTotal(): void {
    this.subtotal = this.cartItems.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);
    const frete = (this.metodoEntrega?.value === 'Delivery') ? this.taxaEntrega : 0;
    this.total = this.subtotal + frete - this.desconto;
  }

  aplicarCupom(codigo: string): void {
    if (codigo.toUpperCase() === 'LEDA10') { this.desconto = this.subtotal * 0.10; this.toastr.success('Cupom aplicado!', 'Sucesso'); }
    else { this.desconto = 0; this.toastr.error('Cupom inválido.', 'Ops!'); }
    this.calcularTotal();
  }

  incrementarQuantidade(item: CartItem): void { this.cartService.adicionarAoCarrinho(item.produto); }
  decrementarQuantidade(item: CartItem): void { this.cartService.decrementarQuantidade(item); }
  removerItem(item: CartItem): void { this.cartService.removerItem(item); }

  onSubmit(): void {
    if (this.checkoutForm.invalid || this.cartItems.length === 0) { this.checkoutForm.markAllAsTouched(); this.toastr.warning('Preencha todos os campos obrigatórios.', 'Atenção'); return; }
    this.isSubmitting = true;
    const formValues = this.checkoutForm.getRawValue();
    const pedidoPayload: PedidoPayload = {
      ...formValues,
      metodoPagamento: 'Pix',
      itens: this.cartItems.map(item => ({ produtoId: item.produto.id, quantidade: item.quantidade }))
    };
    this.orderService.criarPedido(pedidoPayload).subscribe({
      next: (res) => { this.toastr.success('Pedido realizado!', 'Sucesso'); this.cartService.limparCarrinho(); this.router.navigate(['/pedido-sucesso', res.id]); this.isSubmitting = false; },
      error: (err) => { this.isSubmitting = false; this.toastr.error(err.error?.error || 'Erro ao finalizar o pedido.', 'Falha!'); }
    });
  }

  comprarPeloWhatsApp(): void {
    if (this.checkoutForm.invalid || this.cartItems.length === 0) { this.checkoutForm.markAllAsTouched(); this.toastr.warning('Preencha seu nome e WhatsApp antes.', 'Atenção'); return; }

    const formValues = this.checkoutForm.getRawValue();
    let mensagem = `Olá, Leda! Gostaria de fazer o seguinte pedido:\n\n*Cliente:* ${formValues.nomeCliente}\n*WhatsApp:* ${formValues.whatsappCliente}\n\n*Itens do Pedido:*\n`;
    this.cartItems.forEach(item => { mensagem += `- ${item.quantidade}x ${item.produto.nome}\n`; });
    mensagem += `\n*Subtotal:* ${this.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;

    if (formValues.metodoEntrega === 'Delivery') mensagem += `*Entrega:* ${this.taxaEntrega.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n*Endereço:* ${formValues.endereco}, ${formValues.numero}, ${formValues.bairro}\n`;
    else mensagem += '*Entrega:* Vou retirar na loja\n';
    if (this.desconto > 0) mensagem += `*Desconto:* -${this.desconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
    mensagem += `*Total:* ${this.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\nObrigada!`;

    const linkWhatsApp = `https://wa.me/5521997883761?text=${encodeURIComponent(mensagem)}`;
    window.open(linkWhatsApp, '_blank');
  }
}

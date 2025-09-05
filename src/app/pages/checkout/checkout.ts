import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, of } from 'rxjs';
import { takeUntil, switchMap, tap, debounceTime } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { CartService, CartItem } from '../../services/cart';
import { OrderService, PedidoPayload } from '../../services/order'; 
import { CepService } from '../../services/CepService';
import { ConfiguracaoService } from '../../services/ConfiguracaoService';

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
  taxaEntrega = 0;
  desconto = 0;
  isCepLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private toastr: ToastrService,
    private cepService: CepService,
    private configuracaoService: ConfiguracaoService
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

  // Getters para facilitar o acesso aos controles no template
  get nomeCliente(): AbstractControl | null { return this.checkoutForm.get('nomeCliente'); }
  get whatsappCliente(): AbstractControl | null { return this.checkoutForm.get('whatsappCliente'); }
  get metodoEntrega(): AbstractControl | null { return this.checkoutForm.get('metodoEntrega'); }
  get cep(): AbstractControl | null { return this.checkoutForm.get('cep'); }

  private iniciarFormulario(): void {
    this.checkoutForm = this.fb.group({
      nomeCliente: ['', Validators.required],
      whatsappCliente: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]],
      metodoEntrega: ['Delivery', Validators.required],
      metodoPagamento: ['Pagar na Entrega', Validators.required],
      cep: [''],
      endereco: [{ value: '', disabled: true }],
      bairro: [{ value: '', disabled: true }],
      numero: [''],
      complemento: [''],
      cupom: ['']
    });
  }

  private carregarDadosIniciais(): void {
    this.configuracaoService.getTaxaEntrega().pipe(takeUntil(this.destroy$)).subscribe(taxa => {
      this.taxaEntrega = taxa;
      this.calcularTotal();
    });

    this.cartService.items$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.cartItems = items;
      this.calcularTotal();
    });
  }

  private observarMudancasNoFormulario(): void {
    this.metodoEntrega?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.ajustarValidadoresDeEndereco(value === 'Delivery');
      this.calcularTotal();
    });
    this.ajustarValidadoresDeEndereco(this.metodoEntrega?.value === 'Delivery');

    this.cep?.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      tap(() => {
        if (this.cep?.valid) {
          this.checkoutForm.patchValue({ endereco: '', bairro: '' });
        }
      }),
      switchMap(cepValue => {
        if (cepValue && cepValue.length === 8 && this.cep?.valid) {
          this.isCepLoading = true;
          return this.cepService.buscar(cepValue);
        }
        return of(null);
      })
    ).subscribe(endereco => {
      this.isCepLoading = false;
      if (endereco) {
        this.checkoutForm.patchValue({
          endereco: endereco.logradouro,
          bairro: endereco.bairro
        });
        // --- CORREÇÃO APLICADA AQUI ---
        // Foca no elemento de input do número após preencher o endereço
        this.numeroInput?.nativeElement.focus();
      } else if (this.cep?.value.length === 8) {
        this.toastr.error('CEP não encontrado. Verifique o número digitado.', 'Erro de CEP');
      }
    });
  }
  
  private ajustarValidadoresDeEndereco(isDelivery: boolean): void {
    const camposEndereco = ['cep', 'numero'];
    camposEndereco.forEach(campo => {
      const control = this.checkoutForm.get(campo);
      if (isDelivery) {
        control?.setValidators(Validators.required);
        if (campo === 'cep') {
          control?.addValidators(Validators.pattern('^[0-9]{8}$'));
        }
      } else {
        control?.clearValidators();
      }
      control?.updateValueAndValidity();
    });
  }

  private calcularTotal(): void {
    this.subtotal = this.cartItems.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);
    const taxa = (this.metodoEntrega?.value === 'Delivery') ? this.taxaEntrega : 0;
    this.total = this.subtotal + taxa - this.desconto;
  }

  aplicarCupom(): void {
      const cupom = this.checkoutForm.get('cupom')?.value.toUpperCase();
      if (cupom === 'LEDA10') {
          this.desconto = 10.00;
          this.calcularTotal();
          this.toastr.success('Cupom de R$ 10,00 aplicado com sucesso!');
      } else {
          this.toastr.error('Cupom inválido.');
      }
  }

  selectPaymentMethod(method: string): void {
      this.checkoutForm.get('metodoPagamento')?.setValue(method);
  }

  incrementarQuantidade(item: CartItem): void { this.cartService.adicionarAoCarrinho(item.produto); }
  decrementarQuantidade(item: CartItem): void { this.cartService.decrementarQuantidade(item); }
  removerItem(item: CartItem): void { this.cartService.removerItem(item); }

  onSubmit(): void {
    if (this.checkoutForm.invalid || this.cartItems.length === 0) {
      this.checkoutForm.markAllAsTouched();
      this.toastr.warning('Por favor, preencha todos os campos obrigatórios.', 'Atenção');
      return;
    }
    
    const formValues = this.checkoutForm.getRawValue();
    
    const pedidoPayload: PedidoPayload = {
      ...formValues,
      itens: this.cartItems.map(item => ({
        produtoId: item.produto.id,
        quantidade: item.quantidade
      }))
    };
    
    this.orderService.criarPedido(pedidoPayload).subscribe({
      next: (respostaDoPedido) => {
        this.toastr.success('Entraremos em contato pelo WhatsApp para confirmar.', 'Pedido Realizado!');
        this.cartService.limparCarrinho();
        this.router.navigate(['/pedido-sucesso', respostaDoPedido.id]);
      },
      error: (err) => {
        console.error('Erro ao criar o pedido:', err);
        const mensagemErro = err.error?.error || 'Ocorreu um erro ao finalizar seu pedido.';
        this.toastr.error(mensagemErro, 'Falha!');
      }
    });
  }
}


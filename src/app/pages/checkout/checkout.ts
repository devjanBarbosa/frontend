import { Component, OnInit, ElementRef, ViewChild, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, combineLatest } from 'rxjs';
import { switchMap, tap, debounceTime, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { CartService, CartItem } from '../../services/cart';
import { OrderService, PedidoPayload } from '../../services/order';
import { CepService } from '../../services/CepService';
import { ConfiguracaoService } from '../../services/ConfiguracaoService';

// --- BOAS PRÁTICAS: Constantes para evitar "Magic Strings" ---
const FormKeys = {
  NOME_CLIENTE: 'nomeCliente',
  WHATSAPP_CLIENTE: 'whatsappCliente',
  METODO_ENTREGA: 'metodoEntrega',
  METODO_PAGAMENTO: 'metodoPagamento',
  CEP: 'cep',
  ENDERECO: 'endereco',
  BAIRRO: 'bairro',
  NUMERO: 'numero',
  COMPLEMENTO: 'complemento',
  CUPOM: 'cupom',
} as const;

const DeliveryMethods = {
  DELIVERY: 'Delivery',
  PICKUP: 'Retirar na Loja',
} as const;

const PaymentMethods = {
  ON_DELIVERY: 'Pagar na Entrega',
  PIX: 'Pix',
} as const;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
})
export class CheckoutComponent implements OnInit {
  // --- STATE DO COMPONENTE ---
  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  subtotal = 0;
  total = 0;
  taxaEntrega = 0;
  desconto = 0;
  isCepLoading = false;

  @ViewChild('numeroInput') private numeroInput!: ElementRef<HTMLInputElement>;
  
  // --- BOAS PRÁTICAS: Injeção de dependência moderna e `takeUntilDestroyed` ---
  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly cepService = inject(CepService);
  private readonly configuracaoService = inject(ConfiguracaoService);
  private readonly destroyRef = inject(DestroyRef);

  // --- LIFECYCLE HOOK ---
  ngOnInit(): void {
    this.initializeForm();
    this.initializeComponentStreams();
    this.observeFormChanges();
  }

  // --- GETTERS PARA O TEMPLATE ---
  get cep(): AbstractControl | null { return this.checkoutForm.get(FormKeys.CEP); }

  // --- MÉTODOS PÚBLICOS PARA O TEMPLATE ---
  incrementarQuantidade(item: CartItem): void { this.cartService.adicionarAoCarrinho(item.produto); }
  decrementarQuantidade(item: CartItem): void { this.cartService.decrementarQuantidade(item); }
  removerItem(item: CartItem): void { this.cartService.removerItem(item); }
  
  selectPaymentMethod(method: string): void {
    this.checkoutForm.get(FormKeys.METODO_PAGAMENTO)?.setValue(method);
  }

  isDeliverySelected(): boolean {
    return this.checkoutForm.get(FormKeys.METODO_ENTREGA)?.value === DeliveryMethods.DELIVERY;
  }
  
  isPaymentMethodSelected(method: string): boolean {
    return this.checkoutForm.get(FormKeys.METODO_PAGAMENTO)?.value === method;
  }
  
  aplicarCupom(): void {
    const cupom = this.checkoutForm.get(FormKeys.CUPOM)?.value?.toUpperCase();
    if (cupom === 'LEDA10') {
      this.desconto = 10.00;
      this.calculateTotal();
      this.toastr.success('Cupom de R$ 10,00 aplicado com sucesso!');
    } else {
      this.toastr.error('Cupom inválido.');
    }
  }

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

  // --- LÓGICA PRIVADA E INICIALIZAÇÃO ---
  private initializeForm(): void {
    this.checkoutForm = this.fb.group({
      [FormKeys.NOME_CLIENTE]: ['', Validators.required],
      [FormKeys.WHATSAPP_CLIENTE]: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]],
      [FormKeys.METODO_ENTREGA]: [DeliveryMethods.DELIVERY, Validators.required],
      [FormKeys.METODO_PAGAMENTO]: [PaymentMethods.ON_DELIVERY, Validators.required],
      [FormKeys.CEP]: [''],
      [FormKeys.ENDERECO]: [{ value: '', disabled: true }],
      [FormKeys.BAIRRO]: [{ value: '', disabled: true }],
      [FormKeys.NUMERO]: [''],
      [FormKeys.COMPLEMENTO]: [''],
      [FormKeys.CUPOM]: ['']
    });
  }

  private initializeComponentStreams(): void {
    // --- BOAS PRÁTICAS: Carregamento de dados declarativo com `combineLatest` ---
    combineLatest([
      this.configuracaoService.getTaxaEntrega(),
      this.cartService.items$
    ]).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([taxa, items]) => {
        this.taxaEntrega = taxa;
        this.cartItems = items;
        this.calculateTotal();
      });
  }

  private observeFormChanges(): void {
    this.observeDeliveryMethodChanges();
    this.observeCepChanges();
  }

  private observeDeliveryMethodChanges(): void {
    const metodoEntregaCtrl = this.checkoutForm.get(FormKeys.METODO_ENTREGA);
    if (metodoEntregaCtrl) {
      metodoEntregaCtrl.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(value => {
          this.toggleAddressValidators(value === DeliveryMethods.DELIVERY);
          this.calculateTotal();
        });
      // Seta o estado inicial dos validadores
      this.toggleAddressValidators(metodoEntregaCtrl.value === DeliveryMethods.DELIVERY);
    }
  }

  private observeCepChanges(): void {
    this.cep?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      debounceTime(400),
      tap(() => this.checkoutForm.patchValue({ [FormKeys.ENDERECO]: '', [FormKeys.BAIRRO]: '' })),
      switchMap(cepValue => {
        const cepValido = cepValue && cepValue.length === 8 && this.cep?.valid;
        if (cepValido) {
          this.isCepLoading = true;
          return this.cepService.buscar(cepValue).pipe(
            catchError(() => {
              this.toastr.error('CEP não encontrado. Verifique o número digitado.', 'Erro de CEP');
              return of(null);
            })
          );
        }
        return of(null);
      })
    ).subscribe(endereco => {
      this.isCepLoading = false;
      if (endereco) {
        this.checkoutForm.patchValue({
          [FormKeys.ENDERECO]: endereco.logradouro,
          [FormKeys.BAIRRO]: endereco.bairro
        });
        // Foca no campo de número para melhor UX
        this.numeroInput?.nativeElement.focus();
      }
    });
  }

  private toggleAddressValidators(isDelivery: boolean): void {
    const addressFields = [FormKeys.CEP, FormKeys.NUMERO];
    addressFields.forEach(fieldName => {
      const control = this.checkoutForm.get(fieldName);
      if (isDelivery) {
        const validators = [Validators.required];
        if (fieldName === FormKeys.CEP) {
          validators.push(Validators.pattern('^[0-9]{8}$'));
        }
        control?.setValidators(validators);
      } else {
        control?.clearValidators();
      }
      control?.updateValueAndValidity();
    });
  }

  private calculateTotal(): void {
    this.subtotal = this.cartItems.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);
    const deliveryFee = this.isDeliverySelected() ? this.taxaEntrega : 0;
    this.total = this.subtotal + deliveryFee - this.desconto;
  }
}

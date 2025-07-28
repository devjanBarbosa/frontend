import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { PedidoService, PedidoPayload } from '../../services/pedido';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  subtotal = 0;
  total = 0;
  taxaEntrega = 5.00;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    this.carregarDadosDoCarrinho();
    this.observarMudancas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private iniciarFormulario(): void {
    this.checkoutForm = this.fb.group({
      nomeCliente: ['', Validators.required],
      whatsappCliente: ['', Validators.required],
      metodoEntrega: ['Delivery', Validators.required],
      metodoPagamento: ['Pagar na Entrega', Validators.required],
      endereco: [''],
      bairro: ['']
    });
  }

  private carregarDadosDoCarrinho(): void {
    this.cartService.items$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.cartItems = items;
      this.calcularTotal();
    });
  }

  private calcularTotal(): void {
    this.subtotal = this.cartItems.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);
    const entregaSelecionada = this.checkoutForm.get('metodoEntrega')?.value;
    
    this.total = (entregaSelecionada === 'Delivery')
      ? this.subtotal + this.taxaEntrega
      : this.subtotal;
  }

  private observarMudancas(): void {
    this.checkoutForm.get('metodoEntrega')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      const enderecoControl = this.checkoutForm.get('endereco');
      const bairroControl = this.checkoutForm.get('bairro');
      
      if (value === 'Delivery') {
        enderecoControl?.setValidators([Validators.required]);
        bairroControl?.setValidators([Validators.required]);
      } else {
        enderecoControl?.clearValidators();
        bairroControl?.clearValidators();
      }
      enderecoControl?.updateValueAndValidity();
      bairroControl?.updateValueAndValidity();
      this.calcularTotal();
    });
  }

  // Métodos para gerir o carrinho nesta página
  incrementarQuantidade(item: CartItem): void { this.cartService.adicionarAoCarrinho(item.produto); }
  decrementarQuantidade(item: CartItem): void { this.cartService.decrementarQuantidade(item); }
  removerItem(item: CartItem): void { this.cartService.removerItem(item); }

  onSubmit(): void {
    if (this.checkoutForm.invalid || this.cartItems.length === 0) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const formValues = this.checkoutForm.value;
    const pedidoPayload: PedidoPayload = {
      ...formValues,
      itens: this.cartItems.map(item => ({
        produto: { id: item.produto.id },
        quantidade: item.quantidade
      }))
    };

    this.pedidoService.criarEncomenda(pedidoPayload).subscribe({
      next: (resposta) => { // O que fazer em caso de sucesso real
        console.log('Encomenda criada com sucesso!', resposta);
        alert('Encomenda realizada com sucesso!');
        this.cartService.limparCarrinho();
        this.router.navigate(['/']);
      },
      error: (err) => { // O que fazer em caso de erro
        // ESTE LOG AGORA NOS DARÁ MAIS DETALHES
        console.error('Falha ao criar a encomenda. Objeto de erro:', err);
        
        let mensagemErro = 'Ocorreu um erro ao finalizar a sua encomenda.';
        if (err.status === 0) {
          mensagemErro = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        } else if (err.error && typeof err.error === 'string') {
          mensagemErro += ` Detalhe: ${err.error}`;
        }
        
        alert(mensagemErro);
      }
    });
  }
}
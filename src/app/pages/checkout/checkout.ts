import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

import { CartService, CartItem } from '../../services/cart';
import { OrderService, PedidoPayload, Pedido } from '../../services/order'; 

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  subtotal = 0;
  total = 0;
  taxaEntrega = 5.00;
  enderecoVisivel = true;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    this.carregarDadosDoCarrinho();
    this.observarMetodoDeEntrega();
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
      cep: [''],
      endereco: [''],
      bairro: [''],
      numero: [''],
      complemento: ['']
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

  private observarMetodoDeEntrega(): void {
    this.checkoutForm.get('metodoEntrega')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.enderecoVisivel = value === 'Delivery';
      const cepControl = this.checkoutForm.get('cep');
      const numeroControl = this.checkoutForm.get('numero');
      
      if (this.enderecoVisivel) {
        cepControl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
        numeroControl?.setValidators([Validators.required]);
      } else {
        cepControl?.clearValidators();
        numeroControl?.clearValidators();
      }
      cepControl?.updateValueAndValidity();
      numeroControl?.updateValueAndValidity();
      this.calcularTotal();
    });
    // Dispara a validação inicial
    this.checkoutForm.get('metodoEntrega')?.updateValueAndValidity();
  }
  
  buscarEnderecoPorCep(): void {
    const cep = this.checkoutForm.get('cep')?.value;

    if (cep && cep.length === 8) {
      this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe((dados: any) => {
        if (!dados.erro) {
          this.checkoutForm.patchValue({
            endereco: dados.logradouro,
            bairro: dados.bairro
          });
        } else {
          this.toastr.error('CEP não encontrado. Por favor, verifique o número.', 'Erro');
          this.checkoutForm.patchValue({ endereco: '', bairro: '' });
        }
      });
    }
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
    const formValues = this.checkoutForm.value;
    
    const pedidoPayload: PedidoPayload = {
      ...formValues,
      itens: this.cartItems.map(item => ({
        produtoId: item.produto.id,
        quantidade: item.quantidade
      }))
    };
    
    this.orderService.criarPedido(pedidoPayload).subscribe({
      // --- CORREÇÃO APLICADA AQUI ---
      next: (respostaDoPedido) => {
        this.toastr.success('Entraremos em contacto pelo WhatsApp para confirmar.', 'Encomenda Realizada!');
        this.cartService.limparCarrinho();
        // Redireciona para a página de sucesso com o ID do pedido criado.
        this.router.navigate(['/pedido-sucesso', respostaDoPedido.id]);
      },
      error: (err) => {
        console.error('Erro ao criar a encomenda:', err);
        const mensagemErro = err.error?.error || 'Ocorreu um erro ao finalizar a sua encomenda.';
        this.toastr.error(mensagemErro, 'Falha!');
      }
    });
  }
}

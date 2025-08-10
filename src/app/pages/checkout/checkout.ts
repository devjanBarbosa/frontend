import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { PedidoService, PedidoPayload } from '../../services/pedido';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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

  // --- NOVA VARIÁVEL DE CONTROLE ---
  enderecoVisivel = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private pedidoService: PedidoService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    this.carregarDadosDoCarrinho();
    this.observarMudancas();
    this.buscarTaxaDeEntrega();
  }
  
  // O método iniciarFormulario permanece o mesmo
  private iniciarFormulario(): void {
    this.checkoutForm = this.fb.group({
      nomeCliente: ['', Validators.required],
      whatsappCliente: ['', Validators.required],
      metodoEntrega: ['Delivery', Validators.required],
      metodoPagamento: ['Pagar na Entrega', Validators.required],
      cep: [''],
      endereco: [''],
      numero: [''],
      complemento: [''],
      bairro: ['']
    });
  }

  // --- FUNÇÃO DE BUSCA DE CEP ATUALIZADA ---
  buscarEnderecoPorCep(): void {
    const cep = this.checkoutForm.get('cep')?.value;

    if (cep && cep.length === 8) {
      this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe((dados: any) => {
        if (!dados.erro) {
          this.checkoutForm.patchValue({
            endereco: dados.logradouro,
            bairro: dados.bairro
          });
          this.enderecoVisivel = true; // <-- MOSTRA os campos de endereço
        } else {
          alert('CEP não encontrado.');
          this.checkoutForm.patchValue({ endereco: '', bairro: '' });
          this.enderecoVisivel = false; // <-- ESCONDE os campos se o CEP for inválido
        }
      });
    } else {
      this.enderecoVisivel = false; // <-- ESCONDE se o CEP for apagado ou inválido
    }
  }

  // --- FUNÇÃO DE OBSERVAR MUDANÇAS ATUALIZADA ---
  private observarMudancas(): void {
    this.checkoutForm.get('metodoEntrega')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      const cepControl = this.checkoutForm.get('cep');
      const numeroControl = this.checkoutForm.get('numero');
      
      if (value === 'Delivery') {
        cepControl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
        numeroControl?.setValidators([Validators.required]);
      } else {
        cepControl?.clearValidators();
        numeroControl?.clearValidators();
        this.enderecoVisivel = false; // <-- ESCONDE os campos se o método não for Delivery
      }
      cepControl?.updateValueAndValidity();
      numeroControl?.updateValueAndValidity();
      this.calcularTotal();
    });
  }

  // Nenhum dos outros métodos (ngOnDestroy, carregarDadosDoCarrinho, onSubmit, etc.) precisa de alteração.
  // ...
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private carregarDadosDoCarrinho(): void {
    this.cartService.items$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.cartItems = items;
      this.calcularTotal();
    });
  }
  
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
        produtoId: item.produto.id,
        quantidade: item.quantidade
      }))
    };

    // --- LÓGICA DE REDIRECIONAMENTO CORRIGIDA ---
    this.pedidoService.criarEncomenda(pedidoPayload).subscribe({
      next: (resposta) => {
        // Log para depuração na consola do navegador (F12)
        console.log('Pedido criado com sucesso! Resposta da API:', resposta);

        // Verificação de segurança para garantir que a resposta tem um ID
        if (resposta && resposta.id) {
          this.cartService.limparCarrinho();
          // NAVEGA para a página de sucesso, passando o ID do novo pedido
          this.router.navigate(['/pedido-sucesso', resposta.id]);
        } else {
          // Se não houver ID, algo está errado com a resposta do backend
          console.error('A resposta do backend não continha um ID de pedido válido.');
          alert('Ocorreu um erro ao processar o seu pedido. Por favor, tente novamente.');
          this.router.navigate(['/']); // Em caso de erro inesperado, volta para a home
        }
      },
      error: (err) => {
        console.error('Falha ao criar a encomenda:', err);
        let mensagem = 'Ocorreu um erro ao finalizar a sua encomenda.';
        if (err.error && err.error.error) {
          mensagem += ` Detalhe: ${err.error.error}`;
        }
        alert(mensagem);
      }
    });
  }

   private buscarTaxaDeEntrega(): void {
    this.http.get<{ taxaEntrega: string }>('http://localhost:8080/api/config/taxa-entrega')
      .subscribe({
        next: (response) => {
          this.taxaEntrega = parseFloat(response.taxaEntrega);
          this.calcularTotal(); // Recalcula o total com a nova taxa
        },
        error: (err) => {
          console.error("Erro ao buscar taxa de entrega, usando valor padrão.", err);
          this.taxaEntrega = 5.00; // Valor de fallback em caso de erro
          this.calcularTotal();
        }
      });
  }

   private calcularTotal(): void {
    this.subtotal = this.cartItems.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);
    const entregaSelecionada = this.checkoutForm.get('metodoEntrega')?.value;
    
    // Agora a taxaEntrega é dinâmica
    this.total = (entregaSelecionada === 'Delivery')
      ? this.subtotal + this.taxaEntrega
      : this.subtotal;
  }

}
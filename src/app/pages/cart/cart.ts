import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartItem, CartService } from '../../services/cart';
import { Observable } from 'rxjs';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class CartComponent {
  itensDoCarrinho$: Observable<CartItem[]>;

  constructor(
    private cartService: CartService,
    private orderService: OrderService, // 2. Injete o OrderService
    private router: Router // 3. Injete o Router para redirecionar
  ) {
    this.itensDoCarrinho$ = this.cartService.items$;
  }
  incrementarQuantidade(item: CartItem) {
    this.cartService.adicionarAoCarrinho(item.produto);
  }

  decrementarQuantidade(item: CartItem) {
    this.cartService.decrementarQuantidade(item);
  }

  removerItem(item: CartItem) {
    this.cartService.removerItem(item);
  }
  
  calcularTotal(itens: CartItem[] | null): number {
    if (!itens) return 0;
    return itens.reduce((total, item) => total + (item.produto.preco * item.quantidade), 0);
  }
   finalizarCompra(itens: CartItem[]) {
    if (itens.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    // Simula a obtenção de dados do cliente.
    // Futuramente, isso viria de um formulário.
    const dadosCliente = {
      nomeCliente: 'Cliente da Loja',
      whatsappCliente: '21912345678'
    };

    this.orderService.criarPedido({ itens, ...dadosCliente }).subscribe({
      next: (pedidoCriado) => {
        alert(`Pedido #${pedidoCriado.id.substring(0, 8)} realizado com sucesso!`);
        this.cartService.limparCarrinho();
        this.router.navigate(['/']); // Redireciona para a home
      },
      error: (err) => {
        console.error('Erro ao finalizar a compra:', err);
        alert('Ocorreu um erro ao finalizar sua compra. Tente novamente.');
      }
    });
  }
}
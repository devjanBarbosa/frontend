import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartItem, CartService } from '../../services/cart';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class CartComponent {
  itensDoCarrinho$: Observable<CartItem[]>;

  constructor(private cartService: CartService) {
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
}
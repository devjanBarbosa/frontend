import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Importe o Router e RouterModule
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

  constructor(
    private cartService: CartService,
    private router: Router // Apenas o Router é necessário aqui
  ) {
    this.itensDoCarrinho$ = this.cartService.items$;
  }

  incrementarQuantidade(item: CartItem): void {
    this.cartService.adicionarAoCarrinho(item.produto);
  }

  decrementarQuantidade(item: CartItem): void {
    this.cartService.decrementarQuantidade(item);
  }

  removerItem(item: CartItem): void {
    this.cartService.removerItem(item);
  }
  
  calcularTotal(itens: CartItem[] | null): number {
    if (!itens) return 0;
    return itens.reduce((total, item) => total + (item.produto.preco * item.quantidade), 0);
  }

  // MÉTODO CORRIGIDO E SIMPLIFICADO
  irParaCheckout(): void {
    // A única responsabilidade deste método é navegar para a página de checkout
    this.router.navigate(['/checkout']);
  }
}
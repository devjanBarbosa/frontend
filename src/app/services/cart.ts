import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Produto } from './product';

// Garanta que a sua interface está assim
export interface CartItem {
  produto: Produto;
  quantidade: number;
  preco: number; // A interface exige este campo
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  adicionarAoCarrinho(produto: Produto): void {
    const itemsAtuais = this.itemsSubject.getValue();
    const itemExistente = itemsAtuais.find(i => i.produto.id === produto.id);

    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      // --- A CORREÇÃO ESTÁ AQUI ---
      // Agora, incluímos o preço do produto ao criar o novo item do carrinho
      itemsAtuais.push({ produto: produto, quantidade: 1, preco: produto.preco });
    }
    this.itemsSubject.next([...itemsAtuais]);
  }

  // Seus outros métodos (decrementar, remover, etc.) continuam iguais...
  decrementarQuantidade(item: CartItem): void { /* ... */ }
  removerItem(item: CartItem): void { /* ... */ }
  limparCarrinho(): void { this.itemsSubject.next([]); }
}
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
 decrementarQuantidade(itemParaDecrementar: CartItem): void {
    let itemsAtuais = this.itemsSubject.getValue();
    const itemExistente = itemsAtuais.find(i => i.produto.id === itemParaDecrementar.produto.id);

    if (itemExistente && itemExistente.quantidade > 1) {
      // Apenas diminui a quantidade se for maior que 1
      itemExistente.quantidade--;
    } else {
      // Se a quantidade for 1, o item é removido do carrinho
      itemsAtuais = itemsAtuais.filter(i => i.produto.id !== itemParaDecrementar.produto.id);
    }
    
    this.itemsSubject.next([...itemsAtuais]);
  }

  // --- COMPLETE TAMBÉM ESTE MÉTODO ---
  removerItem(itemParaRemover: CartItem): void {
    const itemsAtuais = this.itemsSubject.getValue();
    const itemsFiltrados = itemsAtuais.filter(i => i.produto.id !== itemParaRemover.produto.id);
    this.itemsSubject.next(itemsFiltrados);
  }

  limparCarrinho(): void {
    this.itemsSubject.next([]);
  }
}
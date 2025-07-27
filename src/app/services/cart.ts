import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Produto } from './product'; // Garanta que o caminho para ProductService está correto

export interface CartItem {
  produto: Produto;
  quantidade: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor() {}

  adicionarAoCarrinho(produto: Produto) {
    const itemsAtuais = this.itemsSubject.getValue();
    const itemExistente = itemsAtuais.find(item => item.produto.id === produto.id);
    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      itemsAtuais.push({ produto: produto, quantidade: 1 });
    }
    this.itemsSubject.next([...itemsAtuais]);
  }

  // --- MÉTODO PARA DECREMENTAR A QUANTIDADE ---
  decrementarQuantidade(itemParaDiminuir: CartItem) {
    let itemsAtuais = this.itemsSubject.getValue();
    const itemExistente = itemsAtuais.find(item => item.produto.id === itemParaDiminuir.produto.id);

    // Se o item não existe ou a quantidade já é 1, removemos ele da lista
    if (!itemExistente || itemExistente.quantidade <= 1) {
      const novaLista = itemsAtuais.filter(item => item.produto.id !== itemParaDiminuir.produto.id);
      this.itemsSubject.next(novaLista);
    } else {
      // Se a quantidade for > 1, criamos uma nova lista com a quantidade atualizada
      const novaLista = itemsAtuais.map(item => {
        if (item.produto.id === itemParaDiminuir.produto.id) {
          // Retorna uma cópia do item com a quantidade diminuída
          return { ...item, quantidade: item.quantidade - 1 };
        }
        // Para os outros itens, retorna eles como estão
        return item;
      });
      this.itemsSubject.next(novaLista);
    }
  }

  // --- MÉTODO PARA REMOVER O ITEM POR COMPLETO ---
  removerItem(itemParaRemover: CartItem) {
    const itemsAtuais = this.itemsSubject.getValue();
    // Cria uma nova lista que exclui (filtra) o item a ser removido
    const novaLista = itemsAtuais.filter(item => item.produto.id !== itemParaRemover.produto.id);
    this.itemsSubject.next(novaLista);
  }

  // --- MÉTODO EXTRA: LIMPAR O CARRINHO ---
  limparCarrinho() {
    // Simplesmente emite uma lista vazia
    this.itemsSubject.next([]);
  }
}
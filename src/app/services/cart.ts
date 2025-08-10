import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Produto } from './product';

export interface CartItem {
  produto: Produto;
  quantidade: number;
  preco: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // 1. Chave para salvar os dados no localStorage
  private readonly CART_KEY = 'meu_carrinho_compras';

  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor() {
    // 2. Ao iniciar o serviço, tenta carregar o carrinho salvo
    this.carregarCarrinhoDoLocalStorage();
  }

  // --- MÉTODOS PÚBLICOS (com persistência) ---

  adicionarAoCarrinho(produto: Produto): void {
    const itemsAtuais = this.itemsSubject.getValue();
    const itemExistente = itemsAtuais.find(i => i.produto.id === produto.id);

    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      itemsAtuais.push({ produto: produto, quantidade: 1, preco: produto.preco });
    }
    
    this.atualizarEsalvar(itemsAtuais);
  }

  decrementarQuantidade(itemParaDecrementar: CartItem): void {
    let itemsAtuais = this.itemsSubject.getValue();
    const itemExistente = itemsAtuais.find(i => i.produto.id === itemParaDecrementar.produto.id);

    if (itemExistente && itemExistente.quantidade > 1) {
      itemExistente.quantidade--;
    } else {
      // Se a quantidade for 1, removemos o item
      itemsAtuais = itemsAtuais.filter(i => i.produto.id !== itemParaDecrementar.produto.id);
    }
    
    this.atualizarEsalvar(itemsAtuais);
  }

  removerItem(itemParaRemover: CartItem): void {
    let itemsAtuais = this.itemsSubject.getValue();
    const itemsFiltrados = itemsAtuais.filter(i => i.produto.id !== itemParaRemover.produto.id);
    
    this.atualizarEsalvar(itemsFiltrados);
  }

  limparCarrinho(): void {
    this.atualizarEsalvar([]);
  }

  // --- MÉTODOS PRIVADOS PARA GERENCIAR O LOCALSTORAGE ---

  private carregarCarrinhoDoLocalStorage(): void {
    try {
      const carrinhoSalvoJson = localStorage.getItem(this.CART_KEY);
      if (carrinhoSalvoJson) {
        const carrinhoSalvo: CartItem[] = JSON.parse(carrinhoSalvoJson);
        this.itemsSubject.next(carrinhoSalvo);
      }
    } catch (e) {
      console.error('Erro ao carregar o carrinho do localStorage:', e);
      // Se houver erro (ex: dados corrompidos), limpa para evitar problemas
      localStorage.removeItem(this.CART_KEY);
    }
  }

  private salvarCarrinhoNoLocalStorage(items: CartItem[]): void {
    try {
      const carrinhoJson = JSON.stringify(items);
      localStorage.setItem(this.CART_KEY, carrinhoJson);
    } catch (e) {
      console.error('Erro ao salvar o carrinho no localStorage:', e);
    }
  }
  
  // 3. Método centralizado para notificar os componentes e salvar
  private atualizarEsalvar(items: CartItem[]): void {
    // Garante que a lista seja sempre uma nova referência para o Angular detectar a mudança
    const novaLista = [...items]; 
    this.itemsSubject.next(novaLista);
    this.salvarCarrinhoNoLocalStorage(novaLista);
  }
}
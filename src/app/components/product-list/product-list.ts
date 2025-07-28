import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Produto } from '../../services/product';
import { CartService } from '../../services/cart';

// Importa a função para registrar os elementos do Swiper
import { register } from 'swiper/element/bundle';

// Executa o registro uma vez
register();

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Permite o uso de tags customizadas como <swiper-container>
})
export class ProductListComponent implements OnInit {
  produtos: Produto[] = [];
  titulo: string = 'Destaques da Semana';

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    // Agora o componente busca seus próprios produtos
    this.productService.listarProdutos().subscribe(data => {
      this.produtos = data;
    });
  }

  /**
   * TrackBy function para otimizar a performance do *ngFor
   */
  trackByProdutoId(index: number, produto: Produto): string | number {
    return produto.id;
  }

  /**
   * Adiciona produto ao carrinho usando o CartService
   */
  adicionarAoCarrinho(produto: Produto, event: Event): void {
    event.stopPropagation(); // Impede que o clique ative o link de navegação
    this.cartService.adicionarAoCarrinho(produto);
    alert(`${produto.nome} foi adicionado ao carrinho!`);
  }
  
}
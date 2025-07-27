import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // 1. Importe CUSTOM_ELEMENTS_SCHEMA
import { ProductService, Produto } from '../../services/product';
import { CartService } from '../../services/cart';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // 2. Adicione o schemas aqui
})
export class ProductListComponent implements OnInit {
  produtos: Produto[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.productService.listarProdutos().subscribe(dados => {
      this.produtos = dados;
    });
  }

  adicionarAoCarrinho(produto: Produto, event: Event) {
    event.stopPropagation();
    this.cartService.adicionarAoCarrinho(produto);
    alert(`${produto.nome} foi adicionado ao carrinho!`);
  }
}
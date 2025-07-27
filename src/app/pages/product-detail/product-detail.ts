import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Produto } from '../../services/product';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss']
})
export class ProductDetailComponent implements OnInit {

  produto: Produto | undefined;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.buscarProdutoPorId(id).subscribe(dados => {
        this.produto = dados;
      });
    }
  }

  adicionarAoCarrinho() {
    if (this.produto) {
      this.cartService.adicionarAoCarrinho(this.produto);
      alert(`${this.produto.nome} foi adicionado ao carrinho!`);
    }
  }
}
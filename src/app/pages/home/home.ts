import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductListComponent } from '../../components/product-list/product-list';
import { WelcomeComponent } from '../../components/welcome/welcome';
import { ProductService, Produto } from '../../services/product';
import { CategoryService, Categoria } from '../../services/category';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductListComponent, WelcomeComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements OnInit {
  produtosEmDestaque: Produto[] = [];
  categorias: Categoria[] = []; // 1. Crie a variável para as categorias

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService // 2. Injete o CategoryService
  ) {}

  ngOnInit(): void {
    // Busca os produtos em destaque
    this.productService.listarProdutos().subscribe(data => {
      // Pega apenas os 4 primeiros como destaque, por exemplo
      this.produtosEmDestaque = data.slice(0, 4);
    });

    // 3. Busca as categorias do tipo PRODUTO para os cards visuais
    this.categoryService.listarCategorias('PRODUTO').subscribe(data => {
      this.categorias = data;
    });
  }
}
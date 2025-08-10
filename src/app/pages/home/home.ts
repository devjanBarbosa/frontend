import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WelcomeComponent } from '../../components/welcome/welcome';
import { ProductListComponent } from '../../components/product-list/product-list';
import { ProductService, Produto } from '../../services/product';
import { CategoryService, Categoria } from '../../services/category';
import { ReviewsComponent } from '../../components/reviews/reviews'; // 1. IMPORTE O NOVO COMPONENTE

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    WelcomeComponent,
    ProductListComponent,
    ReviewsComponent // 2. ADICIONE-O AOS IMPORTS
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements OnInit {
  
  produtosEmDestaque: Produto[] = [];
  categoriasDeProduto: Categoria[] = [];
  categoriasDePresente: Categoria[] = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    // A sua lógica de carregamento de produtos e categorias continua a mesma
    this.productService.listarProdutos().subscribe(data => {
      // Aumentei para 8 para preencher melhor o carrossel em ecrãs grandes
      this.produtosEmDestaque = data.slice(0, 8); 
    });

    this.categoryService.listarCategorias('PRODUTO').subscribe(data => {
      this.categoriasDeProduto = data;
    });

    this.categoryService.listarCategorias('PRESENTE').subscribe(data => {
      this.categoriasDePresente = data;
    });
  }
}
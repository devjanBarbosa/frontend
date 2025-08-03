import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductListComponent } from '../../components/product-list/product-list';
import { WelcomeComponent } from '../../components/welcome/welcome';
import { ProductService, Produto } from '../../services/product';
import { CategoryService, Categoria } from '../../services/category';
import { FooterComponent } from "../../components/footer/footer";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, WelcomeComponent, ProductListComponent, FooterComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class HomeComponent implements OnInit {
  produtosEmDestaque: Produto[] = [];
  categoriasDeProduto: Categoria[] = []; // Renomeado para clareza
  categoriasDePresente: Categoria[] = []; // 1. Crie uma variável para as categorias de presentes

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    // Busca os produtos em destaque
    this.productService.listarProdutos().subscribe(data => {
      this.produtosEmDestaque = data.slice(0, 4);
    });

    // Busca as categorias do tipo PRODUTO para o carrossel
    this.categoryService.listarCategorias('PRODUTO').subscribe(data => {
      this.categoriasDeProduto = data;
    });

    // 2. Busca as categorias do tipo PRESENTE para a nova secção
    this.categoryService.listarCategorias('PRESENTE').subscribe(data => {
      this.categoriasDePresente = data;
    });
  }
}
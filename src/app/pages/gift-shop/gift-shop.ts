import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductListComponent } from '../../components/product-list/product-list';
import { ProductService, Produto } from '../../services/product';
import { CategoryService, Categoria } from '../../services/category';

@Component({
  selector: 'app-gift-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductListComponent],
  templateUrl: './gift-shop.html',
  styleUrls: ['./gift-shop.scss']
})
export class GiftShopComponent implements OnInit {

  produtos: Produto[] = [];
  categorias: Categoria[] = [];
  categoriaSelecionadaId: string | null = null;
  tituloDaPagina = "Presentes Especiais";

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Busca apenas as categorias do tipo PRESENTE
    this.categoryService.listarCategorias('PRESENTE').subscribe(data => {
      this.categorias = data;
    });

    this.route.queryParamMap.subscribe(params => {
      this.categoriaSelecionadaId = params.get('categoria');
      this.carregarProdutos();
    });
  }

  carregarProdutos(): void {
    // O seu ProductService já sabe como filtrar produtos por categoria
    this.productService.listarProdutos(this.categoriaSelecionadaId ?? undefined).subscribe(data => {
      this.produtos = data;
    });
  }

  filtrarPorCategoria(categoriaId: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: categoriaId }
    });
  }
}
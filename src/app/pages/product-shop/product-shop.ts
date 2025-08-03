import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from '../../components/product-list/product-list';
import { ProductService, Produto } from '../../services/product';
import { CategoryService, Categoria } from '../../services/category';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-shop',
  standalone: true,
  imports: [CommonModule, ProductListComponent],
  templateUrl: './product-shop.html',
  styleUrls: ['./product-shop.scss']
})
export class ProductShopComponent implements OnInit {

  produtos: Produto[] = [];
  categorias: Categoria[] = [];
  categoriaSelecionadaId: string | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

 // ... (dentro da classe ProductShopComponent)

  ngOnInit(): void {
    // --- MUDANÇA IMPORTANTE ---
    // Pede ao serviço apenas as categorias do tipo PRODUTO
    this.categoryService.listarCategorias('PRODUTO').subscribe(data => {
      this.categorias = data;
    });

    // O resto da sua lógica para carregar produtos continua igual...
    this.route.queryParamMap.subscribe(params => {
      this.categoriaSelecionadaId = params.get('categoria');
      this.carregarProdutos();
    });
  }
  carregarProdutos(): void {
    this.productService.listarProdutos(this.categoriaSelecionadaId ?? undefined).subscribe(data => {
      this.produtos = data;
    });
  }

  filtrarPorCategoria(categoriaId: string | null): void {
    // Navega para a mesma página, mas atualiza o parâmetro de consulta da URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: categoriaId },
      queryParamsHandling: 'merge',
    });
  }
}
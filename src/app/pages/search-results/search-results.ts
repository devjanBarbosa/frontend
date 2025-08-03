import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService, Produto } from '../../services/product';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// Importe o seu product-list para reutilizar o visual dos cards!
import { ProductListComponent } from '../../components/product-list/product-list'; 

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductListComponent],
  templateUrl: './search-results.html',
  styleUrls: ['./search-results.scss']
})
export class SearchResultsComponent implements OnInit {

  resultados$: Observable<Produto[]> | undefined;
  termoPesquisado = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

   ngOnInit(): void {
    // Este código "ouve" as mudanças nos parâmetros da URL
    this.resultados$ = this.route.queryParamMap.pipe(
      switchMap(params => {
        // Pega o valor do parâmetro 'q' da URL
        this.termoPesquisado = params.get('q') || '';
        // Chama o serviço para buscar os produtos com base nesse termo
        return this.productService.pesquisarProdutos(this.termoPesquisado);
      })
    );
  }
}
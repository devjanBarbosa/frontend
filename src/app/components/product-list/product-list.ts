import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // 1. Adicione @Input
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Produto } from '../../services/product'; 
import { CartService } from '../../services/cart';
import { ToastrService } from 'ngx-toastr'; 

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductListComponent {
  
  @Input() produtos: Produto[] | null = [];
  @Input() titulo: string | null = 'Destaques da Semana';

  constructor(
    private cartService: CartService,
    private toastr: ToastrService

  ) { }


  adicionarAoCarrinho(produto: Produto, event: Event): void {
    event.stopPropagation();
    this.cartService.adicionarAoCarrinho(produto);
     this.toastr.success(`${produto.nome} foi adicionado ao carrinho!`, 'Sucesso!');// Mantido por enquanto
  }
  
  /**
   * Otimiza a renderização da lista no Angular.
   */
  trackByProdutoId(index: number, produto: Produto): string {
    return produto.id;
  }
}
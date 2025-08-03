import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CartService } from '../../services/cart';
import { CategoryService, Categoria } from '../../services/category';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
    mensagensMarketing: string[] = [
    '📍 Entrega rápida no seu bairro!',
    '🛍️ Retire na loja hoje mesmo',
    '✨ Produtos selecionados por uma especialista',
    '💬 Fale conosco no WhatsApp para dicas!'
  ];
  quantidadeItensCarrinho = 0;
  isMenuOpen = false;
  
  categoriasDeProduto: Categoria[] = [];
  categoriasDePresente: Categoria[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.items$
      .pipe(takeUntil(this.destroy$))
      .subscribe(itens => {
        this.quantidadeItensCarrinho = itens.reduce((total, item) => total + item.quantidade, 0);
      });

    this.categoryService.listarCategorias('PRODUTO')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.categoriasDeProduto = data);

    this.categoryService.listarCategorias('PRESENTE')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.categoriasDePresente = data);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  closeMenu(): void {
    this.isMenuOpen = false;
  }

  pesquisar(termo: string): void {
    if (termo && termo.trim() !== '') {
      this.closeMenu();
      this.router.navigate(['/pesquisa'], { queryParams: { q: termo } });
    }
  }

  hasCartItems(): boolean {
    return this.quantidadeItensCarrinho > 0;
  }
}
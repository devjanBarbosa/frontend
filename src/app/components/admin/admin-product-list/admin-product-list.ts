import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms'; // <-- NOVAS IMPORTAÇÕES
import { Subject } from 'rxjs'; // <-- NOVA IMPORTAÇÃO
import { debounceTime, takeUntil } from 'rxjs/operators'; // <-- NOVAS IMPORTAÇÕES

import { ProductService, Produto } from '../../../services/product';
import { CategoryService, Categoria } from '../../../services/category';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule], // <-- ADICIONE ReactiveFormsModule
  templateUrl: './admin-product-list.html',
  styleUrls: ['./admin-product-list.scss']
})
export class AdminProductListComponent implements OnInit, OnDestroy {
  
  produtos: Produto[] = [];
  categorias: Categoria[] = [];
  filterForm: FormGroup;
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      nome: [''],
      categoriaId: [''],
      ativo: [true] // Por defeito, mostra apenas os produtos ativos
    });
  }

  ngOnInit(): void {
    this.carregarCategorias();
    
    // Ouve as mudanças nos filtros e recarrega os produtos automaticamente
    this.filterForm.valueChanges.pipe(
      debounceTime(300), // Espera 300ms após o utilizador parar de digitar
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.carregarProdutos();
    });

    // Carrega os produtos com os filtros iniciais
    this.carregarProdutos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarCategorias(): void {
    this.categoryService.listarCategorias().subscribe(data => {
      this.categorias = data;
    });
  }

  carregarProdutos(): void {
    this.isLoading = true;
    const filtros = this.filterForm.value;
    this.productService.listarProdutosAdmin(filtros).subscribe({
      next: (data) => {
        this.produtos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos', err);
        this.isLoading = false;
        // Adicione um alerta de erro aqui se desejar
      }
    });
  }

  excluirProduto(id: string): void {
    Swal.fire({
      title: 'Tem a certeza?',
      text: "Esta ação irá inativar o produto, mas não o removerá permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sim, inativar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.excluirProduto(id).subscribe({
          next: () => {
            Swal.fire('Inativado!', 'O produto foi inativado com sucesso.', 'success');
            this.carregarProdutos(); // Recarrega a lista
          },
          error: (err) => {
            Swal.fire('Erro!', 'Ocorreu uma falha ao inativar o produto.', 'error');
            console.error(err);
          }
        });
      }
    });
  }

  limparFiltros(): void {
    this.filterForm.reset({
      nome: '',
      categoriaId: '',
      ativo: true
    });
  }
}
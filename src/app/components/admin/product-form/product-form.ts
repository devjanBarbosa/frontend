import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product';
import { CategoryService, Categoria } from '../../../services/category';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.scss']
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  categorias: Categoria[] = [];
  isLoading = false;
  submitErrorMessage: string | null = null;
  isEditMode = false;
  currentProductId: string | null = null;
  pageTitle = 'Cadastrar Novo Produto';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.checkIfEditMode();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: [''],
      preco: ['', [Validators.required, Validators.min(0.01)]],
      estoque: ['', [Validators.required, Validators.min(0)]],
      urlImagem: [''],
      categoria: [null, Validators.required]
    });
  }

  private loadCategories(): void {
    this.categoryService.listarCategorias().subscribe(data => {
      this.categorias = data;
    });
  }

  private checkIfEditMode(): void {
    this.currentProductId = this.route.snapshot.paramMap.get('id');
    if (this.currentProductId) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Produto';
      this.productService.buscarProdutoPorId(this.currentProductId).subscribe(produto => {
        this.productForm.patchValue({
          nome: produto.nome,
          descricao: produto.descricao,
          preco: produto.preco,
          estoque: produto.estoque,
          urlImagem: produto.urlImagem,
          categoria: produto.categoria.id
        });
      });
    }
  }

  get nome() { return this.productForm.get('nome'); }
  get preco() { return this.productForm.get('preco'); }
  get estoque() { return this.productForm.get('estoque'); }
  get categoria() { return this.productForm.get('categoria'); }

  onSubmit(): void {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) return;

    this.isLoading = true;
    this.submitErrorMessage = null;
    const formValue = this.productForm.value;
    const produtoParaEnviar = { ...formValue, categoria: { id: formValue.categoria } };

    if (this.isEditMode && this.currentProductId) {
      this.productService.atualizarProduto(this.currentProductId, produtoParaEnviar).subscribe({
        next: () => this.handleSuccess('Produto atualizado com sucesso!'),
        error: err => this.handleError(err)
      });
    } else {
      this.productService.criarProduto(produtoParaEnviar).subscribe({
        next: () => this.handleSuccess('Produto cadastrado com sucesso!'),
        error: err => this.handleError(err)
      });
    }
  }

  private handleSuccess(message: string): void {
    this.isLoading = false;
    alert(message);
    this.router.navigate(['/admin/produtos']);
  }

  private handleError(err: any): void {
    this.isLoading = false;
    this.submitErrorMessage = 'Ocorreu um erro. Por favor, tente novamente.';
    console.error('Erro:', err);
  }
}
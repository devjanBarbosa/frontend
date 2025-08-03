import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService, Categoria } from '../../../services/category';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-management.html',
  styleUrls: ['./category-management.scss']
})
export class CategoryManagementComponent implements OnInit {
  
  categorias: Categoria[] = [];
  categoryForm!: FormGroup;
  isEditMode = false;
  currentCategoryId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      nome: ['', Validators.required],
      tipo: ['PRODUTO', Validators.required]
    });
  }

  loadCategories(): void {
    this.categoryService.listarCategorias().subscribe(data => {
      this.categorias = data;
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;
    
    const operation = this.isEditMode
      ? this.categoryService.atualizarCategoria(this.currentCategoryId!, this.categoryForm.value)
      : this.categoryService.criarCategoria(this.categoryForm.value);

    operation.subscribe({
      next: () => {
        this.toastr.success(`Categoria ${this.isEditMode ? 'atualizada' : 'criada'} com sucesso!`);
        this.resetForm();
        this.loadCategories();
      },
      error: () => this.toastr.error('Ocorreu um erro.')
    });
  }

  editCategory(categoria: Categoria): void {
    this.isEditMode = true;
    this.currentCategoryId = categoria.id;
    this.categoryForm.patchValue(categoria);
  }

  deleteCategory(id: string): void {
    if (confirm('Tem a certeza que deseja apagar esta categoria?')) {
      this.categoryService.deletarCategoria(id).subscribe({
        next: () => {
          this.toastr.success('Categoria apagada com sucesso!');
          this.loadCategories();
        },
        error: () => this.toastr.error('Erro ao apagar. Verifique se a categoria não está a ser usada por algum produto.')
      });
    }
  }

  resetForm(): void {
    this.isEditMode = false;
    this.currentCategoryId = null;
    this.categoryForm.reset({ tipo: 'PRODUTO' });
  }
}
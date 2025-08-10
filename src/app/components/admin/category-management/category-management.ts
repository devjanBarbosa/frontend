import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService, Categoria } from '../../../services/category'; // Verifique o caminho
import { ToastrService } from 'ngx-toastr';

// Tipos para ajudar a manter o código seguro e limpo
type TipoCategoria = 'PRODUTO' | 'PRESENTE';
type FiltroCategoria = 'TODOS' | TipoCategoria;

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-management.html', // O seu HTML profissional
  styleUrls: ['./category-management.scss']  // O seu SCSS profissional
})
export class CategoryManagementComponent implements OnInit {

  // --- Estado do Componente ---
  categorias: Categoria[] = [];
  isLoading = true;
  isEditMode = false;
  activeFilter: FiltroCategoria = 'TODOS';
  categoryForm!: FormGroup;

  private currentCategoryId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  // --- Inicialização e Gestão de Dados ---
  private initForm(): void {
    this.categoryForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['PRODUTO' as TipoCategoria, Validators.required]
    });
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.categoryService.listarCategorias().subscribe({
      next: (data) => {
        // Ordena alfabeticamente para uma melhor UX
        this.categorias = data.sort((a, b) => a.nome.localeCompare(b.nome));
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Não foi possível carregar as categorias.', 'Erro de Rede');
        console.error(err);
      }
    });
  }

  // --- Ações do Formulário (Criar/Editar) ---
  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.toastr.warning('Por favor, preencha o nome da categoria.', 'Formulário Inválido');
      return;
    }

    const operation = this.isEditMode
      ? this.categoryService.atualizarCategoria(this.currentCategoryId!, this.categoryForm.value)
      : this.categoryService.criarCategoria(this.categoryForm.value);

    operation.subscribe({
      next: () => {
        const action = this.isEditMode ? 'atualizada' : 'criada';
        this.toastr.success(`Categoria "${this.categoryForm.value.nome}" ${action} com sucesso!`);
        this.resetForm();
        this.loadCategories();
      },
      error: (err) => {
        this.toastr.error('Ocorreu um erro ao salvar a categoria.', 'Erro no Servidor');
        console.error(err);
      }
    });
  }

  // --- Ações da Lista (Editar/Apagar) ---
  editCategory(categoria: Categoria): void {
    this.isEditMode = true;
    this.currentCategoryId = categoria.id;
    this.categoryForm.patchValue(categoria);
    this.toastr.info(`Modo de edição ativado para: ${categoria.nome}`);
  }

  deleteCategory(id: string): void {
    if (confirm('Tem a certeza que deseja apagar esta categoria? A ação não pode ser desfeita.')) {
      this.categoryService.deletarCategoria(id).subscribe({
        next: () => {
          this.toastr.success('Categoria apagada com sucesso!');
          this.loadCategories();
          if (this.currentCategoryId === id) {
            this.resetForm(); // Se a categoria em edição for apagada, limpa o formulário
          }
        },
        error: (err) => {
          this.toastr.error('Falha ao apagar. Verifique se a categoria não está a ser usada por algum produto.', 'Erro');
          console.error(err);
        }
      });
    }
  }

  resetForm(): void {
    this.isEditMode = false;
    this.currentCategoryId = null;
    this.categoryForm.reset({
      nome: '',
      tipo: 'PRODUTO'
    });
  }

  // --- Lógica de Filtragem para o Template ---
  setActiveFilter(filter: FiltroCategoria): void {
    this.activeFilter = filter;
  }

  getFilteredCategorias(): Categoria[] {
    if (this.activeFilter === 'TODOS') {
      return this.categorias;
    }
    return this.categorias.filter(c => c.tipo === this.activeFilter);
  }

  getCategoriasProduto(): Categoria[] {
    return this.categorias.filter(c => c.tipo === 'PRODUTO');
  }

  getCategoriasPresente(): Categoria[] {
    return this.categorias.filter(c => c.tipo === 'PRESENTE');
  }

  // Otimiza a renderização da lista no Angular
  trackByCategoria(index: number, categoria: Categoria): string {
    return categoria.id;
  }
}
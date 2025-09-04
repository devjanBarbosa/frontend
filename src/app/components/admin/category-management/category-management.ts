import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService, Categoria } from '../../../services/category';
import { ProductService } from '../../../services/product';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, startWith } from 'rxjs/operators';

type TipoCategoria = 'PRODUTO' | 'PRESENTE';
type FiltroCategoria = 'TODOS' | TipoCategoria;

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-management.html',
  styleUrls: ['./category-management.scss']
})
export class CategoryManagementComponent implements OnInit {

  // --- Estado do Componente ---
  private todasCategorias: Categoria[] = []; // Guarda a lista completa vinda da API
  filteredCategorias: Categoria[] = [];      // A lista que será mostrada no ecrã

  isLoading = true;
  isEditMode = false;
  activeFilter: FiltroCategoria = 'TODOS';
  categoryForm!: FormGroup;
  searchTerm = new FormControl(''); // FormControl para a barra de pesquisa

  arquivoSelecionado: File | null = null;
  previewImagem: string | ArrayBuffer | null = null;

  private currentCategoryId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();

    // Inicia a escuta por mudanças na barra de pesquisa
    this.searchTerm.valueChanges.pipe(
      debounceTime(300), // Aguarda 300ms após o utilizador parar de digitar
      startWith('')      // Inicia o filtro assim que o componente carrega
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['PRODUTO' as TipoCategoria, Validators.required],
      urlImagem: ['']
    });
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.categoryService.listarCategorias().subscribe({
      next: (data) => {
        this.todasCategorias = data.sort((a, b) => a.nome.localeCompare(b.nome));
        this.applyFilters(); // Aplica os filtros iniciais assim que os dados chegam
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Não foi possível carregar as categorias.', 'Erro de Rede');
        console.error(err);
      }
    });
  }
  
  // --- LÓGICA DE FILTRAGEM CENTRALIZADA ---
  private applyFilters(): void {
    const searchTerm = this.searchTerm.value?.toLowerCase() || '';
    let result = this.todasCategorias;

    // 1. Filtra por TIPO (Produto/Presente/Todos)
    if (this.activeFilter !== 'TODOS') {
      result = result.filter(c => c.tipo === this.activeFilter);
    }

    // 2. Filtra por NOME (termo de pesquisa)
    if (searchTerm) {
      result = result.filter(c => c.nome.toLowerCase().includes(searchTerm));
    }

    this.filteredCategorias = result;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.arquivoSelecionado = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.previewImagem = reader.result);
      reader.readAsDataURL(this.arquivoSelecionado);
    }
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.toastr.warning('Por favor, preencha o nome da categoria.', 'Formulário Inválido');
      return;
    }

    if (this.arquivoSelecionado) {
      const categoryName = this.categoryForm.get('nome')?.value || 'categoria-sem-nome';
      this.productService.uploadImage(this.arquivoSelecionado, categoryName).subscribe({
        next: (response) => {
          this.categoryForm.patchValue({ urlImagem: response.url });
          this.executarSalvar();
        },
        error: (err) => {
          this.toastr.error('Falha ao fazer o upload da imagem.', 'Erro');
          console.error(err);
        }
      });
    } else {
      this.executarSalvar();
    }
  }

  private executarSalvar(): void {
    const dadosFormulario = this.categoryForm.value;
    
    const operation = this.isEditMode
      ? this.categoryService.atualizarCategoria(this.currentCategoryId!, dadosFormulario)
      : this.categoryService.criarCategoria(dadosFormulario);

    operation.subscribe({
      next: () => {
        const action = this.isEditMode ? 'atualizada' : 'criada';
        this.toastr.success(`Categoria "${dadosFormulario.nome}" ${action} com sucesso!`);
        this.resetForm();
        this.loadCategories();
      },
      error: (err) => {
        this.toastr.error('Ocorreu um erro ao salvar a categoria.', 'Erro no Servidor');
        console.error(err);
      }
    });
  }

  editCategory(categoria: Categoria): void {
    this.isEditMode = true;
    this.currentCategoryId = categoria.id;
    this.previewImagem = categoria.urlImagem || null;
    this.arquivoSelecionado = null;
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
            this.resetForm();
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
    this.arquivoSelecionado = null;
    this.previewImagem = null;
    this.categoryForm.reset({
      nome: '',
      tipo: 'PRODUTO',
      urlImagem: ''
    });
  }

  setActiveFilter(filter: FiltroCategoria): void {
    this.activeFilter = filter;
    this.applyFilters(); // Re-aplica os filtros sempre que o tipo muda
  }

  // Métodos para os cartões de estatísticas (usam a lista completa)
  getCategoriasProduto(): Categoria[] {
    return this.todasCategorias.filter(c => c.tipo === 'PRODUTO');
  }

  getCategoriasPresente(): Categoria[] {
    return this.todasCategorias.filter(c => c.tipo === 'PRESENTE');
  }

  trackByCategoria(index: number, categoria: Categoria): string {
    return categoria.id;
  }
}


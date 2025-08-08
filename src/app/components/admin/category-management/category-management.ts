import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { Categoria, CategoryService } from '../../../services/category'; // Certifique-se que o caminho está correto

type TipoCategoria = 'PRODUTO' | 'PRESENTE';
type FiltroCategoria = 'TODOS' | TipoCategoria;

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TitleCasePipe],
  templateUrl: './category-management.html',
  styleUrls: ['./category-management.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerList', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(20px)' }),
          stagger('0.1s', animate('0.3s ease-out', style({ opacity: 1, transform: 'translateX(0)' })))
        ], { optional: true })
      ])
    ])
  ]
})
export class CategoryManagementComponent implements OnInit, OnDestroy {
  @ViewChild('nomeInput') nomeInput!: ElementRef<HTMLInputElement>;
  
  categorias: Categoria[] = [];
  isLoading = true;
  isSubmitting = false;
  activeFilter: FiltroCategoria = 'TODOS';
  
  categoryForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.categoryForm = this.fb.group({
      id: [null], // Campo para a edição
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      tipo: ['PRODUTO', Validators.required]
    });
  }

  ngOnInit(): void {
    this.carregarCategorias();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarCategorias(): void {
    this.isLoading = true;
    this.categoryService.listarCategorias().subscribe({
        next: (data) => {
            this.categorias = data.sort((a, b) => a.nome.localeCompare(b.nome));
            this.isLoading = false;
        },
        error: (err) => {
            console.error('Erro ao carregar categorias:', err);
            this.isLoading = false;
            Swal.fire('Erro!', 'Não foi possível carregar a lista de categorias.', 'error');
        }
    });
  }

  onSubmit(): void {
      if (this.categoryForm.invalid || this.isSubmitting) {
          return;
      }

      this.isSubmitting = true;
      const formData = this.categoryForm.value;

      const action$ = formData.id
          ? this.categoryService.atualizarCategoria(formData.id, formData)
          : this.categoryService.criarCategoria(formData);

      const successMessage = formData.id 
          ? `A categoria "${formData.nome}" foi atualizada com sucesso.`
          : `A categoria "${formData.nome}" foi adicionada com sucesso.`;
      
      action$.subscribe({
          next: () => {
              this.showSuccessMessage('Sucesso!', successMessage);
              this.resetForm();
              this.carregarCategorias();
          },
          error: (err) => {
              this.isSubmitting = false;
              this.showErrorMessage('Erro ao Guardar', 'Ocorreu uma falha. Tente novamente.', 'error');
              console.error(err);
          },
          complete: () => {
              this.isSubmitting = false;
          }
      });
  }

  onEdit(categoria: Categoria): void {
      this.categoryForm.patchValue({
          id: categoria.id,
          nome: categoria.nome,
          tipo: categoria.tipo
      });
      this.focusNameInput();
      // A chamada para a função que faltava
      this.showToastNotification('Modo de Edição', `A editar a categoria "${categoria.nome}".`);
  }

  onDelete(categoria: Categoria): void {
      Swal.fire({
          title: 'Tem a certeza?',
          text: `Deseja realmente apagar a categoria "${categoria.nome}"?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#e74c3c',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Sim, apagar!'
      }).then((result) => {
          if (result.isConfirmed) {
              this.categoryService.deletarCategoria(categoria.id).subscribe({
                  next: () => {
                      this.showSuccessMessage('Apagada!', `A categoria "${categoria.nome}" foi removida.`);
                      this.carregarCategorias();
                  },
                  error: (err) => this.showErrorMessage('Falha ao apagar', 'Verifique se a categoria não está em uso.', 'error')
              });
          }
      });
  }

  resetForm(): void {
      this.categoryForm.reset({
          id: null,
          nome: '',
          tipo: 'PRODUTO'
      });
      this.categoryForm.markAsPristine();
      this.categoryForm.markAsUntouched();
  }

  // --- MÉTODOS DE FILTRO E AUXILIARES ---

  setActiveFilter(filter: FiltroCategoria): void {
    this.activeFilter = filter;
  }

  getFilteredCategorias(): Categoria[] {
    if (this.activeFilter === 'TODOS') return this.categorias;
    return this.categorias.filter(c => c.tipo === this.activeFilter);
  }

  getCategoriasProduto(): Categoria[] {
    return this.categorias.filter(c => c.tipo === 'PRODUTO');
  }

  getCategoriasPresente(): Categoria[] {
    return this.categorias.filter(c => c.tipo === 'PRESENTE');
  }

  trackByCategoria(index: number, categoria: Categoria): string {
    return categoria.id;
  }

  focusNameInput(): void {
    setTimeout(() => {
        this.nomeInput.nativeElement.focus();
        this.cdr.detectChanges();
    }, 0);
  }

  // --- MÉTODOS DE NOTIFICAÇÃO ---

  // <-- ESTA É A FUNÇÃO QUE FALTAVA
  private showToastNotification(title: string, text: string): void {
    Swal.fire({
      title,
      text,
      icon: 'info',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }

  private showSuccessMessage(title: string, text: string): void {
    Swal.fire({
      title,
      text,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });
  }

  private showErrorMessage(title: string, text: string, icon: 'error' | 'warning'): void {
    Swal.fire(title, text, icon);
  }

  get nomeControl() {
    return this.categoryForm.get('nome');
  }

  get tipoControl() {
    return this.categoryForm.get('tipo');
  }
}
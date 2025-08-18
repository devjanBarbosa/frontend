import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService, Produto } from '../../../services/product';
import { CategoryService, Categoria } from '../../../services/category';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImageCropperComponent
  ],
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
  lastSaved: Date | null = null;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedFile: File | null = null;

  isDragging = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.checkIfEditMode();
  }

  // --- MÉTODOS DE INICIALIZAÇÃO ---

  private initForm(): void {
    this.productForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: [''],
      preco: ['', [Validators.required, Validators.min(0.01)]],
      estoque: ['', [Validators.required, Validators.min(0)]],
      urlImagem: [''],
      categoria: [null, Validators.required],
      ativo: [true] // Adicionado o campo 'ativo', com valor padrão 'true'
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
          categoria: produto.categoria.id,
          ativo: produto.ativo
        });
        this.croppedImage = produto.urlImagem;
        // this.lastSaved = produto.dataAtualizacao; // Supondo que o backend envie esta data
      });
    }
  }

  // --- GETTERS PARA VALIDAÇÃO NO TEMPLATE ---

  get nome() { return this.productForm.get('nome'); }
  get preco() { return this.productForm.get('preco'); }
  get estoque() { return this.productForm.get('estoque'); }
  get categoria() { return this.productForm.get('categoria'); }

  // --- MÉTODOS DE UPLOAD DE IMAGEM (DRAG-AND-DROP E CROP) ---

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.onFileSelected({ target: { files: event.dataTransfer.files } });
      event.dataTransfer.clearData();
    }
  }
  
  onFileSelected(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    if (event.blob) {
      this.croppedFile = new File([event.blob], 'cropped_image.jpeg', { type: 'image/jpeg' });
    }
  }

  confirmCrop(): void {
    this.imageChangedEvent = null; // Esconde o cropper e mantém a imagem cortada
  }

  cancelCrop(): void {
    this.imageChangedEvent = null; // Esconde o cropper
    this.croppedImage = this.productForm.get('urlImagem')?.value || ''; // Restaura a imagem original
    this.croppedFile = null;
  }

  removeImage(): void {
    this.croppedImage = '';
    this.croppedFile = null;
    this.productForm.patchValue({ urlImagem: null });
  }

  // --- LÓGICA DE SUBMISSÃO DO FORMULÁRIO ---

  onSubmit(): void {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) {
      this.toastr.error("Por favor, corrija os campos marcados em vermelho.");
      return;
    }
    
    this.isLoading = true;
    this.submitErrorMessage = null;

    if (this.croppedFile) {
      const productName = this.productForm.get('nome')?.value || 'produto-sem-nome';
      this.productService.uploadImage(this.croppedFile, productName).subscribe({
        next: (response) => {
          this.productForm.patchValue({ urlImagem: response.url });
          this.saveProductData();
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.saveProductData();
    }
  }

  private saveProductData(): void {
    const formValue = this.productForm.value;
    // O backend espera um objeto Categoria, não apenas o ID
    const produtoParaEnviar = { ...formValue, categoria: { id: formValue.categoria } };

    const saveOperation = this.isEditMode
      ? this.productService.atualizarProduto(this.currentProductId!, produtoParaEnviar)
      : this.productService.criarProduto(produtoParaEnviar);

    saveOperation.subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError(err)
    });
  }

  private handleSuccess(): void {
    this.isLoading = false;
    this.toastr.success(this.isEditMode ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
    this.router.navigate(['/admin/produtos']);
  }

  private handleError(err: any): void {
    this.isLoading = false;
    this.submitErrorMessage = 'Ocorreu um erro ao salvar. Por favor, tente novamente.';
    this.toastr.error(this.submitErrorMessage);
    console.error('Erro:', err);
  }
}

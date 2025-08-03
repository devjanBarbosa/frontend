import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService, Produto } from '../../../services/product';
import { CategoryService, Categoria } from '../../../services/category';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

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
  // --- Propriedades do Componente ---
  productForm!: FormGroup;
  categorias: Categoria[] = [];
  isLoading = false;
  submitErrorMessage: string | null = null;
  isEditMode = false;
  currentProductId: string | null = null;
  pageTitle = 'Cadastrar Novo Produto';

  // --- Propriedades para o enquadramento de imagem ---
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedFile: File | null = null;

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

  // --- Métodos de Inicialização ---

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
        // Define a imagem existente na pré-visualização
        this.croppedImage = produto.urlImagem;
      });
    }
  }

  // --- Getters para Validação no Template ---

  get nome() { return this.productForm.get('nome'); }
  get preco() { return this.productForm.get('preco'); }
  get estoque() { return this.productForm.get('estoque'); }
  get categoria() { return this.productForm.get('categoria'); }

  // --- Lógica de Enquadramento de Imagem ---

  onFileSelected(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    if (event.blob) {
      this.croppedFile = new File([event.blob], 'cropped_image.jpeg', { type: 'image/jpeg' });
    }
  }

  // --- Lógica de Submissão do Formulário ---

   onSubmit(): void {
    // Adicionamos um log para depuração. Verifique a consola do navegador (F12).
    console.log('Tentativa de submissão do formulário.');
    
    // 1. Marca todos os campos como "tocados"
    // Isto irá forçar a exibição de todas as mensagens de validação no seu HTML.
    this.productForm.markAllAsTouched();

    // 2. Verifica se o formulário continua inválido
    if (this.productForm.invalid) {
      console.log('Formulário inválido. A submissão foi cancelada.');
      this.submitErrorMessage = "Por favor, corrija os campos marcados em vermelho.";
      return; // Agora o utilizador sabe por que a ação parou.
    }
    
    // Se o formulário for válido, o resto da sua lógica é executado...
    console.log('Formulário válido. A processar a encomenda...');
    this.isLoading = true;
    this.submitErrorMessage = null;

    if (this.croppedFile) {
      // Faz o upload da imagem e depois salva os dados...
      this.productService.uploadImage(this.croppedFile).subscribe({
        next: (response) => {
          this.productForm.patchValue({ urlImagem: response.url });
          this.saveProductData();
        },
        error: (err) => this.handleError(err)
      });
    } else {
      // Salva os dados diretamente...
      this.saveProductData();
    }
  }

  private saveProductData(): void {
    const formValue = this.productForm.value;
    const produtoParaEnviar = { ...formValue, categoria: { id: formValue.categoria } };

    const saveOperation = this.isEditMode
      ? this.productService.atualizarProduto(this.currentProductId!, produtoParaEnviar)
      : this.productService.criarProduto(produtoParaEnviar);

    saveOperation.subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError(err)
    });
  }

  // --- Métodos de Feedback ---

  private handleSuccess(): void {
    this.isLoading = false;
    alert(this.isEditMode ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
    this.router.navigate(['/admin/produtos']);
  }

  private handleError(err: any): void {
    this.isLoading = false;
    this.submitErrorMessage = 'Ocorreu um erro ao salvar. Por favor, tente novamente.';
    console.error('Erro:', err);
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService, Produto } from '../../../services/product'; // Importe a interface Produto também
import { CategoryService, Categoria } from '../../../services/category';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  // Propriedades para o upload de imagem
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;

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
      urlImagem: [''], // Este campo será atualizado após o upload
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
        // Preenche o formulário com os dados do produto
        this.productForm.patchValue({
          nome: produto.nome,
          descricao: produto.descricao,
          preco: produto.preco,
          estoque: produto.estoque,
          urlImagem: produto.urlImagem,
          categoria: produto.categoria.id // Corrigido para usar apenas o ID
        });
        // Define a pré-visualização da imagem existente
        this.imagePreviewUrl = produto.urlImagem;
      });
    }
  }

  // --- Getters para Validação no Template ---

  get nome() { return this.productForm.get('nome'); }
  get preco() { return this.productForm.get('preco'); }
  get estoque() { return this.productForm.get('estoque'); }
  get categoria() { return this.productForm.get('categoria'); }

  // --- Lógica de Upload de Imagem ---

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Gera a pré-visualização da nova imagem
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // --- Lógica de Submissão do Formulário ---

  onSubmit(): void {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) {
      this.submitErrorMessage = "Por favor, preencha todos os campos obrigatórios.";
      return;
    }

    this.isLoading = true;
    this.submitErrorMessage = null;

    if (this.selectedFile) {
      // 1. Se uma nova imagem foi selecionada, faz o upload primeiro
      this.productService.uploadImage(this.selectedFile).subscribe({
        next: (response) => {
          // 2. Atualiza o valor de 'urlImagem' no formulário com o URL retornado
          this.productForm.patchValue({ urlImagem: response.url });
          // 3. Procede para salvar os dados do produto
          this.saveProductData();
        },
        error: (err) => this.handleError(err, 'Erro no upload da imagem.')
      });
    } else {
      // Se não há nova imagem, salva os dados diretamente
      this.saveProductData();
    }
  }

  private saveProductData(): void {
    const formValue = this.productForm.value;
    // Monta o objeto final para enviar ao backend
    const produtoParaEnviar = {
      ...formValue,
      categoria: { id: formValue.categoria }
    };

    const saveOperation = this.isEditMode
      ? this.productService.atualizarProduto(this.currentProductId!, produtoParaEnviar)
      : this.productService.criarProduto(produtoParaEnviar);

    saveOperation.subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError(err, 'Erro ao salvar o produto.')
    });
  }

  // --- Métodos de Feedback ---

  private handleSuccess(): void {
    this.isLoading = false;
    const message = this.isEditMode ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!';
    alert(message); // Pode ser trocado por um serviço de notificação (Toast)
    this.router.navigate(['/admin/produtos']);
  }

  private handleError(err: any, customMessage: string): void {
    this.isLoading = false;
    this.submitErrorMessage = `${customMessage} Por favor, tente novamente.`;
    console.error('Erro:', err);
  }
}
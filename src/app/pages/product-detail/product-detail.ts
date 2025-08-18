import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // 1. Importar o Router
import { ProductService, Produto } from '../../services/product';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss']
})
export class ProductDetailComponent implements OnInit {

  produto$: Observable<Produto> | undefined;
  produto: Produto | undefined; // Mantido para uso síncrono

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService,
    private router: Router // 2. Injetar o Router no construtor
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.produto$ = this.productService.buscarProdutoPorId(id);
      this.produto$.subscribe(dados => this.produto = dados);
    }
  }

  adicionarAoCarrinho(): void {
    if (this.produto) {
      this.cartService.adicionarAoCarrinho(this.produto);
      this.toastr.success(`${this.produto.nome} foi adicionado ao carrinho!`, 'Sucesso!');
    }
  }

  /**
   * 3. NOVO MÉTODO: Adiciona o produto ao carrinho e redireciona para o checkout.
   * Esta função oferece um atalho para o cliente decidido, melhorando a conversão.
   */
  comprarAgora(): void {
    if (this.produto) {
      // Primeiro, adiciona o item ao serviço do carrinho
      this.cartService.adicionarAoCarrinho(this.produto);
      
      // Em seguida, navega para a página de finalização da compra
      this.router.navigate(['/carrinho']);
    }
  }

  getWhatsappLink(): string {
    if (!this.produto) return '';
    const mensagem = `Olá, Leda! Tenho uma dúvida sobre o produto: ${this.produto.nome}.`;
    const numero = '5521997883761'; // SEU NÚMERO DE WHATSAPP AQUI
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  }

  notificarDisponibilidade(): void {
    if (this.produto) {
      this.toastr.info(`Você será notificado(a) quando o produto "${this.produto.nome}" estiver disponível novamente!`, 'Aviso Registrado!');
      console.log(`Usuário solicitou notificação para o produto ID: ${this.produto.id}`);
    }
  }
}

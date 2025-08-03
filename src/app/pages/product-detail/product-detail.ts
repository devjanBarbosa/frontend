import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Produto } from '../../services/product';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { ToastrService } from 'ngx-toastr'; // 1. Importe o Toastr
import { Observable } from 'rxjs'; // 2. Importe o Observable

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss']
})
export class ProductDetailComponent implements OnInit {

  produto$: Observable<Produto> | undefined; // 3. Use um Observable
  produto: Produto | undefined; // Mantemos este para o WhatsApp

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService // 4. Injete o Toastr
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.produto$ = this.productService.buscarProdutoPorId(id);
      // Guardamos os dados também numa variável normal para uso síncrono
      this.produto$.subscribe(dados => this.produto = dados);
    }
  }

  adicionarAoCarrinho(): void {
    if (this.produto) {
      this.cartService.adicionarAoCarrinho(this.produto);
      // 5. Use o Toastr em vez do alert()
      this.toastr.success(`${this.produto.nome} foi adicionado ao carrinho!`, 'Sucesso!');
    }
  }

  // 6. Novo método para criar o link do WhatsApp
  getWhatsappLink(): string {
    if (!this.produto) return '';
    const mensagem = `Olá, Leda! Tenho uma dúvida sobre o produto: ${this.produto.nome}.`;
    const numero = '5521997883761'; // SEU NÚMERO DE WHATSAPP AQUI
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  }
}
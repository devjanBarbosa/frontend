import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Produto } from '../../../services/product';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-product-list.html',
  styleUrls: ['./admin-product-list.scss']
})
export class AdminProductListComponent implements OnInit {
  
  produtos: Produto[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.productService.listarProdutos().subscribe(data => {
      this.produtos = data;
    });
  }

excluirProduto(id: string): void {
  // Adiciona uma confirmação para evitar exclusões acidentais
  if (confirm('Tem certeza que deseja excluir este produto? A ação não pode ser desfeita.')) {
    this.productService.excluirProduto(id).subscribe({
      next: () => {
        alert('Produto excluído com sucesso!');
        // Recarrega a lista de produtos para remover o item da tela
        this.carregarProdutos(); 
      },
      error: (err) => {
        alert('Ocorreu um erro ao excluir o produto.');
        console.error(err);
      }
    });
  }
}
}
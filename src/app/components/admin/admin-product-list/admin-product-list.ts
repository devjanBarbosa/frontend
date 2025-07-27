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
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      // A lógica para chamar o serviço de exclusão virá aqui
      console.log('Excluir produto com ID:', id);
    }
  }
}
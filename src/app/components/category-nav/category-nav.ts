import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService, Categoria } from '../../services/category';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-category-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-nav.html',
  styleUrls: ['./category-nav.scss']
})
export class CategoryNavComponent implements OnInit {

  categorias: Categoria[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.listarCategorias().subscribe(dados => {
      this.categorias = dados;
    });
  }
}
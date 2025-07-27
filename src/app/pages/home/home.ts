import { Component } from '@angular/core';
import { WelcomeComponent } from '../../components/welcome/welcome';
import { CategoryNavComponent } from '../../components/category-nav/category-nav';
import { ProductListComponent } from '../../components/product-list/product-list';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    WelcomeComponent,
    CategoryNavComponent,
    ProductListComponent
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {

}
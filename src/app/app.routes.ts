import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ProductDetailComponent } from './pages/product-detail/product-detail'; 
import { CartComponent } from './pages/cart/cart';
import { LoginComponent } from './pages/login/login';
import { AdminComponent } from './pages/admin/admin';
import { ProductFormComponent } from './components/admin/product-form/product-form';
import { OrderListComponent } from './components/order-list/order-list';
import { AdminProductListComponent } from './components/admin/admin-product-list/admin-product-list';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'produtos/:id', component: ProductDetailComponent }, 
    { path: 'carrinho', component: CartComponent },
    { path: 'login', component: LoginComponent },
    { 
      path: 'admin', 
      component: AdminComponent,
      children: [
        { path: '', component: OrderListComponent },
        { path: 'produtos', component: AdminProductListComponent },
        { path: 'produtos/novo', component: ProductFormComponent },
        { path: 'produtos/editar/:id', component: ProductFormComponent } 
      ]
    }
];
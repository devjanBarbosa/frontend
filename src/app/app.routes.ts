import { Routes } from '@angular/router';
// Corrigindo todos os caminhos de importação
import { HomeComponent } from './pages/home/home';
import { ProductDetailComponent } from './pages/product-detail/product-detail'; 
import { CartComponent } from './pages/cart/cart';
import { LoginComponent } from './pages/login/login';
import { AdminComponent } from './pages/admin/admin';
import { ProductFormComponent } from './components/admin/product-form/product-form';
import { OrderListComponent } from './components/order-list/order-list';
import { AdminProductListComponent } from './components/admin/admin-product-list/admin-product-list';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'produtos/:id', component: ProductDetailComponent }, 
    { path: 'carrinho', component: CartComponent },
    { path: 'login', component: LoginComponent },
    // Removendo a duplicata e mantendo apenas a rota com as filhas e o guarda
    { 
      path: 'admin', 
      component: AdminComponent,
      canActivate: [authGuard],
      children: [
        { path: '', component: OrderListComponent },
        { path: 'produtos', component: AdminProductListComponent },
        { path: 'produtos/novo', component: ProductFormComponent },
        { path: 'produtos/editar/:id', component: ProductFormComponent } 
      ]
    }
];
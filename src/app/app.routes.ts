import { Routes } from '@angular/router';
// Importações
import { HomeComponent } from './pages/home/home';
import { ProductDetailComponent } from './pages/product-detail/product-detail';
import { LoginComponent } from './pages/login/login';
import { AdminComponent } from './pages/admin/admin';
import { ProductFormComponent } from './components/admin/product-form/product-form';
import { CheckoutComponent } from './pages/checkout/checkout';
import { OrderListComponent } from './components/order-list/order-list';
import { AdminProductListComponent } from './components/admin/admin-product-list/admin-product-list';
import { authGuard } from './guards/auth-guard';
import { OrderDetailComponent } from './components/admin/order-detail/order-detail';
import { SearchResultsComponent } from './pages/search-results/search-results';
import { ProductShopComponent } from './pages/product-shop/product-shop';
import { AboutComponent } from './pages/about/about';
import { CategoryManagementComponent } from './components/admin/category-management/category-management';
import { GiftShopComponent } from './pages/gift-shop/gift-shop';

export const routes: Routes = [
  // --- ROTAS PÚBLICAS (Acessíveis a todos os visitantes) ---
  { path: '', component: HomeComponent },
  { path: 'produtos', component: ProductShopComponent },
  { path: 'produtos/:id', component: ProductDetailComponent },
  { path: 'presentes', component: GiftShopComponent },
  { path: 'sobre-nos', component: AboutComponent },
  { path: 'pesquisa', component: SearchResultsComponent },
  { path: 'carrinho', component: CheckoutComponent },
  { path: 'login', component: LoginComponent },

  // --- ROTA PROTEGIDA DE ADMINISTRAÇÃO (Só acessível após login) ---
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard], // O "porteiro" que protege todas as rotas filhas
    children: [
      // Redireciona a rota '/admin' para '/admin/pedidos' por defeito
      { path: '', redirectTo: 'pedidos', pathMatch: 'full' },

      // Rotas de Encomendas
      { path: 'pedidos', component: OrderListComponent },
      { path: 'pedidos/:id', component: OrderDetailComponent },

      // Rotas de Produtos
      { path: 'produtos', component: AdminProductListComponent },
      { path: 'produtos/novo', component: ProductFormComponent },
      { path: 'produtos/editar/:id', component: ProductFormComponent },

      // Rota de Categorias
      { path: 'categorias', component: CategoryManagementComponent }
    ]
  },

  // Rota "catch-all" para redirecionar URLs inválidas para a home
  { path: '**', redirectTo: '' }
];
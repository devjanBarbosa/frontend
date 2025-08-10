import { Routes } from '@angular/router';
// Importações existentes
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

// --- NOVA IMPORTAÇÃO ---
import { DashboardComponent } from './components/admin/dashboard/dashboard'; // 1. Importe o novo componente
import { OrderSuccessComponent } from './pages/order-success/order-success';
import { TermsComponent } from './pages/terms/terms';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy';

export const routes: Routes = [
  // --- ROTAS PÚBLICAS ---
  { path: '', component: HomeComponent },
  { path: 'produtos', component: ProductShopComponent },
  { path: 'produtos/:id', component: ProductDetailComponent },
  { path: 'presentes', component: GiftShopComponent },
  { path: 'sobre-nos', component: AboutComponent },
  { path: 'pesquisa', component: SearchResultsComponent },
  { path: 'carrinho', component: CheckoutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'pedido-sucesso/:id', component: OrderSuccessComponent },

  // ... (sua rota de pedido-sucesso já deve estar aqui)
   { path: 'termos', component: TermsComponent }, // 2. Adicione as rotas
  { path: 'privacidade', component: PrivacyPolicyComponent },

  // --- ROTA PROTEGIDA DE ADMINISTRAÇÃO ---
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
    children: [
      // --- ALTERAÇÃO AQUI ---
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // 2. Dashboard é agora a página padrão

      // --- NOVA ROTA ADICIONADA ---
      { path: 'dashboard', component: DashboardComponent }, // 3. Rota para o dashboard
      { path: 'pedidos', component: OrderListComponent },
      { path: 'pedidos/:id', component: OrderDetailComponent },
      { path: 'produtos', component: AdminProductListComponent },
      { path: 'produtos/novo', component: ProductFormComponent },
      { path: 'produtos/editar/:id', component: ProductFormComponent },
      { path: 'categorias', component: CategoryManagementComponent },
    ]
  },

  { path: '**', redirectTo: '' }
];
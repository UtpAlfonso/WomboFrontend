import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.gurad';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { UserManagementComponent } from './pages/admin/user-management/user-management.component';
import { InventoryManagementComponent } from './pages/admin/inventory-management/inventory-management.component';
import { OrderManagementComponent } from './pages/admin/order-management/order-management.component';
import { ReportsComponent } from './pages/admin/reports/reports.component';
import { WorkerOrderManagementComponent } from './pages/worker/worker-order-management/worker-order-management.component';
import { CheckoutSummaryComponent } from './pages/client/checkout-summary/checkout-summary.component';
import { PaymentSuccessComponent } from './pages/client/payment-success/payment-success.component';
import { PaymentFailureComponent } from './pages/client/payment-failure/payment-failure.component';
import { ProductDetailComponent } from './pages/client/product-detail/product-detail.component';
import { PosTerminalComponent } from './pages/worker/pos-terminal/pos-terminal.component';
import { ReturnsManagementComponent } from './pages/worker/returns-management/returns-management.component';
import { UserProfileComponent } from './pages/client/user-profile/user-profile.component';
import { OrderHistoryComponent } from './pages/client/order-history/order-history.component';
import { ShoppingCartComponent } from './pages/client/shopping-cart/shopping-cart.component';
import { PasswordRecoveryComponent } from './pages/auth/password-recovery/password-recovery.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';

export const routes: Routes = [

  // =================================================================
  // RUTAS DE AUTENTICACIÓN (Se muestran en una página limpia)
  // =================================================================
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    // --- ¡ESTA ES LA RUTA QUE FALTABA! ---
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(c => c.RegisterComponent)
  },
  {
    // --- Y TAMBIÉN AÑADIMOS LA DE RECUPERACIÓN ---
    path: 'password-recovery',
    loadComponent: () => import('./pages/auth/password-recovery/password-recovery.component').then(c => c.PasswordRecoveryComponent)
  },
    { path: 'reset-password', component: ResetPasswordComponent },


  // =================================================================
  // RUTAS PÚBLICAS / CLIENTE (Usan el PublicLayout con Header/Footer)
  // =================================================================
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./pages/client/home-page/home-page.component').then(c => c.HomePageComponent) },
      { path: 'products', loadComponent: () => import('./pages/client/product-catalog/product-catalog.component').then(c => c.ProductCatalogComponent) },
      // ... aquí irían las otras rutas públicas como /cart, /my-orders, etc.
      { path: 'product/:id', component: ProductDetailComponent },
      { path: 'profile', component: UserProfileComponent, canActivate: [authGuard] }, // www.tusitio.com/profile
      { path: 'my-orders', component: OrderHistoryComponent, canActivate: [authGuard] }, // www.tusitio.com/my-orders
      { path: 'cart', component: ShoppingCartComponent, canActivate: [authGuard] }, // www.tusitio.com/cart
      { path: 'checkout-summary', component: CheckoutSummaryComponent, canActivate: [authGuard] },
      { path: 'payment-success', component: PaymentSuccessComponent, canActivate: [authGuard] },
      { path: 'payment-failure', component: PaymentFailureComponent, canActivate: [authGuard] }
    ]
  },

  // =================================================================
  // RUTAS PROTEGIDAS DE ADMINISTRADOR (Usan el AdminLayout con Sidebar)
  // =================================================================
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [roleGuard],
    data: { expectedRoles: ['ROLE_ADMIN'] },
    children: [
      { path: '', loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'users', component: UserManagementComponent },
      { path: 'inventory', component: InventoryManagementComponent },
      { path: 'orders', component: OrderManagementComponent },
      { path: 'reports', component: ReportsComponent },
      // ... aquí irían las otras rutas de admin
    ]
  },

  // (Aquí irían las rutas de WORKER)
{
    path: 'worker',
    component: AdminLayoutComponent, // Reutilizamos el layout con el Sidebar
    canActivate: [roleGuard],
    // PERMITE EL ACCESO A ADMIN Y A WORKER
    data: { expectedRoles: ['ROLE_ADMIN', 'ROLE_WORKER'] },
    children: [
      // La ruta vacía dentro de /worker redirige a la gestión de pedidos
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
      { path: 'orders', component: WorkerOrderManagementComponent },
      { path: 'pos', component: PosTerminalComponent },
      { path: 'returns', component: ReturnsManagementComponent },
    ]
  },
  // =================================================================
  // RUTA WILDCARD (Atrapa todo lo demás y redirige a la home)
  // =================================================================
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
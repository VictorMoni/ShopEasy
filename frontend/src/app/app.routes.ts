import { HomeComponent } from './features/home/home.component';
import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AuthGuard } from './core/guards/auth.guard';
import { OrderCreateComponent } from './features/orders/create/order-create.component';
import { OrderListComponent } from './features/orders/list/order-list.component';
import { ProductListComponent } from './features/products/list/product-list.component';
import { OrderDetailComponent } from './features/orders/detail/order-detail.component';
import { ProductDetailComponent } from './features/products/detail/product-detail.component';
import { ProductCreateComponent } from './features/products/create/product-create.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'products',
    component: ProductListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'products/create',
    component: ProductCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'products/:id',
    component: ProductDetailComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'orders',
    component: OrderListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'orders/create',
    component: OrderCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'orders/:id',
    component: OrderDetailComponent,
    canActivate: [AuthGuard],
  },
];

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SellerLayoutComponent } from './seller-layout/seller-layout.component';

import { LoginComponent } from './login/login.component';
import { OrderComponent } from './seller-layout/order/order.component';
import { ListComponent } from './seller-layout/list/list.component';
import { PaymentComponent } from './seller-layout/payment/payment.component';
import { StorageComponent } from './seller-layout/storage/storage.component';
import { SettingsComponent } from './seller-layout/settings/settings.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'seller', component: SellerLayoutComponent,
    children:
    [
      { path: '', redirectTo: 'order', pathMatch: 'full' }, // дочерний роут
      { path: 'order', component: OrderComponent }, // дочерний роут
      { path: 'list', component: ListComponent }, // дочерний роут
      { path: 'payment', component: PaymentComponent },
      { path: 'storage', component: StorageComponent }, // дочерний роут // дочерний роут
      { path: 'settings', component: SettingsComponent } // дочерний роут // дочерний роут
    ]
  },

  { path: '**', redirectTo: '/login', pathMatch: 'full' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

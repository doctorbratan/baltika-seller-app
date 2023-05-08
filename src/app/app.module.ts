import { NgModule, LOCALE_ID } from '@angular/core';


import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
registerLocaleData(localeRu);


import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import {TokenInterceptor} from './classes/token.interceptor';

// Pipe
import { PositionFilterPipe } from "./pipes/position-filter.pipe";
import { OrderFilterPipe } from "./pipes/order-filter.pipe";


// Диалоговые окна
import { RemoveItemComponent } from './dialogs/remove-item/remove-item.component';

// Marerial
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SellerLayoutComponent } from './seller-layout/seller-layout.component';
import { OrderComponent } from './seller-layout/order/order.component';
import { ListComponent } from './seller-layout/list/list.component';
import { PaymentComponent } from './seller-layout/payment/payment.component';
import { StorageComponent } from './seller-layout/storage/storage.component';
import { IonicModule } from '@ionic/angular';
import { SettingsComponent } from './seller-layout/settings/settings.component';


@NgModule({
  declarations: [
    AppComponent,

    RemoveItemComponent,

    OrderFilterPipe,
    PositionFilterPipe,
    LoginComponent,
    SellerLayoutComponent,
    OrderComponent,
    ListComponent,
    PaymentComponent,
    StorageComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,

    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    IonicModule.forRoot()
  ],
  providers: [
    DatePipe,
    { 
      provide: LOCALE_ID, 
      useValue: 'ru' 
    },
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: TokenInterceptor
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

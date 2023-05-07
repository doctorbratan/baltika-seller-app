import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderService } from 'src/app/services/order.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  loading: boolean = false

  customers: any[] | undefined
  customer: string | undefined

  my: boolean = false
  seller: string | undefined

  orders: any[] | undefined

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private customerService: CustomerService,
    private snackbar: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.checkSettings();
    this.getCustomers();
    this.getOrders();
  }

  checkSettings() {
    const candidate = localStorage.getItem("list-page")
    if (candidate) {
      const data = JSON.parse(candidate)
      this.customer = data.customer
      this.seller = data.seller
      this.my = data.my
    }
  }

  settingChange() {
    const data = {
      customer: this.customer,
      seller: this.seller,
      my: this.my
    }

    localStorage.setItem("list-page", JSON.stringify(data))
  }

  getCustomers() {
    this.customerService.get().subscribe(
      data => {

        this.customers = data.map( (customer: any) => {
          return { 
            _id: customer._id,
            name: customer.name,
            type: customer.type
          }
        })
      }, 
      error => {
        console.warn(error)
      }
    )
  }

  myChange($event: any) {
    if ($event.checked) {
      this.seller = this.authService.user._id
    } else {
      this.seller = undefined
    }
  }

  getOrders() {
    this.loading = true

    this.orderService.get().subscribe(
      data => {
        this.orders = data
        this.loading = false
      },
      error => {
        console.warn(error)
        this.snackbar.open("Ошибка получения заказов!")
        this.loading = false
      }
    )
  }

}


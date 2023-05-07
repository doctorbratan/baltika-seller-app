import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { RemoveItemComponent } from "../../dialogs/remove-item/remove-item.component";

import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderService } from 'src/app/services/order.service';
import { PositionService } from 'src/app/services/position.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { WriteOffService } from 'src/app/services/write-off.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})

export class OrderComponent implements OnInit, OnDestroy {

  pennding: boolean = false

  categories: any[] | undefined
  positions: any[] | undefined

  category: string | undefined
  cost: number | undefined
  filterText: string | undefined

  customers: any[] | undefined
  order_for: any[] | undefined



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,

    public authService: AuthService,
    private snackbar: SnackbarService,
    private categoryService: CategoryService,
    private positionService: PositionService,
    private customerService: CustomerService,
    private writeOffService: WriteOffService,

    public orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.getCategories();
    this.getPositions();
    this.getCustomers();
    this.checkQueryParams();
  }

  checkQueryParams() {
    this.route.queryParamMap.subscribe(params => {

      const candidate = params.get('_id');
      if (candidate) {
        this.findOne(candidate)
      } else {
        this.getUserInfo();
      }
    });
  }

  findOne(_id: string) {
    this.pennding = true

    this.orderService.findOne(_id).subscribe(
      data => {
        if (data) {
          this.orderService.unZipOrder(data)
          this.pennding = false
        } else {
          this.router.navigate(['/seller/order']);
          this.getUserInfo();
          this.pennding = false
        }

      },
      error => {
        this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
        this.router.navigate(['/seller/order']);

      }
    )
  }

  ngOnDestroy(): void {
    this.orderService.clear();
  }

  print() {
    this.pennding = true
    let response = true

    for (let position of this.orderService.list) {
      if (!position.processed) {
        response = false
      }
    }

    if (response) {
      const data = {
        list: this.orderService.list,
        update: this.orderService.update,
        updates: this.orderService.updates,
        status: this.orderService.status,
        isPrinted: true
      }
      
      this.orderService.patch(data, this.orderService._id!).subscribe(
        data => {
          this.orderService.unZipOrder(data.order)
          this.pennding = false
        },
        error => {
          console.warn(error)
          this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
          this.pennding = false
        }
      )
    } else {
      this.pennding = false
      this.snackbar.open("Для начала сохрните чек!")
    }
  }


  removeFromOrder(i: number): void {
    this.pennding = true
    const position = this.orderService.list[i]

    if (position.processed) {

      const dialogRef = this.dialog.open(RemoveItemComponent, {
        data: undefined,
      });
  
      dialogRef.afterClosed().subscribe(result => {

        if (result) {

          const data = {
            cause: result,
            index: i,
            update: this.orderService.update,
            position: position
          }

          this.writeOffService.patch(data, this.orderService._id!).subscribe(
            data => {
              this.snackbar.open(data.message)
              this.orderService.unZipOrder(data.order)
              this.pennding = false
            }, 
            error => {
              console.warn(error)
              this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
              this.clear();
            }
          )

        }  else {
          this.pennding = false
        }

      });

    } else {
      this.orderService.deleteFromList(i)
      this.pennding = false
    }

  }

  addToOrder(position: any) {
    this.pennding = true

    this.orderService.addToList(position)

    setTimeout(() => {
      this.pennding = false
    }, 200);
  }

  clear() {
    this.orderService.clear();
    this.router.navigate(['/seller/order']);
    this.getUserInfo();
  }


  post() {

    this.pennding = true

    const data = this.orderService.zipOrder();
    const response = this.orderService.checkOrder(data)

    if (!response.status) {
      this.pennding = false
      this.snackbar.open(response.message)
    } else {
      this.orderService.post(data).subscribe(
        data => {
          this.snackbar.open(data.message)
          this.clear();
          this.pennding = false
        },
        error => {
          console.warn(error)
          this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
          this.clear();
          this.pennding = false
        }
      )
    }

  }

  patch() {

    this.pennding = true

    const data = this.orderService.zipOrder();
    const response = this.orderService.checkOrder(data)

    if (!response.status) {
      this.pennding = false
      this.snackbar.open(response.message)
    } else {
      this.orderService.patch(data, this.orderService._id!).subscribe(
        data => {
          this.snackbar.open(data.message)
          this.clear();
          this.pennding = false
        },
        error => {
          console.warn(error)
          this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
          this.clear();
          this.pennding = false
        }
      )
    }

  }

  delete() {
    this.pennding = true

    this.orderService.delete(this.orderService._id!).subscribe(
      data => {
        this.snackbar.open(data)
        this.clear();
        this.pennding = false
      },
      error => {
        console.warn(error)
        this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
        this.pennding = false
      }
    )
  }

  getUserInfo() {
    if (!this.orderService.seller && this.authService.user) {
      const data = {
        _id: this.authService.user._id,
        name: this.authService.user.name,
        check_name: this.authService.user.check_name,
      }
      this.orderService.seller = data
    }
  }

  onCustomerSelect(event: any) {
    const data = {
      _id: event.value._id,
      name: event.value.name,
      type: event.value.type
    }

    this.orderService.order_for = undefined
    this.orderService.customer = data

    this.orderService.computePrice();
  }

  onOrderForChange(event: any) {
    const data = {
      _id: event.value._id,
      name: event.value.name
    }

    this.orderService.order_for = data
  }

  getCategories() {
    this.categoryService.get().subscribe(
      data => {
        this.categories = data
      },
      error => {
        console.warn(error)
        this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
      }
    )
  }

  getPositions() {
    const query = { visible: true }

    this.positionService.get(query, null, null).subscribe(
      data => {
        this.positions = data
      },
      error => {
        console.warn(error)
        this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
      }
    )
  }

  getCustomers() {

    const customers = [] as any[]
    const order_for = [] as any[]

    this.customerService.get().subscribe(
      data => {

        data.forEach((customer: any) => {

          const customer_data = {
            _id: customer._id,
            name: customer.name,
            type: customer.type
          }

          customers.push(customer_data)

          customer.list.forEach((element: any) => {

            if (element.display) {

              const element_data = {
                customer_id: customer._id,
                _id: element._id,
                name: element.name
              }

              order_for.push(element_data)
            }

          });

        });

        this.customers = customers
        this.order_for = order_for

      },
      error => {
        console.warn(error)
        this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
      }
    )
  }

  clearSearch() {
    this.category = undefined
    this.cost = undefined
    this.filterText = undefined
  }

}


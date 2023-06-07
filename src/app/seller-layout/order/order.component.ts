import { Component, OnDestroy, OnInit, HostListener} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { RemoveItemComponent } from "../../dialogs/remove-item/remove-item.component";
import { CommentItemComponent } from "../../dialogs/comment-item/comment-item.component";

import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderService } from 'src/app/services/order.service';
import { PositionService } from 'src/app/services/position.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { WriteOffService } from 'src/app/services/write-off.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})

export class OrderComponent implements OnInit, OnDestroy {
  insert: boolean = false
  barcode: string | undefined
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {

    // console.log(event.key)

    if (event.key === "Enter") {
      this.insert = !this.insert
    }

    if ( this.insert && event.key !== "Enter" ) {
      this.barcode = (this.barcode || '') + event.key;
    }

    if (!this.insert && this.barcode) {
      this.findByBarcode(this.barcode)
      // console.log('Barcode:', this.barcode);
      this.barcode = undefined
    }

  }

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
    private settingsService: SettingsService,

    public orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.getCategories();
    this.getPositions();
    this.getCustomers();
    this.checkQueryParams();
  }

  findByBarcode(barcode: string) {
    this.pennding = true

    this.positionService.findOne({barcode, visible: true, stop: false}).subscribe(
      data => {
        if (data) {
          data.quantity = 1
          this.addToOrder(data);
        } else {
          this.snackbar.open("Не найденно");
          this.pennding = false
        }
      },
      error => {
        console.warn(error)
        this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
        this.pennding = false
      }
    )
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

  // Блок печати

  print() {
    this.pennding = true
    let response = true

    for (let position of this.orderService.list) {
      if (!position.processed) {
        response = false
      }
    }

    if (response) {
      this.checkPrintServer();
    } else {
      this.pennding = false
      this.snackbar.open("Для начала сохрните чек!")
    }
  }

  checkPrintServer() {

    this.settingsService.checkServer().subscribe(
      data => {
        this.checkPrinterForCheck();
      },
      error => {
        this.pennding = false
        this.snackbar.open("Нет доступа к серверу печати!")
      }
    )

  }

  checkPrinterForCheck() {
    if (this.settingsService.printers && this.settingsService.printers.check) {

      this.settingsService.checkPrinter(this.settingsService.printers.check.name).subscribe(
        data => {
          this.printCheck();
        },
        error => {
          this.pennding = false
          this.snackbar.open("Принтер для печати чеков не в сети!")
        }
      )

    } else {
      this.pennding = false
      this.snackbar.open("Не выставлен принтер для печати чеков!")
    }
  }

  printCheck() {

    const data = {
      order: this.orderService.zipOrder(),
      printer: this.settingsService.printers.check
    }

    this.settingsService.order(data).subscribe(
      data => {
        this.savePrintedOrder();
      },
      error => {
        this.snackbar.open("Ошибка печати чека!");
        this.pennding = false

      }
    )

  }

  savePrintedOrder() {

    let data = this.orderService.zipOrder();
    data.isPrinted = true

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
  }

  // Блок печати

  addComment(i: number): void {
    const position = this.orderService.list[i]

    if (!position.processed) {

      const dialogRef = this.dialog.open(CommentItemComponent, {
        data: position.comment ? position.comment : undefined,
      });


      dialogRef.afterClosed().subscribe(result => {
        console.log(result)
        position.comment = result
      });


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
              this.deletePositionSend(position)
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

        } else {
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
      this.checkTasks(data)
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
      this.checkTasks(data)
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

  checkTasks(data: any) {
    const kitchenTasks = []
    const barTasks = []

    for (let position of data.list) {
      if (!position.processed && position.task) {
        if (position.task === 'bar') {
          barTasks.push(position)
        }
        if (position.task === 'kitchen') {
          kitchenTasks.push(position)
        }
      }
    }

    if (kitchenTasks.length > 0) {
      this.kitchenTasks(kitchenTasks, data)
    }

    if (barTasks.length > 0) {
      this.barTasks(barTasks, data)
    }

  }

  deletePositionSend(position: any) {

    let text = "!!Отмена!!: \n\n"
    let positionText;
    if (position.comment) {
      positionText = `[ ${position.category.name} ] ${position.name} - ${position.quantity} шт. \nКомментарий: ${position.comment} \n\n`;
    } else {
      positionText = `[ ${position.category.name} ] ${position.name} - ${position.quantity} шт. \n\n`;
    }
    text = text.concat(positionText);
    text = text.concat(`От: ${this.orderService.seller.name} \nCтол: ${this.orderService.order_for.name}`)

    if (position.task === "bar") {

      if (this.settingsService.server && this.settingsService.printers && this.settingsService.printers.bar) {
        this.settingsService.task({ printer: this.settingsService.printers.bar.name, text: text }).subscribe(
          data => {
          },
          error => {
            this.snackbar.open("Ошибка печати на баре!")
          }
        )
      } else {
        this.snackbar.open("Не установлен сервер или принетер для бара!")
      }

    }

    if (position.task === "kitchen") {
      if (this.settingsService.server && this.settingsService.printers && this.settingsService.printers.kitchen) {
        this.settingsService.task({ printer: this.settingsService.printers.kitchen.name, text: text }).subscribe(
          data => {
          },
          error => {
            this.snackbar.open("Ошибка печати на кухне!")
          }
        )
      } else {
        this.snackbar.open("Не установлен сервер или принетер для кухни!")
      }
    }

  }

  kitchenTasks(positions: any[], data: any) {
    let text = "Задачи кухни: \n\n"

    for (let position of positions) {
      let positionText;
      if (position.comment) {
        positionText = `[ ${position.category.name} ] ${position.name} - ${position.quantity} шт. \nКомментарий: ${position.comment} \n\n`;
      } else {
        positionText = `[ ${position.category.name} ] ${position.name} - ${position.quantity} шт. \n\n`;
      }
      text = text.concat(positionText);
    }

    text = text.concat(`От: ${data.seller.name} \nCтол: ${data.order_for.name}`)

    if (this.settingsService.server && this.settingsService.printers && this.settingsService.printers.kitchen) {
      this.settingsService.task({ printer: this.settingsService.printers.kitchen.name, text: text }).subscribe(
        data => {

        },
        error => {
          this.snackbar.open("Ошибка печати на кухне!")
        }
      )
    } else {
      this.snackbar.open("Не установлен сервер или принетер для кухни!")
    }

  }

  barTasks(positions: any[], data: any) {
    let text = "Задачи бара: \n\n"

    for (let position of positions) {
      let positionText;
      if (position.comment) {
        positionText = `[ ${position.category.name} ] ${position.name} - ${position.quantity} шт. \nКомментарий: ${position.comment} \n\n`;
      } else {
        positionText = `[ ${position.category.name} ] ${position.name} - ${position.quantity} шт. \n\n`;
      }
      text = text.concat(positionText);
    }

    text = text.concat(`От: ${data.seller.name} \nCтол: ${data.order_for.name}`)

    if (this.settingsService.server && this.settingsService.printers && this.settingsService.printers.bar) {
      this.settingsService.task({ printer: this.settingsService.printers.bar.name, text: text }).subscribe(
        data => {

        },
        error => {
          this.snackbar.open("Ошибка печати на баре!")
        }
      )
    } else {
      this.snackbar.open("Не установлен сервер или принетер для бара!")
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

    if (this.positionService.positions) {

      this.positions = this.positionService.positions

    } else {

      const query = { visible: true }

      this.positionService.get(query, null, null).subscribe(
        data => {
          this.positionService.positions = data.map( (position: any) => {
            position.quantity = 1
            return position
          })
        },
        error => {
          console.warn(error)
          this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
        }
      )

    }

  }

  changeQuantity(position: any, type: boolean) {
    if (type) {
      position.quantity++
    } else {
      position.quantity--
    }
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


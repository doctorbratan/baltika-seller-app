import { Component, OnInit, HostListener } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { CommentItemComponent } from "../../dialogs/comment-item/comment-item.component";

import *  as moment from 'moment'

import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { PositionService } from 'src/app/services/position.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { SettingsService } from 'src/app/services/settings.service';
import { OrderService } from 'src/app/services/order.service';

export interface OrderPosition {
  _id: string,
  comment?: string,
  processed: boolean,
  category:
  {
    _id: string,
    name: string
  },
  name: string,
  get_cost: number,
  personal_cost: number,
  cost: number,
  quantity: number,
  total: number,
  action: boolean,
  task: string,
  storage: boolean
}

@Component({
  selector: 'app-fast',
  templateUrl: './fast.component.html',
  styleUrls: ['./fast.component.css']
})
export class FastComponent implements OnInit {
  insert: boolean = false
  barcode: string | undefined
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {


    if (event.key === "Enter") {
      this.insert = !this.insert
    }

    if ( this.insert && event.key !== "Enter" ) {
      this.barcode = (this.barcode || '') + event.key;
    }

    if (!this.insert && this.barcode) {
      this.findByBarcode(this.barcode)
      this.barcode = undefined
    }

  }

  loading: boolean = false
  pennding: boolean = false

  categories: any[] | undefined
  positions: any[] = []

  category: string | undefined
  cost: number | undefined
  filterText: string | undefined


  // Инфо о заказе
  isPrinted: boolean = false
  payment = "Наличные"
  status = "Закрыт"
  customer: any = {
    _id: "64526bc957afc60014d8b5cf",
    name: "Вынос",
    type: "guest"
  }
  order_for: any = {
    _id: "64526bc957afc60014d8b5d0",
    name: "Бар"
  }
  list: any[] = []
  total: number = 0
  salle: number  = 0
  total_price: number = 0

  constructor(
    private orderService: OrderService,
    public dialog: MatDialog,
    private settingsService: SettingsService,
    private categoryService: CategoryService,
    private positionService: PositionService,
    public authService: AuthService,
    private snackbar: SnackbarService
  ) { }

  ngOnInit(): void {
    this.getCategories();
    this.getPositions();
  }

  findByBarcode(barcode: string) {
    this.pennding = true

    this.positionService.findOne({barcode, visible: true, stop: false}).subscribe(
      data => {
        if (data) {
          data.quantity = 1
          this.addToList(data);
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

  fast() {

    this.pennding = true

    const data = this.zipOrder();

    this.checkTasks(data)
    this.orderService.fast(data).subscribe(
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


  public clear() {
    this.isPrinted = false
    this.payment = "Наличные"
    this.list = [],
    this.total = 0,
    this.salle = 0,
    this.total_price = 0
  }

  public zipOrder() {

    const order = {
      isPrinted: this.isPrinted,
      seller: this.authService.user,
      start: moment().format(),
      shift: moment().format("YYYY-MM-DD"),
      status: this.status,
      customer: this.customer,
      order_for: this.order_for,
      payment: this.payment,
      list: this.list,
      total: this.total,
      salle: this.salle,
      total_price: this.total_price
    }

    return order

  }

  // Блок печати

  printCheck() {

    const data = {
      order: this.zipOrder(),
      printer: this.settingsService.printers.check
    }

    this.settingsService.order(data).subscribe(
      data => {
        this.isPrinted = true
      },
      error => {
        this.snackbar.open("Ошибка печати чека!");
        this.pennding = false

      }
    )

  }

  checkTasks(data: any) {
    const kitchenTasks = []
    const barTasks = []

    for (let position of data.list) {

      if (position.task === 'bar') {
        barTasks.push(position)
      }
      if (position.task === 'kitchen') {
        kitchenTasks.push(position)
      }

    }

    if (kitchenTasks.length > 0) {
      this.kitchenTasks(kitchenTasks, data)
    }

    if (barTasks.length > 0) {
      this.barTasks(barTasks, data)
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

  addComment(i: number): void {
    const position = this.list[i]



    const dialogRef = this.dialog.open(CommentItemComponent, {
      data: position.comment ? position.comment : undefined,
    });


    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      position.comment = result
    });

  }

  //Добавление с главной страннцы
  public addToList(position: any) {
    this.pennding = true

    const orderPosition: OrderPosition = Object.assign({}, {
      processed: false,
      _id: position._id,
      category: position.category,
      name: position.name,
      get_cost: position.get_cost,
      personal_cost: position.personal_cost,
      cost: position.cost,
      quantity: position.quantity,
      total: position.cost,
      action: position.action,
      storage: position.storage,
      task: position.task
    })

    let _new = true
    this.list.forEach((item) => {
      if (item._id === orderPosition._id && !item.processed) {
        item.quantity = item.quantity + orderPosition.quantity
        _new = false
      }
    })

    if (_new) {
      this.list.push(orderPosition)
    }

    position.quantity = 1
    this.computePrice()
    this.snackbar.open("Добавленно!")
  }

  // Удалить со Списка
  public deleteFromList(index: number) {
    this.list.splice(index, 1)
    this.computePrice()
  }

  public plusQuantity(index: number) {
    const position = this.list[index]
    position.quantity++
    this.computePrice();
  }

  public minusQuantity(index: number) {
    const position = this.list[index]
    position.quantity--
    if (position.quantity <= 0) {
      this.list.splice(index, 1)
    }
    this.computePrice();
  }

  // Фунуция чтоб пересчитывать конечную цену
  public computePrice() {
    this.pennding = true

    if (this.customer && this.customer.type === 'admin') {
      for (let position of this.list) {
        position.total = 0
      }
    } else if (this.customer && this.customer.type === 'personal') {
      for (let position of this.list) {
        position.total = position.quantity * position.personal_cost
      }
    } else if (this.customer && this.customer.type === 'guest') {
      for (let position of this.list) {
        position.total = position.quantity * position.cost
      }
    } else {
      for (let position of this.list) {
        position.total = position.quantity * position.cost
      }
    }

    this.total = this.list.reduce((total, item) => {
      return total += item.total
    }, 0)

    if (this.salle !== undefined) {

      this.total_price = this.list.reduce((total, item) => {

        if (item.action) {
          return total += item.total
        } else {
          return total += (+item.total) - (item.total * (this.salle! / 100))
        }

      }, 0)

    } else {

      this.total_price = this.list.reduce((total, item) => {
        return total += item.total
      }, 0)

    }


    this.total_price = +this.total_price.toFixed(0)

    this.pennding = false
  }

  clearSearch() {
    this.category = undefined
    this.cost = undefined
    this.filterText = undefined
  }

  changeQuantity(position: any, type: boolean) {
    if (type) {
      position.quantity++
    } else {
      position.quantity--
    }
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
          this.positionService.positions = data.map((position: any) => {
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


}

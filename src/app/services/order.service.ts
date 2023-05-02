import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SnackbarService } from './snackbar.service';

import { environment } from "../../environments/environment";

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
  tasks: any[],
  storage: boolean
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  _id: string | undefined

  isPrinted: boolean = false

  start: string | undefined
  update: string | undefined
  updates: any[] | undefined
  shift: string | undefined


  seller: any
  customer: any | undefined
  order_for: any | undefined

  status: string = "Открыт"

  payment: string = "Наличные"

  list: OrderPosition[] = []

  total: number = 0
  salle: number | undefined
  total_price: number = 0


  constructor(
    private snackbar: SnackbarService,
    private http: HttpClient
  ) { }

  //Добавление с главной страннцы
  public addToList(position: any) {

    const orderPosition: OrderPosition = Object.assign({}, {
      processed: false,
      _id: position._id,
      category: position.category,
      name: position.name,
      get_cost: position.get_cost,
      personal_cost: position.personal_cost,
      cost: position.cost,
      quantity: 1,
      total: position.cost,
      action: position.action,
      storage: position.storage,
      tasks: position.tasks
    })
    
    let _new = true
    this.list.forEach( (position) => {
      if (position._id === orderPosition._id && !position.processed) {
        position.quantity++
        _new = false
      }
    })

    if (_new) {
      this.list.push(orderPosition)
    }

    this.computePrice()
    this.snackbar.open("Добавленно!")
  }

  // Фунуция чтоб пересчитывать конечную цену
  public computePrice() {

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

    this.total = this.list.reduce( (total, item) => {
        return total += item.total
    }, 0)

    if (this.salle !== undefined) {

      this.total_price = this.list.reduce( (total, item) => {

        if (item.action) {
          return total += item.total
        } else {
          return total += (+item.total) - ( item.total * (this.salle!/100)  )
        }
  
      }, 0 )

    } else {

      this.total_price = this.list.reduce( (total, item) => {
        return total +=item.total
      }, 0 )

    }


    this.total_price = +this.total_price.toFixed(0)

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

  public zipOrder() {

    const order = {
      isPrinted: this.isPrinted,
      start: this.start,
      update: this.update,
      updates: this.updates,
      shift: this.shift,
      status: this.status,
      seller: this.seller,
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

  public unZipOrder(data: any) {

    this._id = data._id!,

    this.isPrinted = data.isPrinted
    this.start = data.start
    this.update = data.update
    this.updates = data.updates
    this.shift = data.shift
    this.status = data.status,
    this.seller = data.seller!,
    this.customer = data.customer,
    this.order_for = data.order_for,
    this.payment = data.payment,
    this.list = data.list,
    this.total = data.total,
    this.salle = data.salle,
    this.total_price = data.total_price

    this.computePrice()

  }

  public clear() {
    this._id = undefined

    this.isPrinted = false
    this.start = undefined
    this.update = undefined
    this.updates = undefined
    this.shift = undefined
    this.status = "Открыт"
    this.seller = undefined
    this.customer = undefined
    this.order_for = undefined
    this.payment = "Наличные"
    this.list = [],
    this.total = 0,
    this.salle = undefined,
    this.total_price = 0
  }

  public checkOrder(data: any) {

    let response = {
      message: "",
      status: true
    }

    if (!data.seller) {
      response.message = "Перезагрузите страницу!"
      response.status = false
      return response
    }
    
    if (!data.customer) {
      response.message = "Выберите заказчика!"
      response.status = false
      return response
    }

    if (!data.order_for) {
      response.message = "Выберите стол!"
      response.status = false
      return response
    }

    if (data.list.length == 0) {
      response.message = "Заказ не может быть пустым!"
      response.status = false
      return response
    }

    return response

  }

  findOne(_id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiURL}/api/order-open/${_id}`);
  }

  get(query?: any, sort?: any, select?: any): Observable<any> {

    let params = new HttpParams();

    if (query) {
      params = params.set("query", JSON.stringify(query))
    }

    if (sort) {
      params = params.set("sort", JSON.stringify(sort))
    }

    if (select) {
      params = params.set("select", JSON.stringify(select))
    }

    return this.http.get<any>(`${environment.apiURL}/api/order-open`, { params: params });
  }

  post(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiURL}/api/order-open`, data);
  }

  patch(data: any, _id: string): Observable<any> {
    return this.http.patch<any>(`${environment.apiURL}/api/order-open/${_id}`, data)
  }

  delete(_id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiURL}/api/order-open/${_id}`)
  }


}

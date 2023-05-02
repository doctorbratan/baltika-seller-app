import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderFilter'
})

export class OrderFilterPipe implements PipeTransform {

  transform(list: any[], data: any) {

    if (data.customer) {
      list = list.filter(order => order.customer._id === data.customer)
    }

    if (data.seller) {
      list = list.filter( order => order.seller._id === data.seller )
    }

    return list
  }

}
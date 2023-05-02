import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'positionFilter'
})

export class PositionFilterPipe implements PipeTransform {

  transform(list: any[], data: any) {

    if (data.category) {
      list = list.filter(item => item.category._id === data.category)
    }

    if (data.cost) {
      list.filter( item => item.cost === data.cost )
    }

    return list ? list.filter(item => item.name.search(new RegExp(data.filterText, 'i')) > -1) : [];
  }

}
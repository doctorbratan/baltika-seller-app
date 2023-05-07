import { Component, OnInit } from '@angular/core';

import { PositionService } from 'src/app/services/position.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-storage-edit',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.css']
})
export class StorageComponent implements OnInit {

  loading: boolean = false
  pennding: boolean = false

  categories: any[] | undefined
  category: string | undefined

  positions: any[] | undefined
  position: any

  storage: any[] = []

  constructor(
    private snackbar: SnackbarService,
    private positionService: PositionService,
  ) { }

  ngOnInit(): void {
    this.getPositions()
  }

  checkBeforeUpdate() {

    for (const position of this.storage) {
      if (!position.quantity) {
        return false
      }
    }

    return true

  }

  async updateStorage() {
    this.pennding = true;

    try {

      for (let i = 0; i < this.storage.length;) {

        const position = this.storage[i];
        const query = { $inc: { quantity: position.quantity } };

        try {
          const data = await this.positionService.storage(query, position._id).toPromise();
          const candidate = this.storage.findIndex((item: any) => item._id === position._id)
          if (candidate || candidate === 0) {
            this.storage.splice(candidate, 1)
          }
        } catch (error) {
          this.snackbar.open(`Ошибка: [${position.category.name}] ${position.name}`);
          return;
        }

      }

      this.snackbar.open(`Склад обновлен!`);
      this.pennding = false

    } catch (error) {
      this.pennding = false
    }

    /*   
    try {
      for (let i = 0; i < this.storage.length; i++) {

        const position = this.storage[i];
        const query = { $inc: { quantity: position.quantity } };
  
        try {
          const data = await this.positionService.storage(query, position._id).toPromise();
          const candidate = this.storage.findIndex((item: any) => item._id === position._id)
          if (candidate || candidate === 0) {
            this.storage.splice(candidate, 1)
          }
        } catch (error) {
          this.snackbar.open(`Ошибка: [${position.category.name}] ${position.name}`);
        }
        
      }
  
      this.pennding = false
      this.snackbar.open("Склад обновлен!")
    } catch (e) {
      this.pennding = false
    } 
    */

  }

  add() {
    this.pennding = true

    const candidate = this.storage.find((position: any) => position._id === this.position._id)

    if (candidate) {
      candidate.quantity++
    } else {
      const item = {
        _id: this.position._id,
        category: this.position.category,
        name: this.position.name,
        quantity: 1
      }

      this.storage.push(item)
    }

    this.pennding = false

  }

  remove(i: number) {
    this.pennding = true

    this.storage.splice(i, 1)

    this.pennding = false
  }

  getPositions() {
    this.loading = true

    this.positionService.get({ storage: true }, null, null).subscribe(
      data => {
        this.positions = data


        const categoriesMap = {} as any;
        for (const position of data) {
          const category = position.category;

          if (!categoriesMap[category._id]) {
            categoriesMap[category._id] = {
              _id: category._id,
              name: category.name
            };
          }

        }

        this.categories = Object.values(categoriesMap);
        if (this.categories.length > 0) {
          this.category = this.categories[0]._id
        }

        this.loading = false;
      },
      error => {
        console.warn(error)
        this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
      }
    )
  }

}

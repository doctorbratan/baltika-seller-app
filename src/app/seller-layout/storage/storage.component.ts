import { Component, OnInit } from '@angular/core';

import { PositionService } from 'src/app/services/position.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-storage',
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

  quantity: number | undefined

  constructor(
    private snackbar: SnackbarService,
    private positionService: PositionService,
  ) { }

  ngOnInit(): void {
    this.getPositions()
  }


  updateStorage() {

    this.pennding = true;

    const query = { $inc: { quantity: this.quantity } };

    if (this.position) {

      this.positionService.storage(query, this.position._id).subscribe(
        data => {
          this.snackbar.open(`Склад обновлен!`);
          this.clear();
          this.pennding = false
        },
        error => {
          console.warn(error)
          this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
          this.pennding = false
        }
      )

    } else {
      this.clear();
      this.pennding = false
    }

  }

  clear() {
    this.quantity = undefined
    this.position = undefined
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

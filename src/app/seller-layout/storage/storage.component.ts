import { Component, OnInit, HostListener } from '@angular/core';

import { PositionService } from 'src/app/services/position.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.css']
})
export class StorageComponent implements OnInit {
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

  findByBarcode(barcode: string) {
    this.pennding = true

    this.positionService.findOne({barcode, storage: true, visible: true, stop: false}).subscribe(
      data => {
        if (data) {
          this.position = data
          this.category = data.category._id
          this.quantity = 0
          this.pennding = false
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

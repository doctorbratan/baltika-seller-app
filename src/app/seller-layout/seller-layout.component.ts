import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { PositionService } from '../services/position.service';
import { SnackbarService } from '../services/snackbar.service';
import { CategoryService } from '../services/category.service';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-seller-layout',
  templateUrl: './seller-layout.component.html',
  styleUrls: ['./seller-layout.component.css']
})
export class SellerLayoutComponent implements OnInit {

  loading: boolean = false
  

  constructor (
    public authService: AuthService,
    private positionService: PositionService,
    private categoryService: CategoryService,
    private customerService: CustomerService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.checkPositions();
  }

  checkPositions() {

    const candidate = localStorage.getItem('positions')
    if (candidate) {
      this.positionService.positions = JSON.parse(candidate)
    } else {

      const query = { visible: true }

      this.positionService.get(query, null, null).subscribe(
        data => {
          this.positionService.positions = data
          localStorage.setItem('positions', JSON.stringify(data))
        },
        error => {
          console.warn(error)
          this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
        }
      )

    }

  }

}

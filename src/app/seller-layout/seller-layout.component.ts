import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { PositionService } from '../services/position.service';
import { SnackbarService } from '../services/snackbar.service';
import { CategoryService } from '../services/category.service';
import { CustomerService } from '../services/customer.service';
import { SettingsService } from '../services/settings.service';

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
    private settingsService: SettingsService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.checkPositions();
    this.checkSettings();
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

  checkSettings() {

    const candidate = localStorage.getItem('settings')
    if (candidate) {
      const data = JSON.parse(candidate)
      if (data.server) {
        this.settingsService.server = data.server
      }
      if (data.printers) {
        this.settingsService.printers = data.printers
      }
    } else {

      this.settingsService.get().subscribe(
        data => {
          if (data.server) {
            this.settingsService.server = data.server
          }
          
          if (data.printers) {
            this.settingsService.printers = data.printers
          }

          const local_save = {
            server: data.server ? data.server : undefined,
            printers: data.printers ? data.printers : undefined
          }

          localStorage.setItem('settings', JSON.stringify(local_save))
        },
        error => { 
          console.warn(error)
          this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
        }
      )

    }

  }

}

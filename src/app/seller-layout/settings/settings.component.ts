import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SettingsService } from 'src/app/services/settings.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  pennding: boolean = false
  loading: boolean = false

  _id: string | undefined

  server: any

  printers: any[] | undefined
  
  constructor (
    private snackbar: SnackbarService,
    public authService: AuthService,
    public settingsService: SettingsService,

  ) {}

  ngOnInit(): void {
    this.getId()
    if (this.settingsService.server) {
      this.checkServer();
    }
  }

  restart_alt() {
    localStorage.removeItem('positions');
    localStorage.removeItem('settings')
    location.reload();
  }

  addPrinter(printer: any) {
    this.pennding = true

    const response = this.checkInput(printer);

    if (!response.type) {
      this.snackbar.open(response.message);
      this.pennding = false
    } else {

      const query: { [key: string]: any } = {}; // явный тип для объекта query

      query[`printers.${printer.place}`] = {
        name: printer.name,
        driverName: printer.driverName,
        width: printer.width,
        height: printer.height
      };

      this.settingsService.patch(query, this._id!).subscribe(
        data => {
          this.snackbar.open(data.message)
          this.printers = data.settings.printers
          this.pennding = false
        },
        error => {
          console.warn(error)
          this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
          this.pennding = false
        }
      )

    }

  }

  checkInput(printer: any) {

    if (!printer.place) {
      return { type: false, message: "Выберите местоположение принтера!" }
    }

    if (!printer.width || printer.width < 20) {
      return { type: false, message: "Некорректная ширина!" }
    }

    if (!printer.height || printer.height < 10) {
      return { type: false, message: "Некорректная высота!" }
    }

    return { type: true, message: "Все ок!" }
  }

  checkPrinter(printer: any) {
    this.pennding = true

    this.settingsService.checkPrinter(printer.name).subscribe(
      data => {
        printer.status = "В сети"
        this.pennding = false
      },
      error => {
        printer.status = "Не в сети"
        this.pennding = false
      }
    )
  }

  getPrinters() {
    this.loading = true

    this.settingsService.getPrinters().subscribe(
      data => {
        this.printers = data
        this.loading = false
      },
      error => {
        console.warn(error)
        this.loading = false
      }
    )
  }

  changeServer() {
    this.pennding = true

    const data = {
      server: this.settingsService.server
    }

    this.settingsService.patch(data, this._id!).subscribe(
      data => {
        this.snackbar.open(data.message)
        this.settingsService.server = data.settings.server
        this.checkServer();
        this.pennding = false
      },
      error => {
        console.warn(error)
        this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
        this.pennding = false
      }
    )
  }

  getId() {
    this.settingsService.get().subscribe(
      data => {
        if (data) {
          this._id = data._id
        }
      },
      error => {
        console.warn(error)
      }
    )
  }

  checkServer() {
    this.settingsService.checkServer().subscribe(
      data => {
        this.server = "В сети"
        this.getPrinters();
      },
      error => {
        this.server = "Не в сети"
        console.log(error)
      }
    )
  }


}

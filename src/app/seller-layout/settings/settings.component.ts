import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  server: any
  
  constructor (
    public authService: AuthService,
    public settingsService: SettingsService
  ) {}

  restart_alt() {
    localStorage.removeItem('positions');
    localStorage.removeItem('settings')
    location.reload();
  }

  checkServer() {
    this.settingsService.checkServer(this.settingsService.server!).subscribe(
      data => {
        this.server = "В сети"
      },
      error => {
        this.server = false
      }
    )
  }


}

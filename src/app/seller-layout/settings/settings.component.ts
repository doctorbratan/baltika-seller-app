import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  constructor (
    public authService: AuthService
  ) {}

  restart_alt() {
    localStorage.removeItem('positions');
    location.reload();
  }

}

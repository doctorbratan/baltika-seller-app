import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {


  server: any
  
  constructor (
    private location: Location,
    public authService: AuthService,
    public settingsService: SettingsService
  ) {}

  ngOnInit(): void {
  }

  restart_alt() {
    localStorage.removeItem('positions');
    localStorage.removeItem('settings')
    location.reload();
  }

  checkServer() {
    this.settingsService.checkServer().subscribe(
      data => {
        this.server = "В сети"
      },
      error => {
        this.server = false
        console.log(error)
      }
    )
  }


}

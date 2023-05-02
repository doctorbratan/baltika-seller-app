import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from './services/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy  {

  loading: boolean = false

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.checkToken();
  }

  ngOnDestroy(): void {
  }

  checkToken() {
    const candidate = localStorage.getItem("auth-token");
    if (candidate) {
      this.authService.setToken(candidate);
      this.checkUserAccess();
    }
  }

  checkUserAccess() {

    const token = this.authService.getToken();

    if (token) {

      this.loading = true

      this.authService.userInfo().subscribe(
        (data) => {
          this.authService.setUser(data);
          this.loading = false
        },
        error => {
          console.warn(error);
          this.loading = false
        }
      )

    }

  }

}

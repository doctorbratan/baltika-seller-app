import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {

  pennding: boolean = false

  user = new FormGroup({
    login: new FormControl(undefined, [Validators.required, Validators.minLength(4)]),
    password: new FormControl(undefined, [Validators.required, Validators.minLength(4)])
  })

  aSub!: Subscription

  constructor(
    private authService: AuthService,
    private _snackbar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {

    if (this.authService.user) {
      this.router.navigate(['/seller'])
    }

  }

  ngOnDestroy(): void {
    if (this.aSub) this.aSub.unsubscribe()
  }


  onSubmit() {
    
    const data = this.user.value

    this.aSub = this.authService.login(data).subscribe(
      (data) => {
        this.pennding = false
        this.router.navigate(['/seller'])
        this._snackbar.open("Добро пожаловать!", "(by Alliance)",
        { duration: 3000, horizontalPosition: "right", verticalPosition: "top" })

      },
      err => {
        this.pennding = false
        this._snackbar.open(err.error.message ? err.error.message : err, "Ошибка", { duration: 3000 })
        console.log(err)
      }
    )

  }

}

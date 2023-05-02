import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(
    private _snackBar: MatSnackBar
  ) { }

  open(message: string, seconds?: number) {
    this._snackBar.open(
      message, "Ок",
      {
        horizontalPosition: "center",
        verticalPosition: "top",
        duration: seconds ? seconds * 1000 : 3000
      }
      );
  }

}

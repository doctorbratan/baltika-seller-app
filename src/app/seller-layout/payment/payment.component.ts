import { Component, OnInit } from '@angular/core';

import { FormGroup, Validators, FormControl } from '@angular/forms';
import { PaymentService } from 'src/app/services/payment.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  pennding: boolean = false

  data = new FormGroup({
    payment: new FormControl('Наличные', [Validators.required]),
    name: new FormControl(undefined, [Validators.required, Validators.minLength(2)]),
    summ: new FormControl(0, [Validators.required, this.validateCost])
  })

  constructor(
    private paymentService: PaymentService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    
  }

  validateCost(control: FormControl) {
    const value = control.value;
    if (value === null || value === undefined || value === 0) {
      return { 'invalidCost': true };
    }
    return null;
  }

  post() {
    this.pennding = true

    this.paymentService.post(this.data.getRawValue()).subscribe(
      data => {
        this.pennding = false
        this.snackbar.open(data)
        this.data.reset({ payment: "Наличные", name: undefined, summ: 0 });
      },
      error => {
        console.warn(error)
        this.snackbar.open(error.error.message ? error.error.message : "Ошибка", 5)
        this.pennding = false
      }
    )

  }

}


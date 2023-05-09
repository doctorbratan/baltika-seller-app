import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public server: string | undefined = "http://192.168.100.85:3000"
  public printers: any

  constructor(private http: HttpClient) { }

  get(): Observable<any> {
    return this.http.get<any>(`${environment.apiURL}/api/settings`);
  }

  order(data: any): Observable<any> {
    // return this.http.post<any>(`${environment.apiURL}/api/printer/order`, data)
    return this.http.post<any>(`${this.server}/printer/order`, data)
  }

  task(data: any): Observable<any> {
    // return this.http.post<any>(`${environment.apiURL}/api/printer/task`, data)
    return this.http.post<any>(`${this.server}/printer/task`, data)
  }

  checkServer(): Observable<any> {
    //return this.http.get<any>(`${environment.apiURL}/api/printer/checkServer`)
    return this.http.get<any>(`${this.server}/`)
  }

  checkPrinter(name: string): Observable<any> {
    //return this.http.get<any>(`${environment.apiURL}/api/printer/${name}`)
    return this.http.get<any>(`${this.server}/printer/${name}`)
  }

  getPrinters(): Observable<any> {
    //return this.http.get<any>(`${environment.apiURL}/api/printer`)
    return this.http.get<any>(`${this.server}/printer`)
  }


}

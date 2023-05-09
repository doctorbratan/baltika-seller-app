import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public server: string | undefined
  public printers: any

  constructor(private http: HttpClient) { }

  get(): Observable<any> {
    return this.http.get<any>(`${environment.apiURL}/api/settings`);
  }

  order(data: any, path: string): Observable<any> {
    return this.http.post<any>(`${path}/printer/order`, data)
  }

  task(data: any, path: string): Observable<any> {
    return this.http.post<any>(`${path}/printer/task`, data)
  }

  checkServer(path: string): Observable<any> {
    return this.http.get<any>(`${path}/`)
  }

  checkPrinter(path: string, name: string): Observable<any> {
    return this.http.get<any>(`${path}/printer/${name}`)
  }

}

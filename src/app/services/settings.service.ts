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
    return this.http.post<any>(`https://${path}:3000/printer/order`, data, {withCredentials: true})
  }

  task(data: any, path: string): Observable<any> {
    return this.http.post<any>(`https://${path}:3000/printer/task`, data, {withCredentials: true})
  }

  checkServer(path: string): Observable<any> {
    return this.http.get<any>(`http://${path}:3000/`, {withCredentials: true})
  }

  checkPrinter(path: string, name: string): Observable<any> {
    return this.http.get<any>(`https://${path}:3000/printer/${name}`, {withCredentials: true})
  }

}

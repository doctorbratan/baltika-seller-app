import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class WriteOffService {

  constructor(private http: HttpClient) { }

  patch(data: any, _id: string): Observable<any> {
    return this.http.patch<any>(`${environment.apiURL}/api/writeOff/${_id}`, data);
  }
  
}

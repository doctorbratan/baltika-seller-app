import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) { }

  findOne(_id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiURL}/api/category/${_id}`);
  }

  get(query?: any, sort?: any, select?: any): Observable<any> {

    let params = new HttpParams();

    if (query) {
      params = params.set("query", JSON.stringify(query))
    }

    if (sort) {
      params = params.set("sort", JSON.stringify(sort))
    }

    if (select) {
      params = params.set("select", JSON.stringify(select))
    }

    return this.http.get<any>(`${environment.apiURL}/api/category`, { params: params });
  }

}

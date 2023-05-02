import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: any
  public user: any

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }


  login(data: any): Observable<{ message: string, token: string, user: any }> {
    return this.http.post<{ message: string, token: string, user: any }>(`${environment.apiURL}/api/auth/login`, data)
      .pipe(
        tap(
          ({ token, user }) => {
            this.setToken(token);
            localStorage.setItem('auth-token', token);
            this.setUser(user);
          }
        ))
  };

  setToken(token: any) {
    this.token = token
  }

  getToken(): string {
    return this.token
  }

  isAuthenticated(): boolean {
    return this.token
  }

  setUser(user: any) {

    if (!this.user) {
      this.user = {}
    }

    this.user._id = user._id
    this.user.name = user.name
    this.user.status = user.status
    this.user.check_name = user.check_name

  }

  logout() {
    this.setToken(null)
    this.user = undefined
    localStorage.clear()
    this.router.navigate(['/login'])
  }


  get(query?: any, sort?: any, select?: any): Observable<any[]> {

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


    return this.http.get<any[]>(`${environment.apiURL}/api/auth`, { params: params } )
  }

  userInfo(): Observable<any> {
    return this.http.get<any>(`${environment.apiURL}/api/auth/user`)
  }

  getIp(): Observable<any> {
    return this.http.get<any>("http://api.ipify.org/?format=json")
  }

}

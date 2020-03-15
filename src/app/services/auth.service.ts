import { environment } from './../../environments/environment';
import { TokenExpiredError } from './../common/token-expired-error';
import { AppError } from './../common/app-error';
import { UnauthorizedError } from './../common/unauthorized-error';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError, map } from 'rxjs/operators';
import { throwError, ReplaySubject, Observable, forkJoin, concat, BehaviorSubject } from 'rxjs';
import { User } from '../models/user';

const tokenName = 'token';
const refreshName = 'refresh_token';

export const tokenUrl = environment.baseUrl +  '/jwt-token';
export const refreshTokenUrl = environment.baseUrl + '/refresh-token';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  static getAccessToken(): string {
    return localStorage.getItem(tokenName);
  }

  static getRefreshToken(): string {
    return localStorage.getItem(refreshName);
  }

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(this.getUser());
    this.currentUser = this.currentUserSubject.asObservable();
   }

   public get currentUserValue(): User {
     return this.currentUserSubject.value;
  }

  login(username: string, password: string) {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + btoa(username + ':' + password));

    return this.http.post(tokenUrl, null, { headers })
    .pipe(
      map(
        response => {
          if (response[refreshName])
            this.setRefreshToken(response[refreshName]);
          if (response[tokenName] && response['user']) {
            this.setAccessToken(response[tokenName]);
            const user: User = this.setUser(response[tokenName], response['user']);
            this.currentUserSubject.next(user);
            return true;
          }
          else return false;
        }
      ),
      catchError(this.handleError)
    );
  }

  refresh(): Observable<any> {
    const refreshObservable = this.http.post(refreshTokenUrl, null);

    const refreshSubject = new ReplaySubject<any>(1);
    refreshSubject.subscribe(r => {
      this.setAccessToken(r[tokenName]);
    }, (err) => {
      this.handleError(err);
    });

    refreshObservable.subscribe(refreshSubject);
    return refreshSubject;
  }

  logout() {
    let delRefreshToken = this.http.delete(refreshTokenUrl);
    let delAccessToken = this.http.delete(tokenUrl);

    const logoutObservable  = delAccessToken;
    const logoutSubject = new ReplaySubject<any>(1);

    logoutSubject.subscribe(() => {
      delRefreshToken.subscribe(() => {
        this.setUser(null,null);
        this.setAccessToken(null);
        this.setRefreshToken(null);
        this.currentUserSubject.next(null);
      });
    }, (err) => {
      this.handleError(err);
    });

    logoutObservable.subscribe(logoutSubject);
    return logoutSubject;
  }

  // isLoggedIn(): boolean {
  //   let accessTokenExp = this.jwtHelper.isTokenExpired(AuthService.getAccessToken());
  //   let refreshTokenExp = this.jwtHelper.isTokenExpired(AuthService.getRefreshToken());

  //   if (!AuthService.getAccessToken() || (accessTokenExp && refreshTokenExp) ) {
  //     return false;
  //   }
  //   return true;
  // }

  private setAccessToken(accessToken: string) {
    if (!accessToken) {
      localStorage.removeItem(tokenName);
    } else {
      localStorage.setItem(tokenName, accessToken);
    }
  }

  private setRefreshToken(refreshToken: string) {
    if (!refreshToken) {
      localStorage.removeItem(refreshName);
    } else {
      localStorage.setItem(refreshName, refreshToken);
    }
  }

  private setUser(accessToken: string, user: User): User {
    if (!accessToken) {
      localStorage.removeItem('currentUser');
    } else {
      let decodedToken = this.jwtHelper.decodeToken(accessToken);
      console.log(user);
      user.isadmin = decodedToken['user_claims']['isAdmin'];

      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
  }

  private getUser(){
    let user: User = JSON.parse(localStorage.getItem('currentUser'));

    // sensitive data should be read from signed JWT token. E.g. rights
    if (user){
      let token = AuthService.getAccessToken();
      let decodedToken = this.jwtHelper.decodeToken(token);
      user.isadmin = decodedToken['user_claims']['isAdmin'];
      return user;
    }
    return null;
  }

  private handleError(errorResponse: HttpErrorResponse) {
    if (errorResponse.status === 401){
      if (errorResponse.error.msg === 'Token has expired') return throwError(new TokenExpiredError());
      return throwError(new UnauthorizedError());
    }
    return throwError( new AppError(errorResponse) );
  }
}


import { NotFoundError } from './../common/not-found-error';
import { Query } from './../models/query';
import { TokenExpiredError } from './../common/token-expired-error';
import { UnauthorizedError } from './../common/unauthorized-error';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, retry, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AppError } from '../common/app-error';
import { Injectable } from '@angular/core';

/*
@Injectable({
  providedIn: 'root'
})*/
export class DataService<T> {
  constructor(
    protected url: string,
    private http: HttpClient) { }

  httpOptions = { headers: new HttpHeaders({'Content-Type': 'application/json'}) };

  private handleError(error: HttpErrorResponse) {
    // if (error.status === 404)
    //   return throwError( new NotFoundError() );
    // if (error.status === 400)
    //   return throwError( new BadInputError() );
    if (error.status === 401){
      if (error.error.msg === 'Token has expired') return throwError(new TokenExpiredError());
      return throwError(new UnauthorizedError());
    }
    if (error.status === 404){
      return throwError(new NotFoundError());
    }
    return throwError( new AppError(error) );
  }

  getAll(query?: Query) {
    let params = new HttpParams();
    if (query) params = params.append('sort_by', query.order.column +  '.' + query.order.dir);
    return this.http.get<T[]>(this.url, {params}).pipe(
      catchError(this.handleError)
    );
  }

  get(id) {
    return this.http.get<T>(this.url + '/' + id).pipe(
      catchError(this.handleError)
    );
  }
  create(resource){
    return this.http.post<T>(this.url, JSON.stringify(resource), this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }
  update(id, resource){
    return this.http.put<T>(this.url + '/' + id, JSON.stringify(resource), this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  delete(id){
    return this.http.delete(this.url + '/' + id).pipe(
      catchError(this.handleError), retry(3)
    );
  }

}

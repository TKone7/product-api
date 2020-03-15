import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { AuthService, refreshTokenUrl } from './services/auth.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { JwtInterceptor } from '@auth0/angular-jwt';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {
  constructor(private authorizationService: AuthService, private jwtInterceptor: JwtInterceptor) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isWhiteList = this.jwtInterceptor.isWhitelistedDomain(req);
    const isBlackList = this.jwtInterceptor.isBlacklistedRoute(req);
    const isRefreshTokenRequest = req.url.includes(refreshTokenUrl);

    if (isWhiteList && !isBlackList && !isRefreshTokenRequest) {
        return next.handle(req).pipe(
            catchError((err) => {
                const errorResponse = err as HttpErrorResponse;
                if (errorResponse.status === 401 && errorResponse.error.msg === 'Token has expired') {
                    return this.authorizationService.refresh()
                        .pipe(mergeMap(() => {
                            return this.jwtInterceptor.intercept(req, next);
                        }));
                }
                return throwError(err);
            }));
        } else {
            if (isRefreshTokenRequest && AuthService.getRefreshToken) {
                let newReq = req.clone({
                    setHeaders: {
                        Authorization: 'Bearer ' + AuthService.getRefreshToken()
                    }
                });
                return next.handle(newReq);
            }
            return next.handle(req);
        }
    }
}

import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.currentUser
    .pipe(map(user => user.isadmin));

    // if (this.authService.currentUserValue.isadmin){
    //   return true;
    // }
    // this.router.navigate(['/login'], {queryParams: { returnUrl: state.url}});
    // return false;

  }

  constructor(
    private authService: AuthService,
    private router: Router
    ) { }
}

import { UnauthorizedError } from './../common/unauthorized-error';
import { AppError } from './../common/app-error';
import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  invalidLogin: boolean;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
  }

  signIn(creds){
    this.authService.login(creds.username, creds.password)
      .subscribe(result => {
        if (result){
          let returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          this.router.navigate([returnUrl || '/']);
        }
      },
      (error: AppError) => {
        if (error instanceof UnauthorizedError) {
          this.invalidLogin = true;
        } else {
          throw error;
        }
      });
  }

}

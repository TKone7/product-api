import { Observable } from 'rxjs';
import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user';

@Component({
  selector: 'bs-navbar',
  templateUrl: './bs-navbar.component.html',
  styleUrls: ['./bs-navbar.component.css']
})
export class BsNavbarComponent implements OnInit {
  currentUser: User;
  isShown = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
      this.authService.currentUser.subscribe(user => this.currentUser = user);
    }

  ngOnInit() {
  }

  toggleBurger(){
    this.isShown = !this.isShown;
  }

  onLogout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate([ '/' ]);
    });
  }

}

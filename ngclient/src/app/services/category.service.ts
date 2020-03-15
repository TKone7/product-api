import { environment } from './../../environments/environment';
import { Category } from './../models/category';
import { DataService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends DataService<Category> {

  constructor(http: HttpClient) {
    super(environment.baseUrl + '/categories', http);
  }
}

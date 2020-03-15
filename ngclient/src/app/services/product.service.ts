import { DataService } from './data.service';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends DataService<Product>{

  constructor(http: HttpClient) {
    super(environment.baseUrl + '/products', http);
  }
}




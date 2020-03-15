import { CategoryService } from './../../services/category.service';
import { Category } from './../../models/category';
import { Observable } from 'rxjs';
import { Product } from './../../models/product';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'product-main',
  templateUrl: './product-main.component.html',
  styleUrls: ['./product-main.component.css']
})
export class ProductMainComponent implements OnInit {
  @Input('product') product: Product;
  @Input('main-form') mainForm: FormGroup;

  get name() {
    return this.mainForm.get('name');
  }
  get barcode() {
    return this.mainForm.get('barcode');
  }
  get qty() {
    return this.mainForm.get('qty');
  }
  get category() {
    return this.mainForm.get('category');
  }
  get imageUrl() {
    return this.mainForm.get('imgurl');
  }
  categories$: Observable<Category[]>;
  types = [
    'gramm',
    'milliliter',
    'pieces'
  ];

  constructor(
    categoryService: CategoryService
  ) {
    this.categories$ = categoryService.getAll({
      order: {
        column: 'slug',
        dir: 'desc'
      }
    });
   }

  ngOnInit() {
  }

}

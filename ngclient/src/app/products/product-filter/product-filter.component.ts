import { CategoryService } from './../../services/category.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css']
})
export class ProductFilterComponent implements OnInit {
  categories$;
  @Input('category') category: string;

  constructor(
    categoryService: CategoryService
  ) {
    this.categories$ = categoryService.getAll({ order: { column: 'slug', dir: 'desc' } });
  }

  ngOnInit() {
  }

}

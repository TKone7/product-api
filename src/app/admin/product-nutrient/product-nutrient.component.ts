import { FormGroup } from '@angular/forms';
import { Product } from './../../models/product';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'product-nutrient',
  templateUrl: './product-nutrient.component.html',
  styleUrls: ['./product-nutrient.component.css']
})
export class ProductNutrientComponent implements OnInit {
  // @Input('product') product: Product;
  @Input('nutrient-form') nutrientForm: FormGroup;
  @Output() toggled = new EventEmitter<boolean>();

  get nutrientbase() {
    return this.nutrientForm.get('nutrientbase');
  }
  get energy_kcal() {
    return this.nutrientForm.get('energy_kcal');
  }
  constructor() { }

  ngOnInit() {
    console.log('input is: ' + this.nutrientForm);
  }

  toggleNutrition(){
    if (this.nutrientForm)
      this.toggled.emit(false);
    else
      this.toggled.emit(true);
  }
}

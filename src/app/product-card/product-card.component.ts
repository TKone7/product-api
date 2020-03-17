import { Product } from './../models/product';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input('product') product: Product;
  @Input('show-actions') showActions = true;
  @Output() close = new EventEmitter();
  @Output() edit = new EventEmitter<Product>();


  constructor() { }

  addToCart(product: Product) {
    // work with services to not give this component too much responsibility
    // this.whateverService.add(product);
  }

  closeCard() {
    this.close.emit();
  }

  editCard() {
    this.edit.emit(this.product);
  }

}

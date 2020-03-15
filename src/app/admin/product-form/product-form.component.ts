import { Product } from './../../models/product';
import { ProductService } from './../../services/product.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { Location } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';


@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(),
    barcode: new FormControl('', [Validators.required, CustomValidators.number]),
    'qty_type': new FormControl(),
    qty: new FormControl('', [Validators.required, Validators.min(0)]),
    category: new FormControl('', Validators.required),
    imgurl: new FormControl('', CustomValidators.url)
  });
  nutritionForm = new FormGroup({
    carbs: new FormControl(),
    carbs_sugar: new FormControl(),
    energy_kcal: new FormControl(),
    fat: new FormControl(),
    fat_saturated: new FormControl(),
    fiber: new FormControl(),
    natrium: new FormControl(),
    nutrientbase: new FormControl('hundred_gramm'),
    protein: new FormControl(),
    salt: new FormControl()
  });

  // product: Product = {};
  existingBarcode;
  activeTab = 'main';

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
    ) {
      // snapshot is good enough, cause the content of component cannot be loaded dynamically
      this.existingBarcode = this.route.snapshot.paramMap.get('barcode');
      if (this.existingBarcode) this.productService.get(this.existingBarcode)
        .pipe(take(1))
        .subscribe(p => {
          if (p.nutrient) this.addNutritionForm();
          this.form.patchValue(p);
          this.form.get('barcode').disable();
        });

      let newBarcode = this.route.snapshot.queryParamMap.get('barcode');
      this.form.get('barcode').setValue(newBarcode);
  }

  activate(tab) {
      this.activeTab = tab;
      console.log(this.form.getRawValue());
  }

  onToggled(active: boolean) {
    if (!active)
      this.form.removeControl('nutrient');
    else {
      this.addNutritionForm();
    }
  }

  addNutritionForm() {
    this.form.addControl('nutrient', this.nutritionForm);
  }

  save(){
    let product = this.form.getRawValue();

    if (this.existingBarcode) this.productService.update(this.existingBarcode, product).subscribe(r => {
      this.router.navigate(['/admin/products']);
    });
    else this.productService.create(product).subscribe(r => {
      this.router.navigate(['/admin/products']);
    });

  }

  delete(){
    if (!confirm('Are you sure you want to delete this product')) return;

    this.productService.delete(this.existingBarcode).subscribe(r => {
      this.router.navigate(['/admin/products']);
    });
  }
  back() {
    this.location.back();
  }

  ngOnInit() {
  }
}

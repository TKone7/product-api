import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductNutrientComponent } from './product-nutrient.component';

describe('ProductNutrientComponent', () => {
  let component: ProductNutrientComponent;
  let fixture: ComponentFixture<ProductNutrientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductNutrientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductNutrientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

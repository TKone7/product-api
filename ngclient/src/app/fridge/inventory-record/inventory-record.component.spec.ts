import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryRecordComponent } from './inventory-record.component';

describe('InventoryRecordComponent', () => {
  let component: InventoryRecordComponent;
  let fixture: ComponentFixture<InventoryRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

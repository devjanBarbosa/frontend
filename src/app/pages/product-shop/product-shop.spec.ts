import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductShop } from './product-shop';

describe('ProductShop', () => {
  let component: ProductShop;
  let fixture: ComponentFixture<ProductShop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductShop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductShop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

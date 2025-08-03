import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftShop } from './gift-shop';

describe('GiftShop', () => {
  let component: GiftShop;
  let fixture: ComponentFixture<GiftShop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftShop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiftShop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

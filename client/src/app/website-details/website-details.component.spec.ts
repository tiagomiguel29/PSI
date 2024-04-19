import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteDetailsComponent } from './website-details.component';

describe('WebsiteDetailsComponent', () => {
  let component: WebsiteDetailsComponent;
  let fixture: ComponentFixture<WebsiteDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebsiteDetailsComponent]
    });
    fixture = TestBed.createComponent(WebsiteDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

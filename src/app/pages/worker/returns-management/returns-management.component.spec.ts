import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnsManagementComponent } from './returns-management.component';

describe('ReturnsManagementComponent', () => {
  let component: ReturnsManagementComponent;
  let fixture: ComponentFixture<ReturnsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnsManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

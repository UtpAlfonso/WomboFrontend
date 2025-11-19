import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerOrderManagementComponent } from './worker-order-management.component';

describe('WorkerOrderManagementComponent', () => {
  let component: WorkerOrderManagementComponent;
  let fixture: ComponentFixture<WorkerOrderManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkerOrderManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkerOrderManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadConsole } from './upload-console';

describe('UploadConsole', () => {
  let component: UploadConsole;
  let fixture: ComponentFixture<UploadConsole>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadConsole],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadConsole);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

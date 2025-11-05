import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCopiesComponent} from './book-copies';

describe('BookCopies', () => {
  let component: BookCopiesComponent;
  let fixture: ComponentFixture<BookCopiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCopiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookCopiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

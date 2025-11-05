import { TestBed } from '@angular/core/testing';

import { BookCopiesService } from './book-copies';

describe('BookCopies', () => {
  let service: BookCopiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookCopiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

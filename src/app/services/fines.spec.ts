import { TestBed } from '@angular/core/testing';

import { Fines } from './fines';

describe('Fines', () => {
  let service: Fines;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fines);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

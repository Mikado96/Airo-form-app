import { TestBed } from '@angular/core/testing';

import { CsvParserService } from './csv-parser.service';

describe('CsvParser', () => {
  let service: CsvParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

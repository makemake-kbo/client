import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@app/api-url';
import { ConfigurationService } from './configuration.service';

describe('ConfigurationService', () => {
  let service: ConfigurationService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: API_URL, useValue: 'FAKE_URL' },
      ],
    });
    service = TestBed.inject(ConfigurationService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#fetchValue()', () => {
    it('should query the api', () => {
      let result: string;
      service.fetchValue<string>('whitelist id').subscribe(r => result = r);
      const request = httpController.expectOne('FAKE_URL/configuration/whitelist-id');
      request.flush({ key: 'whitelist id', value: 'etf2l_9v9' });
      expect(result).toEqual('etf2l_9v9');
    });
  });

  describe('#storeValue()', () => {
    it('should query the api', () => {
      let result: string;
      service.storeValue<string>('whitelist id', 'etf2l_6v6').subscribe(r => result = r);
      const request = httpController.expectOne('FAKE_URL/configuration/whitelist-id');
      expect(request.request.method).toBe('PUT');
      request.flush({ key: 'whitelist id', value: 'etf2l_6v6' });
      expect(result).toEqual('etf2l_6v6');
    })
  });

});

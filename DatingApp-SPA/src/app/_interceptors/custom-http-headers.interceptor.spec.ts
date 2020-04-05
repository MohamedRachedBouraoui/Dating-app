/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CustomHttpHeadersInterceptor } from './custom-http-headers.interceptor';

describe('Service: CustomHttpHeaders', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomHttpHeadersInterceptor]
    });
  });

  it('should ...', inject([CustomHttpHeadersInterceptor], (service: CustomHttpHeadersInterceptor) => {
    expect(service).toBeTruthy();
  }));
});

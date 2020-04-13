/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RealTimeMessagingService } from './real-time-messaging.service';

describe('Service: RealTimeMessaging', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RealTimeMessagingService]
    });
  });

  it('should ...', inject([RealTimeMessagingService], (service: RealTimeMessagingService) => {
    expect(service).toBeTruthy();
  }));
});

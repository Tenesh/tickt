import {ExpirationCompleteEvent, ExpirationSubject, Publisher} from '@ticketeer/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    readonly subject= ExpirationSubject.ExpirationComplete;
}
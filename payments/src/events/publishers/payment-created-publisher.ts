import {Publisher, PaymentSubject, PaymentCreatedEvent} from '@ticketeer/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = PaymentSubject.PaymentCreated;
}
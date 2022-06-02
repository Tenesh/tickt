import {Publisher, OrderSubject, OrderCreatedEvent} from '@ticketeer/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = OrderSubject.OrderCreated;
}
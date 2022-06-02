import {Publisher, OrderSubject, OrderCancelledEvent} from '@ticketeer/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = OrderSubject.OrderCancelled;
}
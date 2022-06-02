import {Publisher, TicketSubject, TicketUpdatedEvent} from '@ticketeer/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = TicketSubject.TicketUpdated;
}
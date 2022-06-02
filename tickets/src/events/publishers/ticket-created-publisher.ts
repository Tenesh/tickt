import {Publisher, TicketSubject, TicketCreatedEvent} from '@ticketeer/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = TicketSubject.TicketCreated;
}
import {Message} from 'node-nats-streaming';
import {TicketSubject, Listener, TicketCreatedEvent} from '@ticketeer/common';

import {Ticket} from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = TicketSubject.TicketCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        const {id,title, price} = data;
        const ticket = Ticket.build({
            id,
            title,
            price
        });
        await ticket.save();

        msg.ack()
    };
}
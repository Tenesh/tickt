import {Message} from 'node-nats-streaming';
import {TicketSubject, Listener, TicketUpdatedEvent, BadRequestError} from '@ticketeer/common';

import {Ticket} from '../../models/ticket';
import {queueGroupName} from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = TicketSubject.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const {id, title, price, version} = data;
        const ticket = await Ticket.findByEvent({id: id, version: version});

        if (!ticket) {
            throw new BadRequestError('Ticket not found!');
        }

        ticket.set({title, price});
        await ticket.save();

        msg.ack()
    };
}
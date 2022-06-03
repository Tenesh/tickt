import {Message} from 'node-nats-streaming';
import {OrderSubject, Listener, OrderCreatedEvent, BadRequestError} from '@ticketeer/common';

import {Ticket} from '../../models/ticket';
import {queueGroupName} from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = OrderSubject.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new BadRequestError('Ticket is not found');
        }

        ticket.set({orderId: data.id});
        await ticket.save();

        msg.ack()
    };
}
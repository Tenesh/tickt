import {Message} from 'node-nats-streaming';
import {OrderSubject, Listener, OrderCreatedEvent, BadRequestError} from '@ticketeer/common';

import {Ticket} from '../../models/ticket';
import {queueGroupName} from './queue-group-name';
import {TicketUpdatedPublisher} from '../publishers/ticket-updated-publisher';

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

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId
        });

        msg.ack()
    };
}
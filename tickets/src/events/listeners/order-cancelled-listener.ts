import {Message} from 'node-nats-streaming';
import {OrderSubject, Listener, OrderCancelledEvent, BadRequestError} from '@ticketeer/common';

import {Ticket} from '../../models/ticket';
import {queueGroupName} from './queue-group-name';
import {TicketUpdatedPublisher} from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = OrderSubject.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new BadRequestError('Ticket is not found');
        }

        ticket.set({orderId: undefined});
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
        });

        msg.ack()
    };
}
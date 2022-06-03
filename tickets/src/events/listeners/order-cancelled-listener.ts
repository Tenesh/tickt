import {Message} from 'node-nats-streaming';
import {OrderSubject, Listener, OrderCancelledEvent, BadRequestError} from '@ticketeer/common';

import {Ticket} from '../../models/ticket';
import {queueGroupName} from './queue-group-name';

export class OrderUpdatedListener extends Listener<OrderCancelledEvent> {
    readonly subject = OrderSubject.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const orderId = data.id;
        const ticketId = data.ticket.id;
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            throw new BadRequestError('Ticket not found!');
        }

        // ticket.set({title, price});
        // await ticket.save();

        msg.ack()
    };
}
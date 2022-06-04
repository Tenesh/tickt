import {Message} from 'node-nats-streaming';
import {ExpirationSubject, Listener, ExpirationCompleteEvent, BadRequestError, OrderStatus} from '@ticketeer/common';

import {Ticket} from '../../models/ticket';
import {queueGroupName} from './queue-group-name';
import {Order} from '../../models/order';
import {OrderCancelledPublisher} from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject = ExpirationSubject.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const {orderId} = data;

        const order = await Order.findById(orderId).populate('ticket');

        if (!order) {
            throw new BadRequestError('Order not found');
        }

        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({status: OrderStatus.Cancelled});
        await order.save();

        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });

        msg.ack()
    };
}
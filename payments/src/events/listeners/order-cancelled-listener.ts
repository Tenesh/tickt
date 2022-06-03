import {Message} from 'node-nats-streaming';
import {OrderSubject, Listener, OrderCancelledEvent, BadRequestError, OrderStatus} from '@ticketeer/common';

import {Order} from '../../models/order';
import {queueGroupName} from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = OrderSubject.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        });

        if(!order){
            throw new BadRequestError('Order not found');
        }

        order.set({status: OrderStatus.Cancelled});
        await order.save();

        msg.ack();
    };
}
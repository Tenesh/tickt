import {Message} from 'node-nats-streaming';
import {PaymentSubject, Listener, PaymentCreatedEvent, BadRequestError, OrderStatus} from '@ticketeer/common';

import {Order} from '../../models/order';
import {queueGroupName} from './queue-group-name';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = PaymentSubject.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const {orderId} = data;

        const order = await Order.findById(orderId)

        if (!order) {
            throw new BadRequestError('Order not found');
        }

        order.set({status: OrderStatus.Complete});
        await order.save();

        msg.ack()
    };
}
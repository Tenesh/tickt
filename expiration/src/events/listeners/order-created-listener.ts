import {Message} from 'node-nats-streaming';
import {OrderSubject, Listener, OrderCreatedEvent} from '@ticketeer/common';

import {queueGroupName} from './queue-group-name';


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = OrderSubject.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

        msg.ack()
    };
}
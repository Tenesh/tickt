import {OrderStatus, ExpirationCompleteEvent} from '@ticketeer/common';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';

import {natsWrapper} from '../../../nats-wrapper';
import {Ticket} from '../../../models/ticket';
import {Order} from '../../../models/order';
import {ExpirationCompleteListener} from '../expiration-complete-listener';
import e from 'express';


const setup = async () => {
    // Create instance of listener
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    // Create a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
    })
    await ticket.save();

    // Create an order
    const order = Order.build({
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket
    })
    await order.save();

    // Create fake data event
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    };

    // Create a fake message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, data, msg, ticket, order};
}

it('updates order status to cancelled', async () => {
    const {listener, data, msg, ticket, order} = await setup();

    // Call onMessage function with data object + message object
    await listener.onMessage(data, msg);

    // Update order status
    const updatedOrder = await Order.findById(order.id);

    // Write assertions to make sure order status cancelled
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit orderCancelled event', async () => {
    const {listener, data, msg, ticket, order} = await setup();

    // Call onMessage function with data object + message object
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // Mock nats publish event
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    // Write assertion if orderId published event exists
    expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
    const {listener, data, msg, ticket, order} = await setup();

    // Call onMessage function with data object + message object
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
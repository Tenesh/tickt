import {OrderCancelledEvent, OrderStatus} from '@ticketeer/common';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';

import {natsWrapper} from '../../../nats-wrapper';
import {OrderCancelledListener} from '../order-cancelled-listener';
import {Ticket} from '../../../models/ticket';


const setup = async () => {
    // Create instance of listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // Create and save a ticket
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        userId: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
    })
    ticket.set({orderId});
    await ticket.save();


    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        }
    }

    // Create a fake message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, data, msg, ticket};
}

it('updates ticket when order cancelled', async () => {
    const {listener, data, msg, ticket} = await setup();

    // Call onMessage function with data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure ticket created
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).toEqual(undefined);
});

it('acks the message', async () => {
    const {listener, data, msg} = await setup();

    // Call onMessage function with data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure acks called
    expect(msg.ack).toHaveBeenCalled();
});

it('it publishers a ticket updated event', async () => {
    const {listener, data, msg} = await setup();

    // Call onMessage function with data object + message object
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
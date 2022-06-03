import {OrderCreatedEvent, OrderStatus} from '@ticketeer/common';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';

import {natsWrapper} from '../../../nats-wrapper';
import {OrderCreatedListener} from '../order-created-listener';
import {Ticket} from '../../../models/ticket';


const setup = async () => {
    // Create instance of listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        userId: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
    })
    await ticket.save();


    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: ticket.userId,
        status: OrderStatus.Created,
        expiresAt: 'random',
        ticket: {
            id: ticket.id,
            price: ticket.price,
        }
    }

    // Create a fake message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, data, msg, ticket};
}

it('sets the orderId of the ticket', async () => {
    const {listener, data, msg, ticket} = await setup();

    // Call onMessage function with data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure ticket created
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const {listener, data, msg} = await setup();

    // Call onMessage function with data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure acks called
    expect(msg.ack).toHaveBeenCalled();
});
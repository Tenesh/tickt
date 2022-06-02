import {TicketUpdatedEvent} from '@ticketeer/common';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';

import {natsWrapper} from '../../../nats-wrapper';
import {TicketUpdatedListener} from '../ticket-updated-listener';
import {Ticket} from '../../../models/ticket';
import exp from 'constants';


const setup = async () => {
    // Create instance of listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
    })
    await ticket.save();

    const data: TicketUpdatedEvent['data'] = {
        version: ticket.version + 1,
        id: ticket.id,
        title: 'concertsssss',
        price: 222,
        userId: new mongoose.Types.ObjectId().toHexString(),
    };

    // Create a fake message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, data, msg, ticket};
}

it('find,updates and saves ticket', async () => {
    const {listener, data, msg, ticket} = await setup();

    // Call onMessage function with data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure ticket created
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const {listener, data, msg} = await setup();

    // Call onMessage function with data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure acks called
    expect(msg.ack).toHaveBeenCalled();
});

it('does not call acks if the event has skipped version number', async () => {
    const {listener, data, msg, ticket} = await setup();

    data.version = 10;

    // Call onMessage function with data object + message object and Throw error
    await expect(listener.onMessage(data, msg)).rejects.toThrow();

    // Write assertions to make sure acks called
    expect(msg.ack).not.toHaveBeenCalled();
});
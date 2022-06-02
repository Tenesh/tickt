import request from 'supertest';

jest.mock('../../nats-wrapper');

import {app} from '../../app';
import {Ticket} from '../../models/ticket';
import mongoose from 'mongoose';

const buildTicket = async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    return ticket;
}

it('fetches order by requested user', async () => {
    // Create ticket
    const ticket = await buildTicket();

    // Create users cookie
    const user = global.signin();

    // Create one order
    const {body:{order}} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    // Create request for the order by user
    const response = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(response.body.order.id).toEqual(order.id);
})

it('returns error if other user request order not owned', async () => {
    // Create ticket
    const ticket = await buildTicket();

    // Create users cookie
    const userOne = global.signin();
    const userTwo = global.signin();

    // Create one order for User #1
    const {body:{order}} = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    // Create request for order by User #2
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', userTwo)
        .send()
        .expect(401);
})
import request from 'supertest';

jest.mock('../../nats-wrapper');

import {app} from '../../app';
import {Order} from '../../models/order';
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

it('fetches orders for particular user', async () => {
    // Create three tickets
    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();

    // Create users cookie
    const userOne = global.signin();
    const userTwo = global.signin();

    // Create one order as User #1
    await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({
            ticketId: ticketOne.id
        })
        .expect(201);

    // Create two orders as User #2
    const {body:{order: orderTwo}} = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({
            ticketId: ticketTwo.id
        })
        .expect(201);

    const {body:{order: orderThree}} = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({
            ticketId: ticketThree.id
        })
        .expect(201);

    // Make request to get orders for User #2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .send()
        .expect(200);

    // Make sure only got the orders for User #2
    expect(response.body.orders[0].id).toEqual(orderTwo.id);
    expect(response.body.orders[1].id).toEqual(orderThree.id);
})
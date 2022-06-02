import request from 'supertest';

jest.mock('../../nats-wrapper');

import {app} from '../../app';
import {Ticket} from '../../models/ticket';
import {natsWrapper} from '../../nats-wrapper';

const buildTicket = async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20
    });
    await ticket.save();

    return ticket;
}

it('marks an order as cancelled', async () => {
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

    // Cancels the order
    await request(app)
        .patch(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);
});

it('publishes an event', async () =>{
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

    // Cancels the order
    await request(app)
        .patch(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
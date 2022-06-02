import request from 'supertest';
import mongoose from 'mongoose';

import {app} from '../../app';
import {natsWrapper} from '../../nats-wrapper';

const title = 'Concert';
const price = 20;

it('returns 404 if ticket not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: title,
            price: price
        })
        .expect(404);
})

it('can only be accessed if user is signed in', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: title,
            price: price
        })
        .expect(401);
})

it('returns 401 if the user does not own the ticket', async () => {
    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', global.signin())
        .send({
            title: title,
            price: price
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: title,
            price: price
        })
        .expect(401);
})

it('returns 400 if the user provide invalid title or price', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({
            title: title,
            price: price
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: -20
        })
        .expect(400);
})

it('returns ticket if the user provide valid parameters and owner of the ticket', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({
            title: title,
            price: price
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'New Title',
            price: 700
        })
        .expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticketResponse.body.title).toEqual('New Title');
    expect(ticketResponse.body.price).toEqual(700);
})

it('publishes an event', async () =>{
    const cookie = global.signin();

    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({
            title: title,
            price: price
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'New Title',
            price: 700
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
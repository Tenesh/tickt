import request from 'supertest';
import {app} from '../../app';
import {Ticket} from '../../models/ticket';

it('has a route handler listening to /api/tickets for POST requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});
    expect(response.statusCode).not.toEqual(404);
})

it('can only be accessed if user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});
    expect(response.statusCode).toEqual(401);
})

it('returns a status other than 401 if user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({});
    expect(response.statusCode).not.toEqual(401);
})

it('returns an error if an invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '',
            price: 10
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            price: 10
        })
        .expect(400);
})

it('returns an error if an invalid price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'MJ Concert',
            price: -10
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'MJ Concert'
        })
        .expect(400);
})

it('creates a ticket with valid parameters', async () => {
    let tickets = await Ticket.find({});

    expect(tickets.length).toEqual(0);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'MJ Concert',
            price: 10
        })
        .expect(201);

    tickets = await Ticket.find({});

    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual('MJ Concert');
    expect(tickets[0].price).toEqual(10);
})
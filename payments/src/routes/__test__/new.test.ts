import request from 'supertest';

import {app} from '../../app';
import mongoose from 'mongoose';
import {Order} from '../../models/order';
import {Payment} from '../../models/payment';
import {OrderStatus} from '@ticketeer/common';
import {stripe} from '../../../stripe';


it('returns a 404 when purchasing if order not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'random',
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('returns a 401 when purchasing order not belong to user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
        price: 10
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'random',
            orderId: order.id
        })
        .expect(401);
});

it('returns a 400 when purchasing cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString()

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        status: OrderStatus.Cancelled,
        version: 0,
        price: 10
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'random',
            orderId: order.id
        })
        .expect(400);
});

jest.setTimeout(1000000);

it('returns a 201 with valid inputs when purchasing success', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString()
    const price = Math.floor(Math.random()*1000);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        status: OrderStatus.Created,
        version: 0,
        price: price
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);

    const charges = await stripe.charges.list({limit: 3});
    const charge = charges.data.find(charge=>{
        return charge.amount === price *100
    })

    expect(charge).toBeDefined();

    const payment = Payment.findOne({stripeId: charge!.id, orderId: order.id});

    expect(payment).not.toBeNull();
});
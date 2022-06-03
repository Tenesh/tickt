import express, {Request, Response} from 'express';
import {NotAuthorizedError, NotFoundError, requireAuth, OrderStatus} from '@ticketeer/common';

import {natsWrapper} from '../nats-wrapper';
import {Order} from '../models/order';
import {OrderCancelledPublisher} from '../events/publishers/order-cancelled-publisher';

const router = express.Router();

router.patch('/api/orders/:orderId', requireAuth,
    async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
        const order = await Order.findById(orderId).populate('ticket');

        if(!order){
            throw new NotFoundError();
        }

        if(order.userId !== req.currentUser!.id){
            throw new NotAuthorizedError();
        }

        order.status = OrderStatus.Cancelled;
        await order.save();

        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            }
        });

        res.status(200).send({order});
    });

export {router as updateOrderRouter}
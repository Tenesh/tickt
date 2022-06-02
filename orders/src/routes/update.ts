import express, {Request, Response} from 'express';
import {Order} from '../models/order';

import {NotAuthorizedError, NotFoundError, requireAuth, OrderStatus} from '@ticketeer/common';

const router = express.Router();

router.patch('/api/orders/:orderId', requireAuth,
    async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
        const order = await Order.findById(orderId);

        if(!order){
            throw new NotFoundError();
        }

        if(order.userId !== req.currentUser!.id){
            throw new NotAuthorizedError();
        }

        order.status = OrderStatus.Cancelled;
        await order.save();

        res.status(200).send({order});
    });

export {router as updateOrderRouter}
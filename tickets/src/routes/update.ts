import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import {NotFoundError, validateRequest, NotAuthorizedError, requireAuth} from '@ticketeer/common';

import {Ticket} from '../models/ticket';
import {TicketUpdatedPublisher} from '../events/publishers/ticket-updated-publisher';
import {natsWrapper} from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', requireAuth,
    [
        body('title')
            .not()
            .isEmpty()
            .withMessage('Title is required'),
        body('price')
            .isFloat({gt: 0})
            .withMessage('Price must be greater than 0')
    ], validateRequest,
    async (req: Request, res: Response) => {
        const ticketId = req.params.id;

        const ticket = await Ticket.findById(ticketId);

        if(!ticket){
            throw new NotFoundError();
        }

        if(req.currentUser!.id !== ticket.userId){
            throw new NotAuthorizedError();
        }

        ticket.set({title: req.body.title, price: req.body.price});
        await ticket.save();

        new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId
        });

        res.status(201).send(ticket);
    });

export {router as updateTicketRouter}
import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import {NotFoundError, validateRequest, NotAuthorizedError, requireAuth} from '@ticketeer/common';

import {Ticket} from '../models/ticket';

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

        res.status(201).send(ticket);
    });

export {router as updateTicketRouter}
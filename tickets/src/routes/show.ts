import express, {Request, Response} from 'express';
import {NotFoundError} from '@ticketeer/common';

import {Ticket} from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:ticketId',
    async (req: Request, res: Response) => {
        const ticketId = req.params.ticketId;

        const ticket = await Ticket.findById(ticketId);

        if(!ticket){
            throw new NotFoundError();
        }

        res.status(200).send(ticket);
    });

export {router as showTicketRouter}
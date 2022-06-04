import Image from 'next/image'
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const TicketShow = ({ticket}) => {
    const {doRequest, errors} = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id
        },

        onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`),
    });

    return (
        <div className="container">
            <h1 className=""></h1>
            <div className="card" style={{width: '18rem'}}>
                <div className="card-body">
                    <Image src="/ticket.png" className="card-img-top" alt="Ticket" width="250" height="160"/>
                    <h5 className="card-title">{ticket.title}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">{ticket.price}</h6>
                </div>
            </div>
            <button className="btn btn-primary mt-2" onClick={() => doRequest()}>Purchase</button>
            {errors}
        </div>
    );
}

TicketShow.getInitialProps = async (context, client) => {
    const {ticketId} = context.query;
    const {data} = await client.get(`/api/tickets/${ticketId}`);

    return {ticket: data};
};

export default TicketShow;
import Link from 'next/link';

const LandingPage = ({currentUser, tickets}) => {
    let row = 0
    const ticketList = tickets.map(ticket => {
        row++
        return (
            <tr key={ticket.id}>
                <th scope="row">{row}</th>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td><Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>View</Link></td>
            </tr>
        );
    })
    return (
        <div className="container">
            <h1 className="">Tickets</h1>
            <div className="">
                <table className="table table-hover">
                    <thead>
                    <tr>
                        <th scope="col"></th>
                        <th scope="col">Title</th>
                        <th scope="col">Price</th>
                        <th scope="col">Link</th>
                    </tr>
                    </thead>
                    <tbody>
                    {ticketList}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
    const {data} = await client.get('/api/tickets');
    return {tickets: data}
};

export default LandingPage;
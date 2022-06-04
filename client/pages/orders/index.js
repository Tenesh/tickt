import Link from 'next/link';

const OrderIndex = ({orders}) => {
    let row = 0
    const orderList = orders.map(order => {
        row++
        return (
            <tr key={order.id}>
                <th scope="row">{row}</th>
                <td>{order.ticket.title}</td>
                <td>{order.price}</td>
                <td>{order.status}</td>
                <td><Link href="/orders/[orderId]" as={`/orders/${order.id}`}>View</Link></td>
            </tr>
        );
    })
    return (
        <div className="container">
            <h1 className="">Orders</h1>
            <div className="">
                <table className="table table-hover">
                    <thead>
                    <tr>
                        <th scope="col"></th>
                        <th scope="col">Title</th>
                        <th scope="col">Price</th>
                        <th scope="col">Status</th>
                        <th scope="col">Link</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orderList}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

OrderIndex.getInitialProps = async (context, client) => {
    const {data} = await client.get('/api/orders');
    return {orders: data}
};

export default OrderIndex;
import {useState} from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const NewTicket = () => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');

    const onBlur = () => {
        const value = parseFloat(price);
        if (isNaN(value)) {
            return;
        }

        setPrice(value.toFixed(2));
    }

    const {doRequest, errors} = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
            title, price
        },
        onSuccess:()=> Router.push('/')
    });

    const onSubmit = (event) => {
        event.preventDefault();
        doRequest();
    };

    return (
        <div className="container">
            <h1 className="">Create a new ticket</h1>
            <form className="form-group" onSubmit={onSubmit}>
                <div className="mb-3">
                    <label htmlFor="" className="form-label">Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="form-control"/>
                </div>
                <div className="mb-3">
                    <label htmlFor="" className="form-label">Price</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="form-control"
                           onBlur={onBlur}/>
                </div>
                <button className="btn btn-primary">Submit</button>
            </form>

            {errors}
        </div>
    );
}

export default NewTicket;


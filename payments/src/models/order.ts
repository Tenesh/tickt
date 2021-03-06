import mongoose from 'mongoose';
import {OrderStatus} from '@ticketeer/common';
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';

// Interface for new order creation.
interface OrderAttrs {
    id: string;
    status: OrderStatus;
    userId: string;
    price: number;
    version: number;
}

// Interface for Order Model
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

// Interface for Order Document
interface OrderDoc extends mongoose.Document {
    status: OrderStatus;
    userId: string;
    price: number;
    version: number;
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        price: attrs.price,
        userId: attrs.userId,
        status: attrs.status,
    });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);


export {Order};
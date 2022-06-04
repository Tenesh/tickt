import mongoose from 'mongoose';
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';


// Interface for new payment creation.
interface PaymentAttrs {
    orderId: string,
    stripeId: string,
    userId: string,
    amount: number
}

// Interface for Payment Model
interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc;
}

// Interface for Payment Document
interface PaymentDoc extends mongoose.Document {
    orderId: string,
    stripeId: string,
    userId: string,
    amount: number,
    version: number
}

const paymentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    stripeId: {
        type: String,
        required: true
    },
    amount: {
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

paymentSchema.set('versionKey', 'version');
paymentSchema.plugin(updateIfCurrentPlugin);

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);


export {Payment};
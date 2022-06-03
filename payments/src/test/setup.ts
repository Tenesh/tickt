import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY = 'sk_test_51EeinOB4S61higoGdRG8X9TDp6VRHXt53GsQHiKmlEa1sjYDHV3DPAbIynn0D31dQ8TZQJkSCN5J1V6mSLAX17ob00AzoqBmqk';

let mongo: any;

declare global {
    var signin: (id?:string) => string[];
}

beforeAll(async () => {
    process.env.JWT_KEY = 'privatekey';
    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
})

global.signin = (id?: string) => {
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    };

    const token = jwt.sign(payload, process.env.JWT_KEY!);
    const session = {jwt: token}
    const sessionJSON = JSON.stringify(session);
    const base64 = Buffer.from(sessionJSON).toString('base64');

    return [`session=${base64}`];
};
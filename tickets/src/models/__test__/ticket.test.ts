import {Ticket} from '../ticket';

it('implements OCC', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '123'
    })
    await ticket.save()

    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    firstInstance!.set({price: 10});
    secondInstance!.set({price: 15});

    // save the first fetched ticket
    await firstInstance!.save();

    // save the second fetched ticket and expect an error
    expect.assertions(1); // expect to get into the catch
    try {
        await secondInstance!.save();
    } catch (err) {
        expect(err).toBeDefined();
    }
});

it('implements version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '123'
    })
    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);

});
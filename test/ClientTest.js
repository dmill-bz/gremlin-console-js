import Client from '../src/DriverClient.js';

describe('DriverClient.construct()', () => {
    it('should create a client with default options', () => {
        const client = new Client();
        console.log(client);
        client.should.be.a('Object');
        client.client.should.be.a('Object');
        should.exist(client.client);

        client.client.port.should.equal(8182);
        client.client.host.should.equal('localhost');
    });

    it('should allow setting the `port` option', () => {
        const client = new Client("localhost", 8183);
        client.client.port.should.equal(8183);
    });

    it('should allow setting the `host` option', () => {
        const client = new Client("otherhost", 8182);
        client.client.host.should.equal('otherhost');
    });

    it('should allow setting the driver options', () => {
        const client = new Client("localhost", 8182, {op:'test'});
        client.client.options.op.should.equal('test');
    });
});


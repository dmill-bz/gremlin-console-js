import Client from '../src/DriverClient';
import Parser from '../src/Parser';

describe('DriverClient', () => {
    describe('.construct()', () => {

        it('should allow setting the `port` option', () => {
            const client = new Client("localhost", 8183, {});
            client.client.on('error', (err) => {}); //catch error
            client.client.port.should.equal(8183);
        });

        it('should allow setting the `host` option', () => {
            const client = new Client("otherhost", 8182);
            client.client.on('error', (err) => {}); //catch error
            client.client.host.should.equal('otherhost');
        });

        it('should allow setting the `parser` option', () => {
            const parser = new Parser('lala', 'lolo');
            const client = new Client("localhost", 8182, {}, parser);
            client.parser._rawResults.should.equal('lolo');
            client.parser._rawError.should.equal('lala');
        });

        it('should allow setting the driver options', () => {
            const client = new Client("localhost", 8182, {op:'test'});
            client.client.options.op.should.equal('test');
        });
    });

    describe('.execute()', () => {

        it('should execute correctly with: query + callback', () => {
            const client = new Client();
            client.execute("5+5", () => {});
        });

        it('should execute correctly with: query + bindings + callback', () => {
            const client = new Client();
            client.execute("5+variable", {variable:5}, () => {});
        });

        it('callback should receive Parser object', (done) => {
            const client = new Client();
            client.execute("5+5", (parser) => {
                parser.constructor.name.should.equal('Parser');
                parser._rawResults[0].should.equals(10);
                done();
            });
        });

        it('should return the right data with bindings', (done) => {
            const client = new Client();
            client.execute("5+variable", {variable:5}, (parser) => {
                parser._rawResults[0].should.equals(10);
                done();
            });
        });
    });
});

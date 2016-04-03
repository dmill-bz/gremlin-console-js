import Console from '../src/Console.js';

beforeEach(() => {
    document.body.innerHTML = __html__['test/index.html'];
});


describe('Console', () => {
    describe('.construct()', () => {
        it('should create a console with default params', () => {
            const gc = new Console("#window", "#input");

            expect(gc.options).to.eql({
                port: 8182,
                host: 'localhost',
                history: [],
                driverOptions: {
                    session: true
                },
                visualizerOptions: {
                }
            });
            expect(gc.history).to.eql([]);
            gc.historyPointer.should.eql(0);
        });

        it('should create a console with custom options', () => {
                const options = {
                    port: 8183,
                    host: 'otherhost',
                    history: [],
                    driverOptions: {
                        session: false
                    },
                    visualizerOptions: {
                    }
                };
                const gc = new Console("#window", "#input", options);

                expect(gc.options).to.eql(options);
        });

        it('should create a console with the correct client', () => {

                const gc = new Console("#window", "#input", {
                    port: 8183,
                    host: 'otherhost',
                    history: [],
                    driverOptions: {
                        session: false
                    },
                    visualizerOptions: {
                    }
                });

                gc.client.constructor.name.should.equal('DriverClient');
                gc.client.client.constructor.name.should.equal('GremlinClient');
                gc.client.client.port.should.eql(8183);
                gc.client.client.host.should.eql("otherhost");
        });

        it('should create a console and populate history if provided', () => {

                const gc = new Console("#window", "#input", {history: [
                    {query:"g = Tinkerfactory.createModern().traversal()", results: ["meep"], error:null},
                    {query:"g.V()", results: ["moop"], error:null}
                ]});

                gc.client.constructor.name.should.equal('DriverClient');
                console.log(gc.history);
                expect(gc.history).to.have.lengthOf(2);
                gc.historyPointer.should.eql(2);
        });
    });
});

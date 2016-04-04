import Console from '../src/Console.js';
import Result from '../src/Result.js';
import $ from 'jquery';

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
                gc.on('error', (err) => {}); //catch error
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
                gc.on('error', (err) => {}); //catch error

                gc.client.constructor.name.should.equal('DriverClient');
                gc.client.client.constructor.name.should.equal('GremlinClient');
                gc.client.client.port.should.eql(8183);
                gc.client.client.host.should.eql("otherhost");
        });

        it('should create a console and populate history if provided', () => {

                const gc = new Console("#window", "#input", {history: [
                    {query:"g = TinkerFactory.createModern().traversal()", results: ["meep"], error:null},
                    {query:"g.V()", results: ["moop"], error:null}
                ]});
                setTimeout(() => {
                    gc.client.constructor.name.should.equal('DriverClient');
                    expect(gc.history).to.have.lengthOf(2);
                    gc.historyPointer.should.eql(2);
                }, 3000);
        });

        it('should create a console and throw error if history is eronous', (done) => {
                const spy = sinon.spy();
                const gc = new Console("#window", "#input", {history: [
                    {query:"g = doesnotexist()", results: ["meep"], error:null},
                    {query:"g.V()", results: ["moop"], error:null}
                ]});

                gc.on('error', (err) => {console.log(err);done();}); //catch error
        });

        it('should create a console and populate window if history provided', (done) => {
                const window = $("#window");
                const response = '<div class="port-section"><div class="port-query">gremlin&gt; g = TinkerFactory.createModern().traversal()</div><div class="port-response json">meep<br></div></div><div class="port-section"><div class="port-query">gremlin&gt; g.V().has(\'name\', \'marko\')</div><div class="port-response json">{<span class="key">"id":</span> <span class="number">1</span>,<span class="key">"label":</span> <span class="string">"person"</span>,<span class="key">"type":</span> <span class="string">"vertex"</span>,<span class="key">"properties":</span> {<span class="key">"name":</span> [{<span class="key">"id":</span> <span class="number">0</span>,<span class="key">"value":</span> <span class="string">"marko"</span>}],<span class="key">"age":</span> [{<span class="key">"id":</span> <span class="number">1</span>,<span class="key">"value":</span> <span class="number">29</span>}]}}<br></div></div>';
                const spy = sinon.spy();
                const gc = new Console(window, "#input", {history: [
                    {query:"g = TinkerFactory.createModern().traversal()", results: ["meep"], error:null},
                    {query:"g.V().has('name', 'marko')", results: ["moop"], error:null}
                ]});
                gc.on('results', (query, result) => {
                    window.html().replace(/\n */g, '').should.eql(response);
                    done();
                });
        });

        it('should create from jquery DOM elements', () => {
            const gc = new Console($("#window"), $("#input"));
        });

        it('should create handler for submit (enter)', (done) => {
            const input = $('#input');
            const spy = sinon.spy();
            const gc = new Console("#window", input);
            gc.on('results', (query, result) => {
                spy();
                query.should.eql("5+5");
                result._rawResults[0].should.eql(10);
                assert.isOk(spy.called, "spy wasn't called");
                done();
            });

            input.val("5+5");
            const e = $.Event("keypress");
            e.which = 13;
            input.trigger(e);
        });

        it('should create handler for history navigation (up/down arrows)', () => {
            const input = $('#input');
            const spy = sinon.spy();
            //add history for testing
            const gc = new Console("#window", input, {history: [
                    {query:"g = TinkerFactory.createModern().traversal()", results: ["meep"], error:null},
                    {query:"g.V()", results: ["moop"], error:null}
                ]});

            const e = $.Event("keydown");
            e.which = 38; //up
            input.trigger(e);
            input.val().should.eql('g.V()');
            e.which = 38; //up
            input.trigger(e);
            input.val().should.eql('g = TinkerFactory.createModern().traversal()');
            e.which = 38; //up
            input.trigger(e);
            input.val().should.eql('g = TinkerFactory.createModern().traversal()'); //going up further shouldn't change content
            e.which = 40; //down
            input.trigger(e);
            input.val().should.eql('g.V()');
            e.which = 40; //down
            input.trigger(e);
            input.val().should.eql('');
            e.which = 40; //down
            input.trigger(e);
            input.val().should.eql('');
            e.which = 40; //down
            input.trigger(e);
            input.val().should.eql('');
            e.which = 38; //up
            input.trigger(e);
            input.val().should.eql('g.V()');
        });
    });

    describe('._addTyping()', () => {
        it('should generate a string with typing', () => {
            const gc = new Console("#window", "#input");
            const typed = gc._addTyping("v1=graph.addEdge();graph = something; g = \"this is a test; lala = thing\";meep = something;");
            typed.should.eql("def v1=graph.addEdge();graph = something; g = \"this is a test; lala = thing\";def meep = something;");
        });
    });


    describe('.executeQuery()', () => {
        it('should execute a query', () => {
            const gc = new Console("#window", "#input");
            gc.executeQuery("5+5");
        });

        it('should run an event once finished', (done) => {
            const gc = new Console("#window", "#input");
            const spy = sinon.spy();
            gc.on('results', (query, result) => {
                spy();
                assert.isOk(spy.called, "spy wasn't called");
                done();
            });

            gc.executeQuery("5+5");

        });

        it('should provide a correct query and Result', (done) => {
            const gc = new Console("#window", "#input");
            gc.on('results', (query, result) => {
                query.should.eql('5+5');
                result._rawResults[0].should.eql(10);
                done();
            });

            gc.executeQuery("5+5");

        });
    });

    describe('.handleResults()', () => {
        it('should populate the window with results', () => {
            const window = $("#window");
            const gc = new Console(window, "#input");
            gc.handleResults('5+5', new Result(null, [10]));
            window.html().should.eql('<div class="port-section"><div class="port-query">gremlin&gt; 5+5</div><div class="port-response json"><span class="number">10</span><br></div></div>');
            //check appending behavior by issuing another result
            gc.handleResults('5+15', new Result(null, [20]));
            window.html().should.eql('<div class="port-section"><div class="port-query">gremlin&gt; 5+5</div><div class="port-response json"><span class="number">10</span><br></div></div><div class="port-section"><div class="port-query">gremlin&gt; 5+15</div><div class="port-response json"><span class="number">20</span><br></div></div>');
        });

        it('should populate the window with error', () => {
            const window = $("#window");
            const gc = new Console(window, "#input");
            gc.handleResults('somethingCrazy', new Result({message: "an error occured"}, null));
            window.html().should.eql('<div class="port-section"><div class="port-query">gremlin&gt; somethingCrazy</div><div class="port-error">Could not complete query =&gt; an error occured</div></div>');
            //check appending behavior by issuing another result
            gc.handleResults('somethingCrazyAgain', new Result({message: "an other error occured"}, null));
            window.html().should.eql('<div class="port-section"><div class="port-query">gremlin&gt; somethingCrazy</div><div class="port-error">Could not complete query =&gt; an error occured</div></div><div class="port-section"><div class="port-query">gremlin&gt; somethingCrazyAgain</div><div class="port-error">Could not complete query =&gt; an other error occured</div></div>');
        });
    });

    describe('._getElement()', () => {
        it('should return a DOM object when given a selector', () => {
            const window = new Console._getElement("#window");
            window[0].constructor.name.should.eql('HTMLDivElement');
            window.attr('id').should.eql('window');
        });

        it('should return a DOM object when given a jquery object', () => {
            const window = new Console._getElement($("#window"));
            window[0].constructor.name.should.eql('HTMLDivElement');
            window.attr('id').should.eql('window');
        });
    });

    describe('.register()', () => {
        it('should run the plugin\'s .load()', () => {
            const spy = sinon.spy();
            class StubPlugin {
                load(a) {
                    a.constructor.name.should.eql('Console');
                    spy();
                }
            }
            const gc = new Console("#window", "#input");
            gc.register(new StubPlugin());
            assert.isOk(spy.called, "spy wasn't called");
        });
    });
});

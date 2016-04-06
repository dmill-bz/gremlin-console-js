import Parser from '../src/Parser';

describe('Parser', () => {
    describe('.constructor()', () => {
        it('should populate properties correctly', () => {
            const parser = new Parser({message:"error message"}, ["result"]);
            expect(parser._rawError).to.eql({message:"error message"});
            expect(parser._rawResults).to.eql(["result"]);
        });

        it('should allow for an empty constructor', () => {
            const parser = new Parser();
            expect(parser._rawError).to.be.undefined;
            expect(parser._rawResults).to.be.undefined;
        });
    });

    describe('.getRawError()', () => {
        it('should return the proper data', () => {
            const parser = new Parser({message:"error message"}, ["result"]);
            expect(parser.getRawError()).to.eql({message:"error message"});
        });
    });

    describe('.getError()', () => {
        it('should return the proper data', () => {
            const parser = new Parser({message:"error message"}, ["result"]);
            expect(parser.getError()).to.eql({message:"error message"});
        });
    });

    describe('.getHtmlError()', () => {
        it('should return the error wrapped in a jquery element', () => {
            const parser = new Parser({message:"error message"}, ["result"]);
            const htmlError = parser.getHtmlError();
            htmlError[0].constructor.name.should.eql('HTMLDivElement');
            htmlError.attr('class').should.eql('port-error');
            htmlError.html().should.eql('Could not complete query =&gt; error message');
        });
    });

    describe('.getRawResults()', () => {
        it('should return the proper data', () => {
            const parser = new Parser({message:"error message"}, ["result"]);
            expect(parser.getRawResults()).to.eql(["result"]);
        });
    });

    describe('.getResults()', () => {
        it('should return the proper data', () => {
            const parser = new Parser({message:"error message"}, ["result"]);
            expect(parser.getResults()).to.eql(["result"]);
        });
    });

    describe('.getHtmlResults()', () => {
        it('should return the error wrapped in a jquery element', () => {
            const parser = new Parser({message:"error message"}, [{"key" : "result>"}]);
            const htmlResults = parser.getHtmlResults();
            htmlResults[0].constructor.name.should.eql('HTMLDivElement');
            htmlResults.attr('class').should.eql('port-response json');
            htmlResults.html().replace(/\n */g,'').should.eql('{<span class="key">"key":</span> <span class="string">"result&gt;"</span>}<br>');
        });
    });

    describe('.create()', () => {
        it('should return a Parser', () => {
            const parserOriginal = new Parser();
            const parser = parserOriginal.create({message:"error message"}, ["result"]);
            expect(parser._rawError).to.eql({message:"error message"});
            expect(parser._rawResults).to.eql(["result"]);
        });
    });
});

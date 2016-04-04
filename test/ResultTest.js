import Result from '../src/Result';

describe('Result', () => {
    describe('.constructor()', () => {
        it('should populate properties correctly', () => {
            const result = new Result({message:"error message"}, ["result"]);
            expect(result._rawError).to.eql({message:"error message"});
            expect(result._rawResults).to.eql(["result"]);
        });
    });

    describe('.getRawError()', () => {
        it('should return the proper data', () => {
            const result = new Result({message:"error message"}, ["result"]);
            expect(result.getRawError()).to.eql({message:"error message"});
        });
    });

    describe('.getError()', () => {
        it('should return the proper data', () => {
            const result = new Result({message:"error message"}, ["result"]);
            expect(result.getError()).to.eql({message:"error message"});
        });
    });

    describe('.getHtmlError()', () => {
        it('should return the error wrapped in a jquery element', () => {
            const result = new Result({message:"error message"}, ["result"]);
            const htmlError = result.getHtmlError();
            htmlError[0].constructor.name.should.eql('HTMLDivElement');
            htmlError.attr('class').should.eql('port-error');
            htmlError.html().should.eql('Could not complete query =&gt; error message');
        });
    });

    describe('.getRawResults()', () => {
        it('should return the proper data', () => {
            const result = new Result({message:"error message"}, ["result"]);
            expect(result.getRawResults()).to.eql(["result"]);
        });
    });

    describe('.getResults()', () => {
        it('should return the proper data', () => {
            const result = new Result({message:"error message"}, ["result"]);
            expect(result.getResults()).to.eql(["result"]);
        });
    });

    describe('.getHtmlResults()', () => {
        it('should return the error wrapped in a jquery element', () => {
            const result = new Result({message:"error message"}, [{"key" : "result>"}]);
            const htmlResults = result.getHtmlResults();
            htmlResults[0].constructor.name.should.eql('HTMLDivElement');
            htmlResults.attr('class').should.eql('port-response json');
            htmlResults.html().replace(/\n */g,'').should.eql('{<span class="key">"key":</span> <span class="string">"result&gt;"</span>}<br>');
        });
    });
});

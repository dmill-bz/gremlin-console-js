import Html from '../src/Html';

describe('Html', () => {
    describe('.htmlEncode()', () => {
        it('should return an encoded string', () => {
            const encoded = Html.htmlEncode('<tag>should be encoded</tag>');
            encoded.should.equal('&lt;tag&gt;should be encoded&lt;/tag&gt;');
        });
    });

    describe('.jsonSyntaxHighlight()', () => {
        const json = {"bookname": "VB BLACK BOOK", "price": 500 , "bool": false, "null": null, "float": 78.56};
        const expected = '{\n  <span class="key">"bookname":</span> <span class="string">"VB BLACK BOOK"</span>,\n  <span class="key">"price":</span> <span class="number">500</span>,\n  <span class="key">"bool":</span> <span class="boolean">false</span>,\n  <span class="key">"null":</span> <span class="null">null</span>,\n  <span class="key">"float":</span> <span class="number">78.56</span>\n}';
        it('should return a highlighted string from a json object', () => {
            const highlighted = Html.jsonSyntaxHighlight(json);
            highlighted.should.equal(expected);
        });
        it('should return a highlighted string from a json string', () => {
            const highlighted = Html.jsonSyntaxHighlight(JSON.stringify(json, undefined, 2));
             highlighted.should.equal(expected);
        });
    });
});

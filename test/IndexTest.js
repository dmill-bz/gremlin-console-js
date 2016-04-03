import create from '../src/index.js';

describe('index.js .create()', () => {
    it('should create a client with default options', () => {
        document.body.innerHTML = __html__['test/index.html'];
        const client = create("#window", "#input");

        client.constructor.name.should.equal('Console');
    });
});

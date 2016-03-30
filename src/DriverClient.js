let GremlinDriver = require( 'gremlin');
import Result from './Result';

/**
 * This is a client class that connects to gremlin-server directly
 *
 * @author Dylan Millikin <dylan.millikin@gmail.com>
 * @link https://github.com/jbmusso/gremlin-javascript
 */
class DriverClient {
    /**
     * @var {GremlinClient} see jbmusso/gremlin-javascript
     */
    client;

    /**
     * Create the client
     *
     * @param  {String}  host    the host name / ip
     * @param  {Integer} port    the port number for the client to connect to
     * @param  {Object}  options the driver options as per defined in the driver documentation
     * @return void
     */
    constructor(host = "localhost", port = 8182, options = {}) {
        this.client = GremlinDriver.createClient(host, port, options);
    }

    /**
     * Run a query with various params.
     * Bellow are the three expected params. optionals can be ommitted and interchanged
     *
     * @param  {String}   query    mandatory: the gremlin query to run
     * @param  {Object}   bindings optional: the bindings associated to this query
     * @param  {Function} callback optional: function that executes once the results are received.
     * @return {Void}
     */
    execute(query, bindings, callback) {
        if(typeof bindings === 'function') {
            callback = bindings;
            bindings = undefined;
        }

        //customize the callback params to use Result
        const customCallback = (err, results) => {
            callback(new Result(err, results));
        };
        this.client.execute(query, bindings, customCallback);
    }
}

export default DriverClient;

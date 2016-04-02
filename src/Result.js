import $ from 'jquery';
import Html from './Html';

/**
 * Handles logic related to results sent back to the console
 * These can be custom crafted to suit different server outputs.
 * Either because of a custom serializer or if a call is made to a server side script.
 * It also allows for a change in the way the elements are displayed in html and how the history entries are generated
 *
 * @author Dylan Millikin <dylan.millikin@gmail.com>
 */
class Result {
    /**
     * @var {Mixed} holds the raw server results
     */
    _rawResults;

    /**
     * @var {Mixed} holds the raw server results
     */
    _rawError;

    /**
     * Constructor takes a server response and holds onto it until it is required
     *
     * @param  {Mixed} results the server results for a query
     * @return {Void}
     */
    constructor(err, results) {
        this._rawResults = results;
        this._rawError = err;
    }

    /**
     * Get the raw result data
     *
     * @return {Mixed} raw server results
     */
    getRawResults() {
        return this._rawResults;
    }

    /**
     * Get the raw error info
     *
     * @return {Mixed} raw error
     */
    getRawError() {
        return this._rawError;
    }

    /**
     * Get generic results.
     * These results are constructed in a way the console can comprehend them.
     * Extend this if you're receiving non conventional data from the server
     *
     * @return {Mixed} raw server results
     */
    getResults() {
        return this.getRawResults();
    }

    /**
     * Get the raw error info
     * These results are constructed in a way the console can comprehend them.
     * Extend this if you're receiving non conventional data from the server
     *
     * @return {Mixed} raw error
     */
    getError() {
        return this.getRawError();
    }

    /**
     * get the HTML results to put into the window dom element
     * Extend this for custom behavior
     *
     * @return {String|DOM} the element you want to append to the console window
     */
    getHtmlResults() {
        var jsonResultSet = '';
        this.getResults().forEach( (entry) => {
            jsonResultSet += Html.jsonSyntaxHighlight(entry) + '<br/>';
        });
        return $('<div>').addClass("port-response json").html(jsonResultSet);
    }

    /**
     * get the HTML error to put into the window dom element
     * Extend this for custom behavior
     *
     * @return {String|DOM} the element you want to append to the console window
     */
    getHtmlError() {
        return $('<div>').addClass("port-error").html('Could not complete query => ' + Html.htmlEncode(this.getError().message))
    }

    /**
     * Return a line of the history entry for this result.
     * This is usefull if you want to customize the history entry. However remember that:
     * {error:"na", query:""} are required
     *
     * @return {Object} the "line" in a history entry.
     */
    getHistory() {
        return {results: this.getRawResults(), error: this.getError()};
    }
}

export default Result;

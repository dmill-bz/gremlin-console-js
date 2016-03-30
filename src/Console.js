import { EventEmitter } from 'events';
import Client from './DriverClient';
import Html from './Html';
import $ from 'jquery';

/**
 * Handles logic related to the console
 *
 * @author Dylan Millikin <dylan.millikin@gmail.com>
 */
class Console extends EventEmitter {

    /**
     * @var {Object} List of options for the console
     */
    options;

    /**
     * @var {DOM} Jquery element for the window part of the console
     */
    windowElement;

    /**
     * @var {DOM} Jquery element for the input part of the console
     */
    inputElement;

    /**
     * @var {GremlinClient} The driver client class from jbmusso/gremlin-javascript
     */
    client;

    /**
     * @var {Array} this holds all query and response history in the form of:
     * [
     *      {query: String, err: String|null, JSONresponse: String|null, TextResponse: String|null},
     *      {query: "g.V(1)", err: null, JSONresponse: "[{id: 1, etc...}]", TextResponse: "==>v[1]"},
     *      ...
     * ]
     */
    history = [];

    /**
     * @var {Integer} the current pointer in the history array
     */
    historyPointer = 0;

    /**
     * Builds the Console
     *
     * @param  {String|DOM} element This can be a jquery selector (String) or a dom element
     * @param  {Object}     options The options array.
     * @return {Void}
     */
    constructor(windowElement, inputElement, options = {}) {
        super();

        this.windowElement = this._getElement(windowElement);
        this.inputElement = this._getElement(inputElement);

        //set window params
        this.windowElement.css({overflowY: "auto"});

        this.options = {
            port: 8182,
            host: 'localhost',
            history: [],
            driverOptions: {
                session: true
            },
            ...options
        }

        //lets populate history properly
        if(this.options.history !== null) {
            this.history = this.options.history;
        }

        //lets init the client
        console.log("connection to ws://" + this.options.host + ":" + this.options.port);
        console.log(this.options.driverOptions);
        this.client = new Client(this.options.port, this.options.host, this.options.driverOptions);

        this._attachHandlers();

        //lets set up events
        this.on('error', (err)=>{
            console.log(err);
        });
        this.on('results', (query, result)=>{
            this.handleResults(query, result);
        });
    }

    /**
     * Runs a gremlin query against gremlin-server
     *
     * @param  {String} query the gremlin query
     * @return {Void}
     */
    executeQuery(query) {
        console.log(query);
        this.client.execute(query, (result) => {
            console.log(result);
            this.emit('results', query, result);
        });
    }

    /**
     * Applies logic based on results
     *
     * @param  {Array} results db results
     * @return {Void}
     */
    handleResults(query, result) {
        //add results to window
        let response = $('<div>').addClass('port-section');
        response.append($('<div>').addClass("port-query").html('gremlin> ' + Html.htmlEncode(query)));

        if(!result.getError()) {
            response.append(result.getHtmlResults());
        } else {
            response.append(result.getHtmlError());
        }

        this.windowElement.append(response);
        this.windowElement.animate({ scrollTop: this.windowElement[0].scrollHeight }, "slow");
        //add results to history
        this.populateHistory(query, result);
    }

    /**
     * Populate the history array
     *
     * @return {Void}
     */
    populateHistory(query, result) {
         if(query != ""                                                                 // not an empty query
            && (
                !result.getError()
                || (
                    typeof this.history[this.history.length - 1] == 'undefined'     // if error then don't save the same query multiple
                    || query != this.history[this.history.length - 1].query         // times.
                    )
                )
            ) {
            this.history.push($.extend({query: query}, result.getHistory()));
        }
        this.historyPointer = this.history.length;
    }

    /**
     * Private : attaches keypress/down events to the input
     *
     * @return {Void}
     */
    _attachHandlers() {
        const widget = this;

        //Lets attach the enter key down handler
        this.inputElement.keypress(function(e) {
            if(e.which == 13) {
                var result = widget.executeQuery($(this).val());
                $(this).val('');
            }
        });

        //Lets attach up and down arrows to navigate history
        this.inputElement.keydown(function(e) {
            if(e.which == 38) { // on up arrow
                if( typeof widget.history[widget.historyPointer - 1] !== 'undefined' ) {
                    widget.historyPointer -= 1;
                    $(this).val(widget.history[widget.historyPointer].query);
                }

            }else if(e.which == 40) { // on down arrow
                if( typeof widget.history[widget.historyPointer + 1] !== 'undefined' ) {
                    widget.historyPointer += 1;
                    $(this).val(widget.history[widget.historyPointer].query);
                } else {
                    widget.historyPointer = widget.history.length;
                    $(this).val('');
                }
            }
        })
    }

    /**
     * Simple method to get/set elements from jquery selector strings
     *
     * @param  {String|DOM} element the elementwe want to get/set
     * @return {DOM} the dom element (translated from string if necessary)
     */
    _getElement(element) {
        if(typeof element == "string") {
            return $(element);
        } else {
            return element;
        }
    }

    /**
     * Registers a plugin for the console
     * Plugins follow a specific interface documented in the README.md
     *
     * @param  {Plugin} plugin the plugin to register
     * @return {Void}
     */
    register(plugin) {
        plugin.load(this);
    }
}

export default Console;

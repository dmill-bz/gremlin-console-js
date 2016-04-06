import EventEmitter from 'events';
import Client from './DriverClient';
import Html from './Html';
import Parser from './Parser';
import $ from 'jquery';

/**
 * Handles logic related to the console
 *
 * @author Dylan Millikin <dylan.millikin@gmail.com>
 */
class Console extends EventEmitter {

    /**
     * @type {Object} List of options for the console
     */
    options;

    /**
     * @type {DOM} Jquery element for the window part of the console
     */
    windowElement;

    /**
     * @type {DOM} Jquery element for the input part of the console
     */
    inputElement;

    /**
     * @type {GremlinClient} The driver client class from jbmusso/gremlin-javascript
     */
    client;

    /**
     * @type {Parser} This is a Parser object that can be used to parse responses from the DB. Mostly useful for custom serializers.
     * The Console mostly holds onto this to pass id down to the Clients
     */
    parser;

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

        this.windowElement = Console._getElement(windowElement);
        this.inputElement = Console._getElement(inputElement);

        //set window params
        this.windowElement.css({overflowY: "auto"});

        this.options = {
            port: 8182,
            host: 'localhost',
            driverOptions: {
                session: true
            },
            visualizerOptions: {
            },
            ...options
        }

        this._attachHandlers();

        //set default parser up
        this.parser = new Parser();

        //lets set up events
        this.on('error', (err)=>{
            console.log(err);
        });
        this.on('results', (query, parser)=>{
            this.handleResults(query, parser);
        });
    }

    /**
     * Opens a connection with the client
     * This is seperated and only called on query so that the user can interact and change settings/plugins
     * after initializing the Console and still affect the client with those changes.
     *
     * This also has the potential to reconnect a disconnected client.
     *
     * @return {Void}
     */
    initClient() {
        if(!this.client) {
            //lets init the client
            this.client = new Client(this.options.host, this.options.port, this.options.driverOptions, this.parser);

            //lets set up events
            this.client.onError((err)=>{ // bubble up errors
                this.emit('error', err);
            });
        }
    }

    /**
     * Runs a gremlin query against gremlin-server
     *
     * @param  {String} query the gremlin query
     * @return {Void}
     */
    executeQuery(query) {
        this.initClient();
        this.client.execute(query, (parser) => {
            this.emit('results', query, parser);
        });
    }

    /**
     * Applies logic based on results
     *
     * @param  {String}  query         The query run against db
     * @param  {Parser}  parser        The database parser object
     * @param  {Boolean} recordHistory Whether or not we should record this request in the history
     * @return {Void}
     */
    handleResults(query, parser, recordHistory = true) {
        //add results to window
        let response = $('<div>').addClass('port-section');
        response.append($('<div>').addClass("port-query").html('gremlin> ' + Html.htmlEncode(query)));

        if(!parser.getError()) {
            response.append(parser.getHtmlResults());
        } else {
            response.append(parser.getHtmlError());
        }

        this.windowElement.append(response);
        this.windowElement.animate({ scrollTop: this.windowElement[0].scrollHeight }, "slow");
        //add results to history
        if(recordHistory) {
            this.populateHistory(query, parser);
        }
    }

    /**
     * Populate the history array
     *
     * @param  {String} query  The query that was sent to the database
     * @param  {Parser} parser The parser sent back from the database.
     * @return {Void}
     */
    populateHistory(query, parser) {
         if(query != ""                                                                 // not an empty query
            && (
                !parser.getError()
                || (
                    typeof this.history[this.history.length - 1] == 'undefined'     // if error then don't save the same query multiple
                    || query != this.history[this.history.length - 1].query         // times.
                    )
                )
            ) {
            this.history.push($.extend({query: query}, parser.getHistory()));
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
                widget.executeQuery($(this).val());
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
    static _getElement(element) {
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

    /**
     * Populates the state of the graph from the provided history.
     * This essentially re-runs all the history queries so that all session variables and graph state exist.
     *
     * @param  {Array} history the history we want to re-run.
     * @return {Void}
     */
    populateDbFromHistory(history = []) {

        //lets populate history properly if it isn't empty
        if(history.length > 0 && this.history.length < 1) {
            this.history = history;
            this.historyPointer = history.length;
            this.populateDbFromHistory();

            if(typeof this.history[0].query !== 'undefined') {
                this.initClient();
                //lets take all queries and bunch them together to recreate env
                let query = '';
                for (let i = 0; (i < this.history.length - 1); i++) {
                    let parser = this.parser.create(this.history[i].error, this.history[i].results); // creates a Parser
                    this.handleResults(this.history[i].query, parser, false); // don't emit('results') as some plugins may generate viz on each call.
                    if(typeof parser.getError() === 'undefined' || parser.getError() == '' || parser.getError() == null)
                        query += this.history[i].query + ";";
                }
                //add typing to avoid strange db errors due to sandboxing
                query = this._addTyping(query);

                //execute the bundled query
                this.client.execute(query, (parser) => {
                    if(!parser.getError())
                    {
                        if(this.history.length > 0) {
                            //here we need to remove the last history item since we are going to apply it again.
                            var lastHistory = this.history.splice(-1,1);
                            this.executeQuery(lastHistory[0].query);
                        }
                    } else {
                        this.emit('error', new Error( "Your initializing script produced an error : \n" + Html.htmlEncode(parser.getError())));
                    }
                });
            }
        }
    }

    /**
     * Adds typing and defs for query.
     * This is used internaly to allow the system to issue a long query string of queries that may not have
     * been required to use typing because they were sent individualy. (sandboxing caveats)
     *
     * @param  {String} groovy The query that potentially doesn't have correct typing
     * @return {String} a query with correct typing.
     */
    _addTyping(groovy) {
        const regex = /(?:"[^"]*?")|(?:^|\;) ?(\w+) ?(?=\=)/gmi;
        let pointer = 0, pointerIncr = 0, result, variables = {}, output = groovy;
        while ( (result = regex.exec(groovy)) ) {
            if(typeof variables[result[1]] != "undefined" || (result[1] != "graph" && result[1] != "g" && typeof result[1] != "undefined"))
            {
                pointer = result.index + pointerIncr + result[0].indexOf(result[1]);
                output = [output.slice(0, pointer), "def ", output.slice(pointer)].join('');
                pointerIncr += 4;
                variables[result[1]] = true; // this means we've already def this variable.
            }
        }
        return output;
    }
}

export default Console;

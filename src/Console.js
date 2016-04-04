import EventEmitter from 'events';
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
            visualizerOptions: {
            },
            ...options
        }

        //lets init the client
        this.client = new Client(this.options.host, this.options.port, this.options.driverOptions);

        this._attachHandlers();

        //lets set up events
        this.client.client.on('error', (err)=>{ // bubble up errors
            this.emit('error', err);
        });
        this.on('error', (err)=>{
            console.log(err);
        });
        this.on('results', (query, result)=>{
            this.handleResults(query, result);
        });

        //lets populate history properly if it isn't empty
        if(typeof this.options.history[0] !== 'undefined') {
            this.history = this.options.history;
            this.historyPointer = this.history.length;
            this.populateDbFromHistory();
        }
    }

    /**
     * Runs a gremlin query against gremlin-server
     *
     * @param  {String} query the gremlin query
     * @return {Void}
     */
    executeQuery(query) {
        this.client.execute(query, (result) => {
            this.emit('results', query, result);
        });
    }

    /**
     * Applies logic based on results
     *
     * @param  {String}  query         The query run against db
     * @param  {Result}  result        The database result object
     * @param  {Boolean} recordHistory Whether or not we should record this request in the history
     * @return {Void}
     */
    handleResults(query, result, recordHistory = true) {
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
        if(recordHistory) {
            this.populateHistory(query, result);
        }
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

    /**
     * Populates the state of the graph from the history.
     * This essentially re-runs all the history queries so that all session variables and graph state exist.
     *
     * @return {Void}
     */
    populateDbFromHistory() {
        if(typeof this.history[0].query !== 'undefined') {
            //lets take all queries and bunch them together to recreate env
            let query = '';
            for (let i = 0; (i < this.history.length - 1); i++) {
                let result = this.client.buildResult(this.history[i].error, this.history[i].results);
                this.handleResults(this.history[i].query, result, false); // don't emit('results') as some plugins may generate viz on each call.
                if(typeof result.getError() === 'undefined' || result.getError() == '' || result.getError() == null)
                    query += this.history[i].query + ";";
            }
            //add typing to avoid strange db errors due to sandboxing
            query = this._addTyping(query);

            //execute the bundled query
            this.client.execute(query, (result) => {
                if(!result.getError())
                {
                    if(this.history.length > 0) {
                        //here we need to remove the last history item since we are going to apply it again.
                        var lastHistory = this.history.splice(-1,1);
                        this.executeQuery(lastHistory[0].query);
                    }
                } else {
                    console.log("Your initializing script produced an error : \n" + result.getError());
                    this.options.onError("Your initializing script produced an error : \n" + Html._htmlEncode(result.getError()));
                }
            });
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

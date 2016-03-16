// Assuming Node.js or Browser environment with browserify:
var Gremlin = require( 'gremlin');
global.consoleJquery = require('jquery');
var cytoscape = require('cytoscape');
require('jquery-ui/widget');

/**
 * dragDrop JQuery-ui Widget
 * This widget lays the foundation for a multi item multi zone drag and drop.
 *
 * @author Dylan Millikin <dylan.millikin@brightzone.fr>
 * @version 1.0
 */

(function($){
    $.widget("brightzone.gremlinConsole", {
        /**
         * All options available for this widget
         */
        options: {
            host:'localhost', // the host to connect to
            port:8182, // the port to connect to
            driverOptions:null, // the gremlin driver options. Check https://github.com/jbmusso/gremlin-javascript
            inputElement: null, // if we don't want to create an input element specify which one to use
            vizElement: null, // if we don't want to create a vizualization element specify which one to use
            consoleElement: null, // if we don't want to create a vizualization element specify which one to use
            history: null, // we can populate history if required via this feature.
            onError: function(e){ throw e;},
            afterWindowUpdate: function(){}
        },

        /**
         * console element
         */
        consoleElement: null,

        /**
         * visualizer element
         */
        vizElement: null,

        /**
         * input element
         */
        inputElement: null,

        /**
         * the gremlin driver client
         */
        client : null,

        /**
         * Visualization tool
         */
        visualizer : null,

        /**
         * the command history
         */
        history : [],

        /**
         * the history pointer
         * @todo remove this it isn't clean
         */
        historyPointer : 0,

        /**
         * Initializing the widget
         */
        _create: function() {
            var widget = this;

            // Will open a WebSocket to ws://localhost:8182 by default
            console.log("connection to ws://"+this.options.host+":"+this.options.port);
            console.log(this.options.driverOptions);
            this.client = Gremlin.createClient(this.options.port, this.options.host, this.options.driverOptions);

            this.client.on('error', $.proxy(function(err) {
                console.log(err);
                widget.options.onError(this._htmlEncode(err));
            }, this));

            // create window if not set.
            if(this.options.consoleElement === null) {
                this.consoleElement = $('<div>').addClass('port-window');
                this.element.append(pWindow);
            } else {
                this.consoleElement = this.options.consoleElement;
                this.consoleElement.addClass('port-window');
            }

            // create input if not set
            if(this.options.inputElement === null) {
                this.inputElement = $('<input type="text">').addClass('port-input');
                this.element.append(pInput);
            } else {
                this.inputElement = this.options.inputElement;
                this.inputElement.addClass('port-input');
            }

            //lets populate history properly
            if(this.options.history !== null) {
                this.history = this.options.history;
            }

            if(this.options.vizElement !== null) {
                this.vizElement = this.options.vizElement;
                this.vizElement.addClass('port-visualization');


                //Lets initialize cytoscape visualization
                this.visualizer = cytoscape({
                  container: this.vizElement,

                    style: [ // the stylesheet for the graph
                        {
                            selector: 'node',
                            style: {
                                'content': 'data(id)',
                                'text-valign': 'center',
                                'color': 'white',
                                'text-outline-width': 2,
                                'text-outline-color': 'data(color)',
                                'background-color': 'data(color)',
                                'text-wrap':'wrap',
                                'border-width':2,
                                'border-color':'data(color)'
                            }
                        },
                        {
                            selector: 'edge',
                            style: {
                                'width': 3,
                                'label' : 'data(label)',
                                'line-color': '#ccc',
                                'target-arrow-color': '#ccc',
                                'target-arrow-shape': 'triangle',
                                'edge-text-rotation': 'autorotate',
                                'text-outline-width': 2,
                                'text-outline-color': 'white'
                            }
                        },
                        {
                            selector: 'node:selected',
                            style: {
                                'background-color': '#fff',
                                'label' : 'data(label)'
                            }
                        }
                    ],
                    layout: {
                        name: 'grid',
                        row: 1
                    }
                });

                this.visualizer.ready($.proxy(function(){
                    this._initDb();
                }, this));
            }

            //Lets attach a key down handler
            this.inputElement.keypress(function(e) {
                if(e.which == 13) {
                    var result = widget.dbSend($(this).val());
                    $(this).val('');
                }
            });

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
        },

        _initDb: function(){
            var widget = this;
            if(typeof widget.history[0].query !== 'undefined') {
                //lets take all queries and bunch them together to recreate env
                var query = '';
                for (var i = 0; (i < widget.history.length - 1); i++) {
                    if(typeof widget.history[i].error === 'undefined' || widget.history[i].error == '' || widget.history[i].error == null)
                        query += widget.history[i].query + ";";
                }
                query = widget._addTyping(query);
                widget.client.execute(query, (err, results) => {
                    if(!err)
                    {
                        if(widget.history.length > 0) {
                            //here we need to remove the last history item since we are going to apply it again.
                            var lastHistory = widget.history.splice(-1,1);
                            widget.dbSend(lastHistory[0].query);
                        } else {
                            widget.initViz();
                        }
                    } else {
                        console.log("Your initializing script produced an error : \n" + err);
                        widget.options.onError("Your initializing script produced an error : \n" + widget._htmlEncode(err));
                    }
                });
            } else {
                this.initViz();
            }
        },

        /**
         * Sending data to the DB
         */
        dbSend : function(query) {
            var widget = this;
            //if the history pointer is the same as the last element then we add a new history entry

            this.client.execute(query, (err, results) => {
                var response = $('<div>').addClass('port-section');
                if (!err) {
                    response.append($('<div>').addClass("port-query").html('gremlin> '+widget._htmlEncode(query)));
                    var consoleResultSet = '';
                    var jsonResultSet = '';
                    if(results.length != 0) {
                        results[0].text.forEach(function(entry){
                            consoleResultSet += '==>'+widget._jsonSyntaxHighlight(entry) + '<br/>';
                        });
                        results[0].json.forEach(function(entry){
                            jsonResultSet += widget._jsonSyntaxHighlight(entry) + '<br/>';
                        });
                    }
                    response.append($('<div>').addClass("port-response console").append($("<pre>").html(consoleResultSet)));
                    response.append($('<div>').addClass("port-response json").html(jsonResultSet));
                    widget.addToWindow(response);
                    widget.initViz(function(){
                        if(results.length != 0)
                            widget.selectInViz(results[0].json);
                    });

                    //lets add line to history
                    if(query != "") {
                        widget.history.push({query: query, jsonResponse: jsonResultSet, consoleResponse: consoleResultSet, error: err});
                    }
                    widget.historyPointer = widget.history.length;

                } else {
                    //lets add line to history
                    if(query != "" && (typeof widget.history[widget.history.length - 1] == 'undefined' || query != widget.history[widget.history.length - 1].query)) {
                        widget.history.push({query: query, jsonResponse: '', consoleResponse: '', error: err});
                    }
                    widget.historyPointer = widget.history.length;

                    response.append($('<div>').addClass("port-query").html(widget._htmlEncode(query)));
                    response.append($('<div>').addClass("port-error").append($("<pre>").html('Could not complete query: ' + widget._htmlEncode(err.message))));
                    widget.addToWindow(response);

                }
            });
        },

        addToWindow : function(string) {
            this.consoleElement.append(string);
            this.options.afterWindowUpdate();
            this.consoleElement.animate({ scrollTop: this.consoleElement[0].scrollHeight }, "slow");
        },

        _jsonSyntaxHighlight: function (json) {
            if (typeof json != 'string') {
                 json = JSON.stringify(json, undefined, 2);
            }
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        },

        initViz: function(callback) {
            callback = callback || function(){};
            if(this.vizElement !== null) {
                this.visualizer.elements().remove();
                var widget = this;
                this.client.execute('g.V()', (err, results) => {
                    //lets add line to history
                    if (!err) {
                        if (results.length != 0)
                        widget.addToViz(results[0].json);
                        this.client.execute('g.E()', (err, results) => {
                            //lets add line to history
                            if (!err) {
                                if (results.length != 0)
                                widget.addToViz(results[0].json);
                                callback();
                            }
                        });
                    }
                });
            }
        },

        addToViz: function(results) {
            if(this.vizElement !== null) {
                //lets only proceed if we have nodes or edges
                results.forEach($.proxy(function(entry) {
                    if(entry.type == "vertex") {
                        this.visualizer.add({
                            group:"nodes",
                            data:{
                                id:entry.id,
                                label:entry.label,
                                color: this._stringToColor(entry.label)
                            }

                        });
                    }else if(entry.type == "edge") {
                        this.visualizer.add({
                            group:"edges",
                            data:{
                                id:'e-'+entry.id,
                                label:entry.label,
                                target: entry.inV,
                                source: entry.outV
                            }
                        });
                    }
                }, this));
                this.visualizer.layout({name:'cose'});
            }
        },

        selectInViz: function(results) {
            if(this.vizElement !== null) {
                //lets only proceed if we have nodes or edges
                results.forEach($.proxy(function(entry) {
                    //There's a special case for null
                    if(entry !== null)
                    {
                        var objects = typeof entry.objects == "undefined" ? [entry] : entry.objects;
                        objects.forEach($.proxy(function(entry) {
                            if(entry.type == "vertex") {
                                var elem = this.visualizer.getElementById(entry.id);
                                elem.css({textOutlineColor:"red", borderColor : "red"});
                            } else if(entry.type == "edge") {
                                var elem = this.visualizer.getElementById('e-' + entry.id);
                                elem.css({textOutlineColor:"red", backgroundColor : "red", lineColor:"red", sourceArrowColor: "red", targetArrowColor: "red", color:"white"});
                            }
                        }, this));
                    }
                }, this));

                this.visualizer.layout({
                        //~ name: 'cola',
                        //~ nodeSpacing: 5,
                        //~ edgeLengthVal: 45,
                        //~ animate: true,
                        //~ randomize: false,
                        //~ maxSimulationTime: 1500
                        name: 'cose',
                        animate: true,
                        idealEdgeLength: function( edge ){ return 20; },
                        edgeElasticity: function( edge ){ return 200; }
                    });
            }
        },

        getHistory: function(){
            return this.history;
        },

        _htmlEncode: function (html) {
            return $('<div/>').text(html).html();
        },

        _stringToColor: function (str) {
            //create hash
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
               hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }

            //generate hex color
            var c = (hash & 0x00FFFFFF)
                .toString(16)
                .toUpperCase();

            var colorHex = "00000".substring(0, 6 - c.length) + c;
            return "#"+colorHex;
        },

        _addTyping: function (str) {
            var regex = /"[^"]*?"|(?:^|\;) ?(\w+) ?(?=\=)/gmi, result;
            var pointer = 0, pointerIncr = 0;
            var output = str;
            var variables = {};
            while ( (result = regex.exec(str)) ) {
                if(typeof variables[result[1]] != "undefined" || (result[1] != "graph" && result[1] != "g"))
                {
                    pointer = result.index + pointerIncr + result[0].indexOf(result[1]);
                    output = [output.slice(0, pointer), "def ", output.slice(pointer)].join('');
                    pointerIncr += 4;
                    variables[result[1]] = true; // this means we've already def this variable.
                }
            }
            return output;
        }
    });
})( consoleJquery );


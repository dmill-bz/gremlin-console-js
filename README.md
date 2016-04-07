**gremlin-console** is a frontend library that generates a console to query [gremlin-server](https://www.apache.org/dyn/closer.lua/incubator/tinkerpop/3.1.1-incubating/apache-gremlin-server-3.1.1-incubating-bin.zip) (or gremlin-server enabled graph databases like [Titan](http://thinkaurelius.github.io/titan/)). It is compatible with [Apache TinkerPop3](http://tinkerpop.incubator.apache.org/). It can be extended via plugins to support visualization and output format (amongst other things)

[![Build Status](https://travis-ci.org/PommeVerte/gremlin-console-js.svg?branch=master)](https://travis-ci.org/PommeVerte/gremlin-console-js) [![Coverage Status](https://coveralls.io/repos/github/PommeVerte/gremlin-console-js/badge.svg?branch=master)](https://coveralls.io/github/PommeVerte/gremlin-console-js?branch=master)    [![npm](https://img.shields.io/npm/v/gremlin-console.svg)](https://www.npmjs.com/package/gremlin-console) [![GitHub license](https://img.shields.io/badge/license-Apache%202-blue.svg)](https://raw.githubusercontent.com/PommeVerte/gremlin-console-js/master/LICENSE.txt)

## Introduction

This is the gremlin-console library used for [www.gremlinbin.com](http://gremlinbin.com/bin/view/56e9a41538639).
gremlin-console can :
- Execute gremlin queries against gremlin-server
- Display query results (with syntax highlighting)
- Maintain a query + result history (for easy re-runs using up/down arrows as well as any manipulation of the history that could be required)
- Be extended via plugins

![App Screenshot](http://pommeverte.github.io/images/screenshot.png)

## Installation

```shell
npm install gremlin-console
```


## Getting started

##### Using ES2015/2016
```javascript
import GremlinConsole from 'gremlin-console';

//create a console + input combo by passing css selectors to GremlinConsole
const gc = GremlinConsole('#console-window', '#console-input', {host: "localhost", port: 8182});
```

##### In browser
```html
<head>
  <!-- ... -->
  <link rel="stylesheet" type="text/css" href="umd/css/default.css">
  <script src="umd/gremlin-console.min.js"></script>
</head>
```
```javascript
//create a console + input combo by passing css selectors to GremlinConsole
var gc = GremlinConsole.create('#console-window', '#console-input', {host: "localhost", port: 8182});
```
The available options are :
- **`host`**: The host gremlin-server can be reached on (defaults to `localhost`)
- **`port`**: The port to connect to gremlin-server on (defaults to `8182`)
- **`driverOptions`**: An `map` of all the configuration options for the console's client. See [jbmusso/gremlin-javascript](https://github.com/jbmusso/gremlin-javascript) for the default client.


## Security
**--WARNING--** Due to the nature of gremlin-console being executed locally in the browser and communicating directly with gremlin-server, there are some security implications. If you can't trust your users or are using `gremlin-console-js` outside of the scope of a secure network (ie : public network) you will need to enable [sandboxing](http://tinkerpop.apache.org/docs/3.1.1-incubating/reference/#_security) (amongst other things) on gremlin-server. This configuration is required to ensure that people running queries in the console don't get access to secure server side information.

Another option (though not a replacement to sandboxing) is to use `gc-ajax-plugin` which will allow you not to expose the gremlin-server websocket. This has more overhead but it will provid the added benefit that you can handle Authentication and Authorization on your server app level. _(see plugin section)_

## Populating the console on init
You can prepare the state of the graph as well as the queries and results display in the console upon initializing by providing a history object in the options:
```javascript
// Start an instance of gremlin-console
var gc = GremlinConsole('#console-window', '#console-input');
// Provide a history array to populate the graph
// In this case we create a modern graph "graph", with a traversal object "g".
gc.populateDbFromHistory([
  {query: "graph = TinkerFactory.createModern();", error: undefined, results: [null]},
  {query: "g = graph.traversal();", error: undefined, results: [null]}
]);
```
_What happens under the hood : gremlin-console will concatenate the n-1 queries from the provided history and submit them to the server. Essentially setting the graph's state. Then it will rerun the last query so as to trigger the proper events._ 


## Events
You can register lambdas against events as follows : 
```javascript
const gc = GremlinConsole('#console-window', '#console-input', {host: "localhost", port: 8182});
gc.on('results', (err, result) => {});
```
There are currently only two supported events :
- **results** is triggered when the client receives a response from the server. It provides the following params:
  - `err` : An object with an `err.message` property.
  - `result` : A `Parser` object.
- **error** is triggered when a structural error occurs (different from a query error). It provides the following params:
  - `err` : An `Error` object.


## Plugins
The following plugins are currently available for `gremlin-console` : 

- [`gc-graphson-text-plugin`](https://github.com/PommeVerte/gc-graphson-text-plugin) : Modifies the output display. Makes the console show the results in the same way the Apache TinkerPop terminal console displays it's results.
- [`gc-ajax-plugin`](https://github.com/PommeVerte/gc-ajax-plugin) : Makes `gremlin-console` run it's queries against an `http` web page instead of directly against the gremlin-server's `websocket`. This can help provide more control over Authentication and Authorization of users on your website.
- [`gc-cytoscape-plugin`](https://github.com/PommeVerte/gc-cytoscape-plugin) : **highly experimental** A graph visualization tool for `gremlin-console`. This is only useful for very small data sets.
 
If you're interested in developping plugins check the [plugin documentation](docs/Plugins.md).

## API
You can find the API [here](http://pommeverte.github.io/gremlin-console-js/).


## misc
- Build libs : `npm run build` and find file `lib/index.js`
- Build web js : `npm run build:umd` and find file `umd/gremlin-console.js`
- Build web min.js : `npm run build:min` and find file `umd/gremlin-console.min.js`
- Run tests : `npm run test` will run mocha coverage (firefox required)
- Build api : `npm run build:docs` will generate an `api` folder.

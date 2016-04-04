**gremlin-console** is a frontend library that generates a console to query [gremlin-server](https://www.apache.org/dyn/closer.lua/incubator/tinkerpop/3.1.1-incubating/apache-gremlin-server-3.1.1-incubating-bin.zip) (or gremlin-server enabled graph databases like [Titan](http://thinkaurelius.github.io/titan/)). It is compatible with [Apache TinkerPop3](http://tinkerpop.incubator.apache.org/). It can be extended via plugins to support visualization and output format (amongst other things)

[![Build Status](https://travis-ci.org/PommeVerte/gremlin-console-js.svg?branch=master)](https://travis-ci.org/PommeVerte/gremlin-console-js) [![Coverage Status](https://coveralls.io/repos/github/PommeVerte/gremlin-console-js/badge.svg?branch=master)](https://coveralls.io/github/PommeVerte/gremlin-console-js?branch=master) [![GitHub license](https://img.shields.io/badge/license-Apache%202-blue.svg)](https://raw.githubusercontent.com/PommeVerte/gremlin-console-js/master/LICENSE.txt)

## Introduction

This is the gremlin-console library used for [www.gremlinbin.com](http://gremlinbin.com/bin/view/56e9a41538639). 
gremlin-console can :
- Execute gremlin queries against gremlin-server
- Display query results (with syntax highlighting)
- Maintain a query + result history (for easy re-runs using up/down arrows as well as any manipulation of the history that could be required)
- Be extended via plugins

![App Screenshot](https://github.com/PommeVerte/gremlin-console-js/blob/master/docs/screenshot.png)

## Installation

```shell
npm install gremlin-console
```


## Getting started

##### Using ES2015/2016
```javascript
import GremlinConsole from 'gremlin-console';

//create a console + input combo by passing css selectors to GremlinConsole
const gc = GremlinConsole.create('#console-window', '#console-input', {host: "localhost", port: 8182});
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
- **`history`**: An optional `array` of history elements that can be used to populate the console on init. See the [history example](https://github.com/PommeVerte/gremlin-console-js/blob/master/examples/history.html#L117-L130) for sample code.
- **`driverOptions`**: An `map` of all the configuration options for the console's client. See [jbmusso/gremlin-javascript](https://github.com/jbmusso/gremlin-javascript) for the default client.


## Security
**--WARNING--** Due to the nature of gremlin-console being executed locally in the browser and communicating directly with gremlin-server. If you plan on using it outside of the scope of a secure network (localhost for example) you will need to enable [sandboxing](http://tinkerpop.apache.org/docs/3.1.1-incubating/reference/#_security) (amongst other things) on gremlin-server. This configuration is required to ensure that people running queries in the console don't get access to secure server side information.


## Populating the console on init
You can prepare the state of the graph as well as the queries and results display in the console upon initializing by providing a history object in the options:
```javascript
// The following will load a modern TinkrGraph "graph", and it's traversal "g".
// These will as a result become accessible in the console.
var gc = GremlinConsole.create('#console-window', '#console-input', {history : [
  {query: "graph = TinkerFactory.createModern();", error: null, results: null},
  {query: "g = graph.traversal();", error: null, results: null}
]});
```


## Plugins


## API
You can find the API [here](http://pommeverte.github.io/gremlin-console-js/).


## misc
- Build libs : `npm run build` and find file `lib/index.js`
- Build web js : `npm run build:umd` and find file `umd/gremlin-console.js`
- Build web min.js : `npm run build:min` and find file `umd/gremlin-console.min.js`
- Run tests : `npm run test` will run mocha coverage (firefox required)
- Build api : `npm run build:docs` will generate an `api` folder. 

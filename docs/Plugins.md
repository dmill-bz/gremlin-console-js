This document will review some of the important points of developping your own plugins for `gremlin-console-js`

## Basic implementation
Every plugin must implement a `.load()` method. This method will take one argument and that argument will be a `Console` object (the console that registered the plugin).
Bellow is an example of a basic plugin that demonstrates several possible features :

```javascript
import CustomClient from './customClient';
import CustomParser from './customParser';

/**
 * Basic plugin for gremlin-console-js.
 *
 * @author Dylan Millikin <dylan.millikin@gmail.com>
 */
class BasicPlugin {

    /**
     * This method loads all the required features for this plugin
     *
     * @param  {Console} main the console object that registered this plugin
     * @return {Void}
     */
    load(main) {
    
        // modify the console's options. (you could simply to this and use the default client.
        main.options.host = "customHost"; 
        main.options.port = 12345; 
        
        // Override the default parser with your custom parser (when db results are returned in a custom format)
        main.parser = new CustomParser();
        
        //If you want to override the console's client with a custom client:
        main.client = new CustomClient(main.options.host, main.options.port, main.options.driverOptions);
        
        //Lets do something everytime the console receives results (view the available events in the README)
        main.on('results', (query, parser) => {
            console.log("results were received");
            // you could use the results to do anything here, the visualizer plugins use this to populate the visualization.
        });
    }
}

export default BasicPlugin;
```

## Public APIs
When overriding the Parser or Client you should implement the same public API as the default classes in `gremlin-console-js`. It is recommended you check the source code and the [API](http://pommeverte.github.io/gremlin-console-js/)

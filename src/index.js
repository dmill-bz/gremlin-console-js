// Assuming Node.js or Browser environment with browserify:
import Console from './Console';

global.gremlinConsole = function(...x) {
    const c = new Console(...x);
    /**
     * register a plugin (example)
     */
    // c.register(new CytoscapeVisualizerPlugin());
    return c;
}

// Assuming Node.js or Browser environment with browserify:
import Console from './Console';

export function create(...x) {
    const c = new Console(...x);
    /**
     * register a plugin (example)
     */
    // c.register(new CytoscapeVisualizerPlugin());
    return c;
}

export default create;

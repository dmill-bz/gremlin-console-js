// Assuming Node.js or Browser environment with browserify:
import Console from './Console';

global.gremlinConsole = function(...x) {
    return new Console(...x);
}

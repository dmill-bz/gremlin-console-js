//tell karma which files to load.
var context = require.context('./test', true, /Test\.js$/);
context.keys().forEach(context);

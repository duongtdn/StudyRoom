
var executeEventFunction = function(context /*, args */) {
    var tmpargs 		= Array.prototype.slice.call(arguments, 1);
    var args 			= tmpargs[0].slice();
    var functionName 	= args.shift();
    var namespaces 		= functionName.split(".");
    var func 			= namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
};

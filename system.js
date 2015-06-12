var SYSTEM = SYSTEM || {};

( function(global, $, module) {

    var config = {
        namespace: function(namespace) {
            var parts = namespace.split('.'),
                parent = SYSTEM, i;

            parts = parts.slice(1);
            for (i = 0; i < parts.length; i += 1) {

                if (typeof parent[parts[i]] === "undefined") {
                    parent[parts[i]] = {};
                }

                parent = parent[parts[i]];
            }

            return parent;
        }
    };

    var Internals = {
        arguments: [],

        getArguments: function() {
            var temp = this.arguments;
            this.arguments = [];

            return temp;
        },

        Parameterify: function(funcArr) {
            var i,
                systemProp,
                argumentStrings = [],
                func;

            if(funcArr.length === 1 && SYSTEM.Util.isFunction(funcArr[0])) {
                return funcArr[0];
            }

            for(i = 0; i < funcArr.length; i++) {
                if(SYSTEM.Util.isString(funcArr[i])) {
                    var arg = funcArr[i].replace(/SYSTEM\./, "");
                    argumentStrings.push(arg);
                }
                else if(SYSTEM.Util.isFunction(funcArr[i])) {
                    func = funcArr[i];
                }
            }

            for(i = 0; i < argumentStrings.length; i++) {
                if(SYSTEM.hasOwnProperty(argumentStrings[i])) {
                    this.arguments.push(SYSTEM[argumentStrings[i]]);
                }
            }

            return func;
        }
    };

    config.namespace("SYSTEM.ControlFlow");
    config.namespace("SYSTEM.Service");
    config.namespace("SYSTEM.Util");
    config.namespace("SYSTEM.SharedMemory");

    var Service = function() {
        var services = {}, constructors = {};

        this.fetchService = function(serviceString) {
            if(services.hasOwnProperty(serviceString) && services[serviceString] !== null) {
                return services[serviceString];
            }

            if(constructors.hasOwnProperty(serviceString)) {
                services[serviceString] = constructors[serviceString].__construct();

                return services[serviceString];
            }

            throw new Error("System.Service: No service named " + serviceString + " found in Services module");
        };

        this.hasService = function(serviceName) {
            return services.hasOwnProperty(serviceName) || constructors.hasOwnProperty(serviceName);
        };

        this.registerService = function(serviceArr) {
            var serviceConfig = Internals.Parameterify(serviceArr).apply(global, Internals.getArguments());

            if( ! serviceConfig.hasOwnProperty("name")) {
                throw new Error("System.Service: Cannot register service. \"name\" config parameter missing");
            }

            if( ! serviceConfig.hasOwnProperty("__construct")) {
                throw new Error("System.Service: Cannot register service. \"__construct\" method missing");
            }

            constructors[serviceConfig.name] = serviceConfig;
        }
    };

    var Util = function() {
        var valueIs = function(value, type) {
            if(({}).toString.call(value).match(/\s([a-zA-Z]+)/)[1].toLowerCase() == type) {
                return true;
            }

            return false;
        };

        this.isArray = function(array) {
            return valueIs(array, "array");
        };

        this.isObject = function(object) {
            return valueIs(object, "object");
        };

        this.isString = function(string) {
            return valueIs(string, "string");
        };

        this.isFunction = function(func) {
            return valueIs(func, "function");
        };

        this.typeOf = function(value) {
            return ({}).toString.call(value).match(/\s([a-zA-Z]+)/)[1].toLowerCase()

        };

        this.frCapitalize = function(string) {
            if( ! this.isString(string)) {
                return null;
            }

            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    };

    var SharedMemory = function() {
        var memory = {};

        this.addValue = function(key, value) {
            memory[key] = value;
        };

        this.hasValue = function(key, value) {
            return memory.hasOwnProperty(key);
        };

        this.getValue = function(key, value) {
            return (this.hasValue(key)) ? memory[key] : null;
        }
    };

    var ControlFlow = function() {
        var executionScopes = {}, optionals = {
            events: null,
            dom: null,
            context: null
        };

        this.scope = function(execObject) {
            if( ! execObject.hasOwnProperty("execute")) {
                throw new Error("System.ControlFlow: Scope object has to have an \"execute\" property that has to be a function");
            }

            if( ! SYSTEM.Util.isFunction(execObject["execute"]) && ! SYSTEM.Util.isArray(execObject["execute"]) ) {
                throw new Error("System.ControlFlow: Scope object \"execute\" has to be a function");
            }

            if( ! execObject.hasOwnProperty("systemName")) {
                throw new Error("System.ControlFlow: Scope object has to have an \"systemName\" property that has to be a string");
            }

            if( ! SYSTEM.Util.isString(execObject["systemName"])) {
                throw new Error("System.ControlFlow: Scope object \"systemName\" has to be a string");
            }

            optionals.events = (execObject.hasOwnProperty("events")) ? true : null;
            optionals.dom = (execObject.hasOwnProperty("dom")) ? true : null;
            optionals.context = (execObject.hasOwnProperty("context")) ? true : null;

            if(SYSTEM.Util.isArray(execObject.execute)) {
                execObject.execute = Internals.Parameterify(execObject.execute);
            }
            else {
                throw new Error("System.ControlFlow: \"execute\" has to be an array with a function as the last parameter");
            }




            executionScopes[execObject.systemName] = execObject;
            return this;
        };

        this.runSystem = function(systemName) {
            $(global.document).ready.call(this, function() {

                if( ! executionScopes.hasOwnProperty(systemName)) {
                    throw new Error("SYSTEM.ControlFlow.scope object argument is not defined properly. It has " +
                    "to contain the following properties: systemName, execute. Optional are: context");
                }

                // check if Dom and Event Services are necessary

                /**
                 * 1. Execute dom manipulation
                 * 2. Execute execute function
                 * 3. Bind events
                 */

                var scope, context;

                scope = executionScopes[systemName];
                context = (optionals.context && SYSTEM.Util.isObject(scope.context))
                          ? scope.context
                          : scope;

                // this call shoud remain the same
                executionScopes[systemName].execute.apply(context, Internals.getArguments());

                if(optionals.events) {
                    var event = SYSTEM.Service.fetchService("Event");

                    event.handleEvent(executionScopes[systemName]);
                }
            });
        }
    };

    SYSTEM.ControlFlow = new ControlFlow();
    SYSTEM.Service = new Service();
    SYSTEM.Util = new Util();
    SYSTEM.SharedMemory = new SharedMemory();

} (window, jQuery, SYSTEM));

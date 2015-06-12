SYSTEM.Service.registerService([function() {
    return {
        name: "Event",
        __construct: function() {
            function Event() {
                this.handleEvent = function(scope) {

                    for(var scopeEventFunc in scope.events) {
                        if(scope.events.hasOwnProperty(scopeEventFunc)) {
                            var eventObj = scope.events[scopeEventFunc],
                                validEvents = [
                                    "blur",
                                    "change",
                                    "click",
                                    "dblclick",
                                    "focus",
                                    "focusin",
                                    "focusout",
                                    "hover",
                                    "keydown",
                                    "keypress",
                                    "keyup",
                                    "load",
                                    "mouseenter",
                                    "mousedown",
                                    "mouseleave",
                                    "mousemove",
                                    "mouseout",
                                    "mouseover",
                                    "mouseout"
                                ];

                            if( ! eventObj.hasOwnProperty("event") &&  ! SYSTEM.Util.isString(eventObj.event)) {
                                throw new Error("System.Event: Event object has to have an \"event\" property and has to be a string value of a valid (jQuery) event");
                            }

                            if(validEvents.indexOf(eventObj.event) === -1) {
                                throw new Error("System.Event: " + eventObj.event + " is not a valid jQuery event");
                            }



                            if( ! eventObj.hasOwnProperty("elem") && ! SYSTEM.Util.isString("elem")) {
                                throw new Error("System.Event: Event object has to have an \"elem\" property. That property has to be a jQuery object");
                            }

                            if( ! scope.hasOwnProperty(scopeEventFunc)) {
                                throw new Error("System.Event: Event " + eventObj + " cannot be binded beacuse the " + scopeEventFunc + " does not exist on the scope object");
                            }

                            if( eventObj.hasOwnProperty("context") && eventObj.context === "scope") {
                                $(eventObj.elem).on(eventObj.event, $.proxy(scope[scopeEventFunc], scope));
                            }
                            else {
                                $(eventObj.elem).on(eventObj.event, scope[scopeEventFunc]);
                            }

                        }
                    }
                }
            }

            return new Event();
        }
    };
}]);
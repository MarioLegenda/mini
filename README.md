## Mini - Super cool mini framework

###Installation

#####Bower 

    bower install mini#0.0.1
    
#####GitHub

    git clone https://github.com/MarioLegenda/mini.git
    
######Getting started
    
System.js consists of modules that you inject (via script tags) into your website. *system.js* module is mandatory, every
other module is not, for example, systemEvent.js. 

######Structure

You add structure to your code with *SYSTEM.ControlFlow.scope()* function. It should accept an object literal with these
properties.

For example...

    SYSTEM.ControlFlow.scope({
        systemName: "someName",
        execute: [function() {
            // you logic goes here
        }]
    });
    
You noticed that *execute()* function is enclosed in an array. This is necessary beacuse of dependency injection.
Dependency injection is handled similary like in Angular.js but with some variation. Later on dependency injection.

######Services



######Events

######Dependency injection


    
    
    
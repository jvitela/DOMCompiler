function DOMCompiler() {

  'use strict'

  var registeredDirectives = [],
      directiveDefaults = {
        priority:   1,
        terminal:   false,
        transclude: false,
        view:       null,
        match:      function(element) { return false; },
        factory:    function(options) { return new this.view(options); }
      };

  function extend() {
    var k, obj, i = 0, l = arguments.length, res = {};
    for (; i < l; ++i) {
      obj = arguments[i];
      for (k in obj) {
        if (obj.hasOwnProperty(k)) {
           res[k] = obj[k];
        }
      }
    }
    return res;
  }

  /**
   * Compiler function
   */
  function compile(elem) {
    var i, l, directives, elemLinkFn, child, childLinkFn, 
      childLinkFns = [], childNodes = elem.childNodes;

    // Find all the directives for this element
    directives = findDirectives(elem);
    // Generate a linker function for this element and directives
    elemLinkFn = buildNodeLinker(directives, elem);

    // If the element doesn't contain a directive that
    // creates its own context, then compile its child nodes
    // and create link functions per each item
    if (!directives.transclude) {
      for (i = 0, l = childNodes.length; i < l; ++i) {
        child       = childNodes[i];
        // This will recursively compile this element and its children
        childLinkFn = compile(child);
        childLinkFns.push(childLinkFn);
      }
    }

    // Return a linker function for this element and all its children
    return function link(scope, createClone) {
      var chdEl, linkedEl;
      // Link the root element, this will either return 
      // the original node or a cloned one
      linkedEl = elemLinkFn(scope, createClone);
      // Link all its children
      for (var i = 0; i < childLinkFns.length; ++i) {
        chdEl = childLinkFns[i](scope, createClone);
        // If we are creating new nodes, 
        // append to the root element
        if (createClone) {
          linkedEl.appendChild(chdEl);
        }
      }
      // Return the linked element
      return linkedEl; 
    };
  }

  /**
   * Get all matching directives for the given node Element
   * The registeredDirectives must be sorted by priority, descending 
   */
  function findDirectives(elem) {
    var i, l, directive, maxPriority = -1, directives = [];
    directives.transclude = false;
    if (!elem) {
      return directives;
    }
    for (i = 0, l = registeredDirectives.length; i < l; ++i) {
      directive = registeredDirectives[i];
      if (!directive.match(elem) || directive.priority < maxPriority) {
        continue;
      }
      directives.push(directive);
      if (directive.transclude) {
        directives.transclude = true; 
      }
      if (directive.terminal) {
        maxPriority = directive.priority;
      }
    }
    return directives;
  }

  /**
   * Creates a function that initialize all the
   * directives for this DOM Node
   */
  function buildNodeLinker(directives, element) {
    return function(options, createClone) {
      var i, l, view, node;
      node = createClone? element.cloneNode(false) : element;
      for (i = 0, l = directives.length; i < l; ++i) {
        view = directives[i].factory(extend(options, {el: element}));
      }
      return node;
    };
  }

  /**
   * Register a directive for the compiler
   */
  function register( directive) {
    registeredDirectives.push(extend(directiveDefaults, directive));
    registeredDirectives.sort(function(a,b) {
      return (b.priority - a.priority);
    });
  }

  return {
    compile:  compile,
    register: register,
    count:    function(){ return registeredDirectives.length; }
  };
}
// Open Schools Kenya | BSD License

(function exportUtils(u) {
  // pretend we have functional tools
  u.each = function each(arr, fn) {
    for (var i=0; i<arr.length; i++) {
      fn(arr[i]);
    }
  };
  u.eachNode = function eachNode() {
    var $this = Array.prototype.shift.call(arguments);
    return Array.prototype.forEach.apply($this, arguments);
  };
  u.mapNodes = function mapNodes() {
    var $this = Array.prototype.shift.call(arguments);
    return Array.prototype.map.apply($this, arguments);
  };

  u.startsWith = function startsWith(str, startswith) {
    return str.lastIndexOf(startswith, 0) === 0;
  };

  u.stop = function stopEvent(e) {
    // just even.preventDefault, but works in IE8
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      event.returnValue = false;  // yeah the global event obj. ie8 is weird.
    }
  };

  u.extend = function extend(out) {
    // youmightnotneedjquery implementation
    out = out || {};
    for (var i = 1; i < arguments.length; i++) {
      if (!arguments[i])
        continue;
      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key))
          out[key] = arguments[i][key];
      }
    }
    return out;
  };

  // classList inspiration from http://youmightnotneedjquery.com/
  // so, (c) HubSpot, Inc.
  // https://github.com/HubSpot/youmightnotneedjquery/blob/gh-pages/LICENSE
  var hasClassList = document.body.classList,
      hasAddEvent = document.body.addEventListener;
  u.addClass = function addClass(node, name) {
    if (hasClassList) {
      node.classList.add(name);
    } else {
      node.className += ' ' + className;
    }
  };
  u.removeClass = function removeClass(node, name) {
    if (hasClassList) {
      node.classList.remove(name);
    } else {
      node.className = node.className.replace(new RegExp('(^|\\b)' +
                       className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
      }
  };
  u.toggleClass = function toggleClass(node, name) {
    if (hasClassList) {
      node.classList.toggle(name);
    } else {
      var classes = node.className.split(' ');
      var existingIndex = -1;
      for (var i = classes.length; i--;) {
        if (classes[i] === className)
          existingIndex = i;
      }
      if (existingIndex >= 0) {
        classes.splice(existingIndex, 1);
      } else {
        classes.push(className);
      }
      node.className = classes.join(' ');
    }
  };
  u.hasClass = function hasClass(node, className) {
    if (hasClassList) {
      return node.classList.contains(className);
    }
    else {
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(node.className);
    }
  };
  // eventListener also inspired by youmightnotneedjquery
  u.on = function on(node, eventName, handler) {
    if (hasAddEvent) {
      node.addEventListener(eventName, handler);
    } else {
      node.attachEvent('on' + eventName, function() {
        return handler.call(node);
      });
    }
  };

  // for convenience
  u.key = {
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    33: 'PAGEUP',
    34: 'PAGEDOWN',
    35: 'END',
    36: 'HOME',
    38: 'UP',
    40: 'DOWN'
  };

})(window.u || (window.u = {}));


// POLYFILLS

// String.trim, from MDN
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

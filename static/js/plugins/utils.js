;  // Map Kibera Schools | BSD License

(function exportUtils(u) {
  // easily iterate dom nodelists
  u.eachNode = function eachNode() {
    var $this = Array.prototype.shift.call(arguments);
    return Array.prototype.forEach.apply($this, arguments);
  };

  u.stop = function stopEvent(e) {
    // just even.preventDefault, but works in IE8
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      event.returnValue = false;  // yeah the global event obj. ie8 is weird.
    }
  }

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

})(window.u || (window.u = {}));

/*
 * SmoothScroll
 * Licence MIT
 * https://github.com/uniphil/smooth-scroll/
 * Originally Written by Gabriel Delépine
 */
(function initSmoothScroll(window, undefined) {
  'use strict';
  var headerOffset = 75, // For layout with header with position:fixed. Write here the height of your header for your anchor don't be hiden behind
      scrollDuration = 333,
      moveFrequency = 15; // Affects performance! High number makes scroll more smooth

  var registerTargets = function registerTargets(querySelectorExpr) {
    // first, make sure our targets actually have a targetable id
    var targetEls = document.querySelectorAll(querySelectorExpr),
        targetID,
        linksToTarget,
        link;
    for (var i=0; i<targetEls.length; i++) {
      targetID = targetEls[i].id;
      if (! targetID) {
        throw "ScrollTo cannot scroll to targets without IDs.";
      }

      linksToTarget = document.querySelectorAll('a[href="#' + targetID  + '"]');
      for (var j=0; j<linksToTarget.length; j++) {
        linksToTarget[j].onclick = startScroll;
      }
    }
  };

  var startScroll = function startScroll(fromLink) {
    var href = this.attributes.href.nodeValue.toString(),
        url = href.substr(0, href.indexOf('#')),
        id = href.substr(href.indexOf('#')+1),
        target = document.getElementById(id),
        startY = getCurrentScroll(),
        targetY = getTargetOffsetFromTop(target);

    window.isAutoScrolling = true;
    stepScroll(startY, targetY, moveFrequency);
    if(window.history && typeof window.history.pushState == 'function') {
      window.history.pushState({}, undefined, url+'#'+id);// Change URL for modern browser
    }
    return false;
  };

  var stepScroll = function scrollStep(startY, targetY, t) {
    if (scrollDuration - t < moveFrequency) {
      window.setTimeout(window.scrollTo, scrollDuration - t, 0, targetY)
      window.isAutoScrolling = false;
    } else {
      var normalized = t / scrollDuration;
      var eased = easingFunc(normalized);
      var realTarget = (targetY - startY) * eased + startY;
      window.scrollTo(0, realTarget);
      var nextT = t + moveFrequency;
      window.setTimeout(scrollStep, moveFrequency, startY, targetY, nextT);
    }
  };

  var easingFunc = function ease(x) {
    // take a value x between zero and one
    // returns another value y, where
    //   if x == 0, then y == 0
    //   if x == 1, then y == 1
    // this implementation uses a sine curve.
    var scaled_x = x * Math.PI;
    var curved = Math.cos(scaled_x);
    var scaled_y = -curved * 0.5;  // cos range is 1..-1
    var shifted_y = scaled_y + 0.5;
    return shifted_y;
  };

  var getTargetOffsetFromTop = function getTargetOffsetFromTop(e) {
    var top = headerOffset * -1;
    while (e.offsetParent != undefined && e.offsetParent != null) {
      top += e.offsetTop + (e.clientTop != null ? e.clientTop : 0);
      e = e.offsetParent;
    }
    return top;
  };

  var getCurrentScroll = function getCurrentScroll() {
    var top;
    if (window.pageYOffset !== undefined) {
      top = window.pageYOffset;
    } else {
      top = (document.documentElement || document.body.parentNode || document.body).scrollTop;
    }
    return top;
  };

  // export the function
  window.smoothScroll = registerTargets;
  // for kibera: also export the scroll calculations because they are useful
  window.targetFromTop = getTargetOffsetFromTop;
  window.viewportFromTop = getCurrentScroll;
  window.isAutoScrolling = false;

})(window);

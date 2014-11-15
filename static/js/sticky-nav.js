
(function initStickyNav() {
  var rootPath = window.location.pathname;
  var scrollTargetQuery = 'body > section';
  smoothScroll(scrollTargetQuery);
  var targetElsMaybe = document.querySelectorAll(scrollTargetQuery),
      targetEls = [];
  for (var i=0; i<targetElsMaybe.length; i++) {
    // check to see if it's in the header or not
    var id = targetElsMaybe[i].id;
    var headerLinkQuery = '#page-header .page-nav-links [href="' + rootPath + '#' + id + '"]';
    if (document.querySelector(headerLinkQuery)) {
      targetEls.push(targetElsMaybe[i]);
    }
  }
  var stickyNavContainer = document.querySelector('body > header');
  var throttle = 150;  // ms
  var lastCheck;

  u.on(window, 'scroll', function() {
    if (window.isAutoScrolling) {
      return;
    } else if (lastCheck && (new Date() - lastCheck) < throttle) {
      return;
    }
    var currentScroll = viewportFromTop(),
        closestTarget,
        closestTargetDistance = Infinity;
    for (var i=0; i<targetEls.length; i++) {
      var thisTarget = targetEls[i];
      var thisDistance = Math.abs(targetFromTop(thisTarget) - currentScroll);
      if (thisDistance < closestTargetDistance) {
        closestTarget = thisTarget;
        closestTargetDistance = thisDistance;
      }
    }
    var currentlySelected = stickyNavContainer.querySelector('.selected');
    var targetID = closestTarget && closestTarget.id;
    var navLinkEl = stickyNavContainer.querySelector('a[href="' + rootPath + '#' + targetID + '"]');
    if (navLinkEl !== currentlySelected) {
      currentlySelected && u.removeClass(currentlySelected, 'selected');
      u.addClass(navLinkEl, 'selected');
    }

    lastCheck = new Date();
  });
})();

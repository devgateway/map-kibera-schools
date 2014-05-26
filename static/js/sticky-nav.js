
(function initStickyNav() {
  var scrollTargetQuery = 'body > section';
  smoothScroll(scrollTargetQuery);
  var targetEls = document.querySelectorAll(scrollTargetQuery);
  var stickyNavContainer = document.querySelector('body > header');
  var throttle = 150;  // ms
  var lastCheck;

  u.on(window, 'scroll', function() {
    if (window.isAutoScrolling) {
      return;
    } else if (lastCheck && (new Date - lastCheck) < throttle) {
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
    var targetID = closestTarget.id;
    var navLinkEl = stickyNavContainer.querySelector('a[href="#' + targetID + '"]');
    if (navLinkEl !== currentlySelected) {
      u.removeClass(currentlySelected, 'selected');
      u.addClass(navLinkEl, 'selected');
    }

    lastCheck = new Date;
  });
})();

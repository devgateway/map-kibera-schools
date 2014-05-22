;

(function activateSlider() {
  var sliderContainer = document.getElementById('videos');
  if (!sliderContainer) { return; }  // fail fast

  function showSlide(slideAnchor, targetPager) {
    var showing = sliderContainer.querySelector('.videos-slider .selected'),
        toShow = sliderContainer.querySelector('.videos-slider ' + slideAnchor);
    if (toShow === showing) { return; }
    var showingPager = sliderContainer.querySelector('.videos-pager .selected');

    u.removeClass(showing, 'selected');
    u.removeClass(showingPager, 'selected');
    u.addClass(toShow, 'selected');
    u.addClass(targetPager, 'selected');
  }

  var pagers = sliderContainer.querySelectorAll('.videos-pager li > a');
  u.eachNode(pagers, function(node) {
    u.on(node, 'click', function(evt) {
      u.stop(evt);
      var targetSlideAnchor = evt.target.hash;
      showSlide(targetSlideAnchor, evt.target);
    });
  });
})();

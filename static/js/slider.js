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

  var slides = sliderContainer.querySelectorAll('.videos-slider .slide');
  u.eachNode(slides, function(node) {
    var vidActivator = node.querySelector('.video a');
    u.on(vidActivator, 'click', function(e) {
      if (!this.dataset.youtubeid) {
        return;  // not an embedded video, let what happens, happen.
      }
      u.stop(e);
      var videoID = this.dataset.youtubeid;
      if (! videoID) { return; }
      var vidMarkup = '<iframe width="600" height="338" src="//www.youtube.com/embed/' + videoID + '?rel=0&wmode=opaque&autoplay=1" frameborder="0" allowfullscreen></iframe>';
      vidActivator.innerHTML = vidMarkup;
      u.addClass(node, 'activated');
    });
  });
})();

;

(function mapControls() {
  console.log('hello');
  var controlsContainer = document.querySelector('#map .map-controls');
  if (!controlsContainer) { return; }  // fail fast
  console.log('did not quit');

  var controlLinks = controlsContainer.querySelectorAll('.controls > li > a');
  u.eachNode(controlLinks, function bindControlClick(node) {
    u.on(node, 'click', function toggleControl(evt) {
      u.stop(evt);
      u.toggleClass(node.parentNode, 'active')
    });
  });

})();

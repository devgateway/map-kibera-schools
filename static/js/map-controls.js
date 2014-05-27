;

(function mapControls() {
  var controlsContainer = document.querySelector('#map .map-controls');
  if (!controlsContainer) { return; }  // fail fast

  var controlLinks = controlsContainer.querySelectorAll('.controls > li > a');
  u.eachNode(controlLinks, function bindControlClick(node) {
    if (! u.startsWith(node.getAttribute('href'), '#')) {
      return;
    }
    u.on(node, 'click', function toggleControl(evt) {
      u.stop(evt);
      u.toggleClass(node.parentNode, 'active')
    });
  });

  // quick search functionality for schools browse
  (function schoolQuickSearch(listNode) {
    var nameNodes = listNode.children;
    var namesMap = u.mapNodes(nameNodes, function mapNames(node) {
      var name = node.textContent.toLowerCase();
      return {'name': name,
              'node': node}
    });
    var searchInput = controlsContainer.querySelector('.school-list > input');
    u.on(searchInput, 'keyup', function liveFilterSchools(evt) {
      var startsWith = searchInput.value.toLowerCase();
      namesMap.forEach(function filterSchool(school) {
        if (u.startsWith(school.name, startsWith)) {
          u.removeClass(school.node, 'hidden');
        } else {
          u.addClass(school.node, 'hidden');
        }
      })
    });
  })(controlsContainer.querySelector('.school-list > ul'));

})();

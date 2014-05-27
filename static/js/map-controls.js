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

    function simplify(str) {
      lowered = str.toLowerCase();
      unspecialed = lowered.replace(/[^a-z]/g, '');
      return unspecialed;
    }

    var nameNodes = listNode.children;
    var namesMap = u.mapNodes(nameNodes, function mapNames(node) {
      var name = simplify(node.textContent || el.innerText);
      return {'name': name,
              'node': node}
    });
    console.log(namesMap);
    var searchInput = controlsContainer.querySelector('.school-list > input');
    u.on(searchInput, 'keyup', function liveFilterSchools(evt) {
      var startsWith = simplify(searchInput.value);
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

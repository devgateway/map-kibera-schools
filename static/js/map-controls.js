;

(function drawMaps() {

  var mapEl,
      data = { 'features': [] };

  if (mapEl = document.getElementById('main-map')) {
    map = drawMap(mapEl);
    domLoadSchoolDataAll();
    pinAllSchools(map);
  } else if (mapEl = document.getElementById('school-map')) {
    map = drawMap(mapEl);
    pinSchool(map);
  } else {
    return;
  }

  function getJSON(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function gotGet() {
      if (request.status >= 200 && request.status < 400) {
        data = JSON.parse(request.responseText);
        callback(data);
      } else {
        console.error('GET failed for url ' + url +
                      '; not running callback ' + callback);
      }
    };
    request.send();
  }

  function drawMap(mapEl) {
    var mapOptions = {
      center: [-1.313, 36.788],
      zoom: 15,
      scrollWheelZoom: false
    };
    var map = L.map(mapEl, mapOptions);
    // todo: switch back to custom tile styles, but base them on HOT.
    L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(map)
    return map;
  }

  function domLoadSchoolDataAll() {
    var geoSchool,
        schoolEls = document.querySelectorAll('#schools .school-list > ul > li > a');
    u.eachNode(schoolEls, function loadSchoolData(node) {
      geoSchool = {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [parseFloat(node.dataset.lat), parseFloat(node.dataset.lng)]
        },
        'properties': {
          'name': (node.textContent || el.innerText).trim(),
          'href': node.getAttribute('href'),
          'browseNode': node,
        }
      };
      data.features.push(geoSchool);
    });
  }

  function pinAllSchools(map) {
    function pinPopup(feature, layer) {
      var href = feature.properties.href,
          name = feature.properties.name;
      var popupContent = '<h3><a href="' + href + '">' + name + '</a></h3>';
      layer.bindPopup(popupContent);
    }
    L.geoJson(data, {onEachFeature: pinPopup}).addTo(map);
  }

  function pinSchool(map) {
    var location = school.geometry.coordinates[0].reverse();
    map.setView([location[0] + 0.0003, location[1]], 18);
    L.marker(location).addTo(map);
  }

  // exports
  window.geoData = data;

})();


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
      var currentlySelected = controlsContainer.querySelector('.active');
      if (currentlySelected && currentlySelected !== node.parentNode) {
        u.removeClass(currentlySelected, 'active');
      }
      u.toggleClass(node.parentNode, 'active');
    });
  });
  u.on(window, 'keypress', function(e) {
    if (e.keyCode === 27) {  // ESC
      var currentlySelected = controlsContainer.querySelector('.active');
      if (currentlySelected) {
        u.removeClass(currentlySelected, 'active');
      }
    }
  });

  // quick search functionality for schools browse
  (function schoolQuickSearch(listNode) {

    var nameNodes = listNode.children;
    var namesMap = u.mapNodes(nameNodes, function mapNames(node) {
      var name = u.simplify(node.textContent || el.innerText);
      return {'name': name,
              'node': node}
    });
    var searchInput = controlsContainer.querySelector('.school-list > input');
    u.on(searchInput, 'keyup', function liveFilterSchools(evt) {
      var startsWith = u.simplify(searchInput.value);
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

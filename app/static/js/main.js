
// draw a map
(function drawMap(mapEl) {
  if (!mapEl) {
    return;
  }

  L.Icon.Default.imagePath = STATIC_ROOT + 'img/leaflet';

  var mapOptions = {
    center: [-1.315, 36.785],
    zoom: 13,
    scrollWheelZoom: false
  };
  var map = L.map(mapEl, mapOptions);

  function getData(callback) {
    var request = new XMLHttpRequest();
    request.open('GET', '/schools.geojson', true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        data = JSON.parse(request.responseText);
        callback(data);
      } else {
        console.log('error ' + request.status + ' while getting data');
      }
    }

    request.send()
  }

  getData(function(data) {
    L.geoJson(data).addTo(map);
  })

})(document.getElementById('map'));


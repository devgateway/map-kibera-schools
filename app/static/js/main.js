
// draw a map
(function drawMap(mapEl) {
  if (!mapEl) {
    return;
  }

  L.Icon.Default.imagePath = STATIC_ROOT + 'img/leaflet';

  var mapOptions = {
    center: [-1.313, 36.788],
    zoom: 15,
    scrollWheelZoom: false
  };
  var map = L.map(mapEl, mapOptions);

  L.tileLayer(STATIC_ROOT + 'tiles/{z}/{x}/{y}.png')
    .addTo(map);

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

  var geoData;
  getData(function(data) {
    geoData = L.geoJson(data, {
      onEachFeature: function(feature, layer) {
        layer.bindPopup(feature.properties.official_name);
      }
    }).addTo(map);
  })

})(document.getElementById('map'));


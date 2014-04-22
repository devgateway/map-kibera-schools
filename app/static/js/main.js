
// draw a map
(function drawMap(mapEl) {
  if (!mapEl) {
    return;
  }
  var kiberaCentre = [-1.315, 36.785];
  var map = L.map('map').setView(kiberaCentre, 13);
})(document.getElementById('map'));


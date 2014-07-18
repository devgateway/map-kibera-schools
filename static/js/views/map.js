app.views.Map = Backbone.View.extend({

  initialize: function() {
    var map = L.map(this.el, {scrollWheelZoom: false});
    map.setView(app.config.map.centre, app.config.map.zoom);
    var tiles = L.tileLayer(app.config.map.tiles);
    tiles.addTo(map);
    this.map = map;
  },

  pinSchool: function(school) {
    new app.views.SchoolPin({
      model: school,
      map: this.map
    });
  }

});

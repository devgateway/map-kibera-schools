App.views.Map = Backbone.View.extend({
  initialize: function() {
    this.map = this.createMap();
    this.collection = schools;
    this.collection.each(_.bind(this.pinSchool, this));
    this.listenTo(this.collection, 'add', this.pinSchool);
  },

  createMap: function() {
    map = L.map(this.el, {scrollWheelZoom: false});
    map.setView([-1.313, 36.788], 15);
    var tiles = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png');
    tiles.addTo(map);
    return map;
  },

  pinSchool: function(school) {
    new SchoolPin({
      model: school,
      map: this.map
    });
  }
});

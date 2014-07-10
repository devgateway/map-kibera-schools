App.views.MappedSchool = Backbone.View.extend({

  template: _.template('<h3><a href="#"><%= name %></h3>'),

  initialize: function(opts) {
    this.map = opts.map;
    this.marker = this.createMarker();
    this.listenTo(this.model, 'change:excluded', this.excluded);
    this.excluded();
    this.marker.addTo(this.map);
  },

  createMarker: function() {
    var marker = L.marker(this.model.get('locations')[0].reverse());
    marker.bindPopup(this.template(this.model.attributes));
    return marker;
  },

  excluded: function() {
    if (this.model.get('excluded')) {
      this.marker.setOpacity(0.2);
      // this.map.removeLayer(this.marker);
    } else {
      this.marker.setOpacity(1);
      // this.map.addLayer(this.marker);
    }
  }
});

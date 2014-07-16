app.views.SchoolPin = Backbone.View.extend({

  popupTemplate: _.template(
    '<h3><a href="/schools/<%= slug %>/"><%= name %></a></h3>' +
    '<% if(edType || opType) { %>' +
    '  <p><%= edType %><%= (edType && opType) ? " / " : " " %><%= opType %></p>' +
    '<% } %>'),

  initialize: function(opts) {
    this.map = opts.map;
    var locations = this.model.get('locations')
    this.locations = { osm: locations[0].reverse() };
    this.locations.kenyaopendata = locations[1] && locations[1].reverse();

    this.marker = L.circleMarker(this.locations.osm, app.config.marker.radius);
    this.marker.addTo(this.map);

    this.marker.bindPopup(this.popupTemplate(this.templatable()));
  },

  templatable: function() {
    // TODO: use cleaned-up values from new mappings
    var attrs = this.model.attributes;
    return {
      name: attrs['name'],
      slug: attrs['slug'],
      edType: attrs['osm:education:type'],
      opType: attrs['osm:operator:type']
    };
  }

});

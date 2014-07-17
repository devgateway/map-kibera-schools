app.views.SchoolPin = Backbone.View.extend({

  popupTemplate: _.template(
    '<h3><a href="/schools/<%= slug %>/"><%= name %></a></h3>' +
    '<% if(edType || opType) { %>' +
    '  <p><%= edType %><%= (edType && opType) ? " / " : " " %><%= opType %></p>' +
    '<% } %>' +
    '<p><a href="/schools/<%= slug %>/">Go to School Profile →</a></p>'),

  initialize: function(opts) {
    this.map = opts.map;
    var locations = this.model.get('locations')
    this.locations = { osm: locations[0].reverse() };
    this.locations.kenyaopendata = locations[1] && locations[1].reverse();

    this.marker = L.circleMarker(this.locations.osm, {
      color: '#75b81b',
      opacity: 0.9,
      weight: 6,
      fillOpacity: 0.667,
      radius: app.config.marker.radius
    });
    this.marker.addTo(this.map);

    this.marker.bindPopup(this.popupTemplate(this.templatable()));

    this.listenTo(this.model, 'change:excluded', this.updateExcluded);
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
  },

  updateExcluded: function(thing, excluded) {
    if (excluded) {
      this.marker.setStyle({
        // color: '#222',
        weight: 2,
        opacity: 0.4,
        fillOpacity: 0
      });
    } else {
      this.marker.setStyle({
        weight: 6,
        opacity: 0.9,
        fillOpacity: 0.667
      });
    }
  }

});

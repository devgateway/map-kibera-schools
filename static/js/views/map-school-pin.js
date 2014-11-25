app.views.SchoolPin = Backbone.View.extend({

  popupTemplate: _.template(
    '<h3><a href="/schools/<%= slug %>/"><%= name %></a></h3>' +
    '<% if(edType || opType) { %>' +
    '  <p><%= edType %><%= (edType && opType) ? " / " : " " %><%= opType %></p>' +
    '<% } %>' +
    '<p><a href="/schools/<%= slug %>/">Go to School Profile →</a></p>'),

  initialize: function(opts) {
    this.map = opts.map;
    var locations = this.model.get('locations');
    this.locations = { osm: locations[0].reverse() };
    this.locations.kenyaopendata = locations[1] && locations[1].reverse();

    if (opts.popupTemplate) {
      this.popupTemplate = opts.popupTemplate;
    }

    this.marker = L.circleMarker(this.locations.osm, {
      color: '#75b81b',
      opacity: 0.9,
      weight: 6,
      fillOpacity: 0.667,
      radius: app.config.marker.radius
    });
    this.marker.addTo(this.map);

    this.listenTo(this.marker, 'mouseover', this.cursor);
    this.listenTo(this.marker, 'mouseout', this.uncursor);
    this.listenTo(this.marker, 'click', this.select);

    this.popup = L.popup()
      .setLatLng(this.locations.osm)
      .setContent(this.popupTemplate(this.templatable()));

    this.listenTo(this.model, 'change:cursored', this.updateCursored);
    this.listenTo(this.model, 'change:selected', this.updateSelected);
    this.listenTo(this.model, 'change:excluded', this.updateExcluded);
    this.listenTo(this.model, 'change:location', this.updateLocation);
  },

  templatable: function() {
    // TODO: use cleaned-up values from new mappings
    var attrs = this.model.attributes;
    return {
      name: attrs['name'],  // jshint ignore:line
      slug: attrs['slug'],  // jshint ignore:line
      edType: attrs['osm:education:type'],
      opType: attrs['osm:operator:type']
    };
  },

  cursor: function() {
    if (this.model.collection) {
      this.model.collection.updateCursored(this.model);
    }
  },

  uncursor: function() {
    this.model.set('cursored', false);
  },

  updateCursored: function(myModel, cursored) {
    if (cursored) {
      this.marker.setStyle({
        color: '#f8ad32'
      }).bringToFront();
    } else {
      this.marker.setStyle({
        color: '#75b81b'
      });
    }
  },

  select: function() {
    if (this.model.collection) {
      this.model.collection.updateSelected(this.model);
    } else {
      this.model.set('selected', true);
      this.updateSelected();
    }
  },

  updateSelected: function(myModel, selected) {
    if (selected === void 0) { selected = this.model.get('selected'); }
    if (! selected) {
      return;
    }
    this.map.openPopup(this.popup);
    this.marker.bringToFront();
  },

  updateExcluded: function(thing, excluded) {
    if (excluded) {
      this.marker.setStyle({
        // color: '#222',
        weight: 2,
        opacity: 0.4,
        fillOpacity: 0
      }).bringToBack();
    } else {
      this.marker.setStyle({
        weight: 6,
        opacity: 0.9,
        fillOpacity: 0.667
      }).bringToFront();
    }
  },

  updateLocation: function() {
    if (this.model.get('location') > this.model.get('locations').length - 1) {
      return;  // we don't have a location for that data source
    }
    this.marker.setLatLng(this.model.get('locations')[this.model.get('location')]);
    this.popup.setLatLng(this.model.get('locations')[this.model.get('location')]);
    this.updateSelected();
  }

});

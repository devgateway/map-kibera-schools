app.views.Map = Backbone.View.extend({

  initialize: function() {
    var map = L.map(this.el, {scrollWheelZoom: false});
    map.setView(app.config.map.centre, app.config.map.zoom);
    var tiles = L.tileLayer(app.config.map.tiles);
    tiles.addTo(map);
    map.on('click', function() {
      app.view.mapfilters && app.view.mapfilters.filters.collapseAll();
    });
    this.map = map;
  },

  pinSchool: function(school, opts) {
    var pinOptions = {
      model: school,
      map: this.map
    };
    if (opts.feature) {
      pinOptions.popupTemplate = _.template(
        '<h3><%= name %></h3>' +
        '<% if(edType || opType) { %>' +
        '  <p><%= edType %><%= (edType && opType) ? " / " : " " %><%= opType %></p>' +
        '<% } %>' +
        '<div class="share">' +
          '<a href="https://twitter.com/share" class="twitter-share-button" data-url="http://schools.mapkibera.org/schools/{{ school.slug }}">Tweet</a>' +
          '<div class="fb-like" data-href="http://schools.mapkibera.org/schools/{{ school.slug }}" data-width="80" data-layout="button_count" data-action="like" data-show-faces="false" data-share="false"></div>' +
        '</div>');
    }
    return new app.views.SchoolPin(pinOptions);
  }

});

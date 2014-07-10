;

var HEAVY_TIMEOUT = 85; // ms, for debounce and throttle calls





var Filter = Backbone.Model.extend({
  parse: function(data) {
    data.options = new FilterOptions(data.options);
    return data;
  }
});


var FilterOption = Backbone.Model.extend({});


var Filters = Backbone.Collection.extend({
  url: '/_filters.json',
  model: Filter
});


var FilterOptions = Backbone.Collection.extend({
  model: FilterOption
});







var SchoolsMap = Backbone.View.extend({
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


//////// stats stuff

var SchoolsStatsContainer = Backbone.View.extend({

});

var SchoolsStat = Backbone.View.extend({

})


//////////// init

var schools = new Schools();  // globally available
var fields = new SchoolFields();


var mapControls = new MapControls({
  el: $('.map-controls .controls'),
  collection: new Filters()
});
mapControls.collection.fetch().then(function() {
  mapControls.render();
});

var schoolsMap = new SchoolsMap({el: $('#main-map')});


////// init stats stuff

var studentsStat = new SchoolsStat({
  key: 'total_students'
});

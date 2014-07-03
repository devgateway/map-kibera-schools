;

var School = Backbone.Model.extend({
    initialize: function() {
      this.set('fuzzyScore', 0);
      this.set('excluded', false);
    }
});


var Schools = Backbone.Collection.extend({
  url: '/_schools.json',  // app-optimized version of the standard
                         // `schools.geojson` so that we can do less work.
  model: School,
  comparator: function(a, b) {
    var fa = a.get('fuzzyScore'),
        fb = b.get('fuzzyScore');
    if (fa != fb) {
      return fa < fb ? -1 : 1;
    } else {
      var na = a.get('name'),
          nb = b.get('name');
      return na === nb ? 0 : (na < nb ? -1 : 1);
    }
  },

  initialize: function() {
    this.fetch();
  }
});


var ListedSchool = Backbone.View.extend({
  tagName: 'li',
  template: _.template('<a href="/schools/<%= slug %>"><%= name %></a>'),

  initialize: function() {
    this.model.on('change:fuzzyScore', this.updatedScore, this);
  },

  updatedScore: function() {
    var excluded = this.model.get('fuzzyScore') > 3;
    this.model.set('excluded', excluded);
    if (excluded) {
      this.$el.addClass('hidden');
    } else {
      this.$el.removeClass('hidden');
    }
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});


var QuickSearchWidget = Backbone.View.extend({

  tagName: 'li',

  id: 'schools',

  comparator: 'fuzzyScore',

  template: _.template('<a href="#schools">Schools List</a>' +
                       '<div class="map-inputs school-list">' +
                       '  <input id="school-dir-search" type="text" ' +
                       '         name="school-dir-search" placeholder="Quick Search" />' +
                       '  <ul></ul>' +
                       '</div>'),

  events: {
    'click a': 'activate',
    'keyup input': 'fuzzySearch',
    'change input': 'fuzzySearch'
  },

  initialize: function() {
    this.schoolNames = [];
    this.collection.each(_.bind(this.schoolAdded, this));
    this.collection.on('add', this.schoolAdded, this);
    this.collection.on('sort', this.renderList, this);
  },

  schoolAdded: function(school) {
    var schoolSimpleName = this._simplify(school.get('name'));
    this.schoolNames.push({name: schoolSimpleName,
                           school: school});
  },

  render: function() {
    this.$el.html(this.template());
    this.renderList();
    return this;
  },

  renderList: _.throttle(function() {
    var listContent = $('<ul>');
    this.collection.each(function(school) {
      var schoolView = new ListedSchool({model: school});
      listContent.append(schoolView.render().el);
    });
    this.$('ul').html(listContent.html());
  }, 200),

  _simplify: function(str) {
    lowered = str.toLowerCase();
    unspecialed = lowered.replace(/[^a-z]/g, '');
    return unspecialed;
  },

  fuzzySearch: _.debounce(function() {
    var key = this._simplify(this.$('input').val());
    var simplify = this._simplify;  // ref for the loop

    _.each(this.schoolNames, function(simpleName) {

      if (simpleName.name.length - key.length < 0) {
        key = key.slice(0, simpleName.name.length);
      }
      var nameSubstr = simpleName.name.slice(0, key.length);

      var score = Levenshtein.get(nameSubstr, key);

      // prefer names that start with the first letter of the key
      var score = score - u.startsWith(simpleName.name, key.slice(0, 1));

      simpleName.school.set('fuzzyScore', score);
    });

    this.collection.sort();

  }, 200),

  activate: function(e) {
    e.preventDefault();
    this.$el.toggleClass('active');
    if (this.$el.hasClass('active')) {
      this.$('input').focus();
    };
  },

  keyNav: function() {
    console.log('nav nav nav');
  }
});


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


var SelectWidget = Backbone.View.extend({

  tagName: 'li',

  template: _.template('<label>' +
                       '  <span class="visually-hidden"><%= name %></span>' +
                       '  <select>' +
                       '    <option name="unset"><%= name %></option>' +
                       '  </select>' +
                       '</label>'),

  events: {
    'change select': 'select'
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    var optionSelect = this.$('select');
    this.model.get('options').each(function(option) {
      var optionView = new SelectOptionView({model: option});
      optionSelect.append(optionView.render().el);
    });
    return this;
  },

  select: function() {
    console.log('wooo selection ch-ch-changed', this);
  }
});


var SelectOptionView = Backbone.View.extend({
  tagName: 'option',
  attributes: function() {
    return {'value': this.model.get('id')};
  },
  render: function() {
    this.$el.text(this.model.get('name'));
    return this;
  }
});


var MapControls = Backbone.View.extend({
  render: function() {
    var container = this.$el;
    this.collection.each(function(filter) {
      var widgetName = filter.get('widget');
      if (widgetName === 'select') {
        var filterView = new SelectWidget({model: filter});
      } else if (widgetName === 'fuzzy-search') {
        var filterView = new QuickSearchWidget({collection: schools});
      } else {
        throw 'Unknown filter widget: ' + filter.get('widget');
      }
      container.prepend(filterView.render().el);
    });
    return this;
  }
});


var SchoolPin = Backbone.View.extend({

  template: _.template('<h3><a href="#"><%= name %></h3>'),

  initialize: function(opts) {
    this.map = opts.map;
    this.marker = this.createMarker();
    this.model.on('change:excluded', _.bind(this.excluded, this));
    this.excluded();
    this.marker.addTo(this.map);
  },

  createMarker: function() {
    var marker = L.marker(this.model.get('locations')[0].reverse());
    marker.bindPopup(this.template(this.model.toJSON()));
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


var SchoolsMap = Backbone.View.extend({
  initialize: function() {
    this.map = this.createMap();
    this.collection = schools;
    this.collection.each(_.bind(this.pinSchool, this));
    this.collection.on('add', this.pinSchool, this);
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



//// init stuff

L.Icon.Default.imagePath = WEB_ROOT + 'static/img/leaflet';


var schools = new Schools();  // globally available


var mapControls = new MapControls({
  el: $('.map-controls .controls'),
  collection: new Filters()
});
mapControls.collection.fetch().then(function() {
  mapControls.render();
});

var schoolsMap = new SchoolsMap({el: $('#main-map')});

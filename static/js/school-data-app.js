;

var HEAVY_TIMEOUT = 85; // ms, for debounce and throttle calls
var KEY_UP = 38,
    KEY_DOWN = 40;

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

  initialize: function() {
    this.fetch();
    this.on('change:selected', this.updateSelected);
  },

  updateSelected: function() {
    console.log('selection updated.');
  },

  comparator: function(a, b) {
    var fa = a.get('fuzzyScore'),
        fb = b.get('fuzzyScore');
    if (fa !== fb) {
      return fa < fb ? -1 : 1;
    } else {
      var na = a.get('name'),
          nb = b.get('name');
      return na === nb ? 0 : (na < nb ? -1 : 1);
    }
  }
});


var ListedSchool = Backbone.View.extend({
  tagName: 'li',
  template: _.template('<a href="/schools/<%= slug %>"><%= name %></a>'),

  events: {
    'mouseover >a': 'hover'
  },

  initialize: function() {
    this.listenTo(this.model, 'change:fuzzyScore', this.updatedScore);
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
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

  hover: function() {
    this.model.set('selected', true);
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
    'click >a': 'activate',
    'keyup input': 'fuzzySearch',
    'change input': 'fuzzySearch',
    'keydown': 'keyNav',
  },

  initialize: function() {
    this.schoolNames = [];
    this.schoolItemEls = {};  // model.cid: ListedSchool(model).el

    this.listSelect = new Backbone.Model({
      index: 0,
      listEl: undefined
    });
    this.listenTo(this.listSelect, 'change:index', this.changeIndex);
    this.listenTo(this.listSelect, 'change:listEl', this.changeSelected);

    this.collection.each(this.schoolAdded, this);
    this.listenTo(this.collection, 'add', this.schoolAdded);
    this.listenTo(this.collection, 'sort', this.renderList);
  },

  render: function() {
    this.$el.html(this.template());
    this.renderList();
    return this;
  },

  renderList: _.throttle(function() {
    var schoolItemEls = this.schoolItemEls,
        sortedSchools = [];
    this.collection.each(function(school) {
      var schoolListItemViewEl = schoolItemEls[school.cid];
      sortedSchools.push(schoolListItemViewEl);
    });
    this.$('ul').html(sortedSchools);
  }, HEAVY_TIMEOUT),

  schoolAdded: function(school) {
    // map simplified names to models for quick fuzzy matching
    var schoolSimpleName = this._simplify(school.get('name'));
    this.schoolNames.push({name: schoolSimpleName,
                           school: school});
    // map model ids to view els for quick reordering
    var schoolListItemViewEl = new ListedSchool({model: school}).render().el;
    this.schoolItemEls[school.cid] = schoolListItemViewEl;
  },

  _simplify: function(str) {
    lowered = str.toLowerCase();
    unspecialed = lowered.replace(/[^a-z]/g, '');
    return unspecialed;
  },

  fuzzySearch: _.debounce(function() {
    var key = this._simplify(this.$('input').val());
    _.each(this.schoolNames, function(simpleName) {
      if (simpleName.name.length - key.length < 0) {
        key = key.slice(0, simpleName.name.length);
      }
      var nameSubstr = simpleName.name.slice(0, key.length);
      var score = Levenshtein.get(nameSubstr, key);
      // prefer names that start with the first letter of the key
      var score = score - +u.startsWith(simpleName.name, key.slice(0, 1));
      simpleName.school.set('fuzzyScore', score);
    });
    this.collection.sort();
  }, HEAVY_TIMEOUT),

  activate: function(e) {
    e.preventDefault();
    this.$el.toggleClass('active');
    if (this.$el.hasClass('active')) {
      this.$('input').focus();
    };
  },

  keyNav: function(e) {
    var pressed = e.keyCode;
    if (pressed !== KEY_UP && pressed !== KEY_DOWN) {
      return;
    }
    e.preventDefault();
    if (pressed === KEY_UP) {

    } else if (pressed === KEY_DOWN) {

    }
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
  className: 'hidden',

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
    this.$el.html(this.template(this.model.attributes));
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

  template: _.template('<h3><a href="/schools/<%= slug %>"><%= name %></a></h3>' +
                       '<p><a href="/schools/<%= slug %>">Go to school profile →</a></p>'),

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


var schools = new Schools();  // globally available


var mapControls = new MapControls({
  el: $('.map-controls .controls'),
  collection: new Filters()
});
mapControls.collection.fetch().then(function() {
  mapControls.render();
});

var schoolsMap = new SchoolsMap({el: $('#main-map')});

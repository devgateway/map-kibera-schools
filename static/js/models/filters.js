app.models.School = Backbone.Model.extend({

  defaults: {
    _filterScore: 1,  // filters write to this
    excluded: false  // other things watch/read this.
  }

});

app.models.Schools = Backbone.Collection.extend({

  url: '/_schools.json',  // app-optimized version of the standard
                          // `schools.geojson` so that we can do less work.

  comparator: function(a, b) {
    var scoreA = a.get('_filterScore'),
        scoreB = b.get('_filterScore');
    if (scoreA !== scoreB) {
      return scoreA > scoreB ? 1 : -1;
    } else {
      var nameA = a.get('name'),
          nameB = b.get('name');
      if (nameA !== nameB) {
        return nameA > nameB ? 1 : -1;
      } else {
        return 0;
      }
    }
  },

  model: app.models.School,

  initialize: function() {
    this.fetch();
    this.listenTo(this, 'change:_filterScore', this._updateExcluded);
  },

  _updateExcluded: function(school, newFilterScore) {
    if (newFilterScore > 0) {
      school.set('excluded', false);
    } else {
      school.set('excluded', true);
    }
  },

  notExcluded: function() {
    return this.filter(function(school) {
      return school.get('_filterScore') > 0;
    });
  }

});


var Filter = Backbone.Model.extend({
  // has a ref to the FilterMatchCollection
  //  -> creates an array of things to exclude
  //  -> matchCollection.remove that array
  defaults: {
    value: undefined,
  },

  setMatchables: function(matchCollection) {
    this.matchCollection = matchCollection;
  },

  clear: function() {
    this.set('value', undefined);
  }
});


var SelectFilterOption = Backbone.Model.extend({
  // Filter is a collection of these?
  // value: 'primary',  // auto-gen when loading from data
  // things: []  // schools
  defaults: {
    selected: false
  },

  initialize: function() {
    this.schools = new Backbone.Collection();
  },

  countNotExcluded: function() {
    return app.models.Schools.prototype.notExcluded.call(this.schools).length;
  }

});


var SelectFilterOptions = Backbone.Collection.extend({
  model: SelectFilterOption,
  comparator: function(a, b) {
    return app.models.Schools.prototype.comparator.call(this, a, b);
  }
});


app.models.SelectFilter = Filter.extend({
  workToCompute: 1,

  initialize: function(options) {
    this.key = options.key;
    var schools = options.schools;

    this.options = new SelectFilterOptions();

    schools.each(this.addSchool);
    this.listenTo(schools, 'add', this.addSchool);
  },

  addSchool: function(school) {
    var rawValue = school.get(this.key);

    // TODO: accept actual JSON instead of ad-hoc splitting here
    var optionValues = (rawValue && rawValue.split(',') || [undefined]);

    _.each(optionValues, function(optionValue) {
      var selectOption = this.options.find(function(opt) {
        return opt.get('optionValue') === optionValue;
      });
      if (! selectOption) {
        selectOption = new SelectFilterOption({
          optionValue: optionValue
        });
        this.options.add(selectOption);
      }
      selectOption.schools.add(school);
    }, this);

  }

});


var Filters = Backbone.Collection.extend({

  comparator: 'workToCompute',  // so we can run the cheap filters first

  setMatchables: function(matchCollection) {
    this.each(function(filter) { filter.setMatchables(matchCollection); });
  }

});

app.models.School = Backbone.Model.extend({

  defaults: {
    _filterScore: 1,  // filters write to this
    excluded: false,  // other things watch/read this.
    selected: false  // only one should be selected at a time
  }

});

app.models.Schools = Backbone.Collection.extend({

  url: '/_schools.json',  // app-optimized version of the standard
                          // `schools.geojson` so that we can do less work.

  comparator: 'name',

  model: app.models.School,

  initialize: function() {
    this.fetch();
    this.listenTo(this, 'change:_filterScore', this._updateExcluded);
  },

  _updateExcluded: function(school, newFilterScore) {
    if (newFilterScore > 0) {
      school.set({excluded: false});
    } else {
      school.set({excluded: true});
    }
  },

  notExcluded: function() {
    return this.filter(function(school) {
      return school.get('_filterScore') > 0;
    });
  }

});

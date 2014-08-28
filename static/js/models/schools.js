app.models.School = Backbone.Model.extend({

  defaults: {
    _filterScore: 1,  // filters write to this
    excluded: false,  // other things watch/read this.
    cursored: false,  // only one should be cursored at a time
    selected: false  // only one should be selected at a time
  }

});

app.models.Schools = Backbone.Collection.extend({

  url: '/app/schools.json',  // app-optimized version of the standard
                          // `schools.geojson` so that we can do less work.

  comparator: 'name',

  model: app.models.School,

  initialize: function() {
    this.fetch();
    this.listenTo(this, 'change:_filterScore', this._updateExcluded);
    this.listenTo(this, 'cursorme', this.updateCursored);
    this.listenTo(this, 'selectme', this.updateSelected);
  },

  updateSelected: function(newOption) {
    this.selectedOption && this.selectedOption.set('selected', false);
    this.selectedOption = newOption;
    newOption && newOption.set('selected', true);
  },

  updateCursored: function(newOption) {
    this.cursoredOption && this.cursoredOption.set('cursored', false);
    this.cursoredOption = newOption;
    newOption && newOption.set('cursored', true);
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

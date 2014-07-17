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
      school.set({excluded: false});
    } else {
      school.set({excluded: true});
    }
    // console.log(school);
  },

  notExcluded: function() {
    return this.filter(function(school) {
      return school.get('_filterScore') > 0;
    });
  }

});

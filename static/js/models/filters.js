
app.models.Filters = Backbone.Collection.extend({

  comparator: 'workToCompute',  // so we can run the cheap filters first

  initialize: function(opts) {
    // this.schools = opts.schools;
    this.listenTo(this, 'filterchange', this.filterChange);
  },

  filterChange: function() {
    this.schools.each(function(school) {
      var score = 1;
      this.each(function(filter) {
        if (score <= 0) return;
        score -= filter.scoreSchool(school);
      });
      school.set('_filterScore', score);
    }, this);
    // let all the filters know that the filters have updated
    this.each(function(filter) {
      filter.trigger('filtersupdated');
    });
  },

  collapseAll: function() {
    _(this.models).each(function(filter) {
      filter.set('expanded', false);
    });
  }

});

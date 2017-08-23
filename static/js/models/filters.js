
app.models.Filters = Backbone.Collection.extend({

  comparator: 'workToCompute',  // so we can run the cheap filters first

  initialize: function(opts) {
    // this.schools = opts.schools;
    this.listenTo(this, 'filterchange', this.filterChange);
    this.listenTo(this, 'locationchange', this.locationChange);
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

  locationChange: function(location) {
    if (location === "deselected" || !app.config[location]) {
        this.map.map.flyTo(app.config.map.centre, app.config.map.zoom);
    } else {
        this.map.map.flyTo(
            app.config[location].centre, 
            app.config[location].zoom, 
            {animate: true});
    }
  },

  updateScore: function() {
    lower_x = this.map.map.getBounds()['_southWest']['lat'];
    lower_y = this.map.map.getBounds()['_southWest']['lng'];
    upper_x = this.map.map.getBounds()['_northEast']['lat'];
    upper_y = this.map.map.getBounds()['_northEast']['lng'];
    this.schools.each(function(school) {
      x = school['attributes']['locations'][0][0];
      y = school['attributes']['locations'][0][1];
      if (x < lower_x || y < lower_y || x > upper_x || y > upper_y) {
        school.set('mapScore', 0);
      } else {
        school.set('mapScore', 1);
      }
    }, this);
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

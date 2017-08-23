app.views.MapFilters = Backbone.View.extend({

  initialize: function(opts) {

    var locationFilter = new app.models.SelectFilter({
      name: 'Location',
      key: 'osm:location',
      schools: opts.schools,
      capitalize: 'normal'
    });

    var schoolQuickSearch = new app.models.QuickSearchFilter({
      name: 'School Name',
      key: 'name',
      schools: opts.schools
    });

    var edLevelFilter = new app.models.SelectFilter({
      name: 'Education Level',
      key: 'osm:education:type',
      schools: opts.schools,
      capitalize: 'normal'
    });

    var schoolTypeFilter = new app.models.SelectFilter({
      name: 'School Sponsor',
      key: 'osm:operator:type',
      schools: opts.schools,
      capitalize: 'abbr'
    });

    this.filters = new app.models.Filters([
      locationFilter,
      schoolQuickSearch,
      edLevelFilter,
      schoolTypeFilter
    ]);
    this.filters.schools = opts.schools;
    this.filters.map = opts.map;
    this.filters.listenTo(this.filters.map.map, 'moveend', this.filters.updateScore);

    this.locationWidget = new app.filterWidgets.Select({ model: locationFilter });
    this.quickSearchWidget = new app.filterWidgets.QuickSearch({ model: schoolQuickSearch });
    this.edLevelWidget = new app.filterWidgets.Select({ model: edLevelFilter });
    this.schoolTypeWidget = new app.filterWidgets.Select({ model: schoolTypeFilter});

  },

  render: function() {
    var renderedWidgets = [
      this.locationWidget.render().el,
      this.quickSearchWidget.render().el,
      this.edLevelWidget.render().el,
      this.schoolTypeWidget.render().el
    ];
    this.$el.prepend(renderedWidgets);
    return this;
  }
});

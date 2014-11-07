app.views.MapFilters = Backbone.View.extend({

  initialize: function(opts) {

    var schoolQuickSearch = new app.models.QuickSearchFilter({
      name: 'School Name',
      key: 'name',
      schools: opts.schools
    });

    var edLevelFilter = new app.models.SelectFilter({
      name: 'Education Level',
      key: 'osm:education:type',
      schools: opts.schools
    });

    var schoolTypeFilter = new app.models.SelectFilter({
      name: 'School Sponsor',
      key: 'osm:operator:type',
      schools: opts.schools
    });

    this.filters = new app.models.Filters([
      schoolQuickSearch,
      edLevelFilter,
      schoolTypeFilter
    ]);
    this.filters.schools = opts.schools;

    this.quickSearchWidget = new app.filterWidgets.QuickSearch({ model: schoolQuickSearch });
    this.edLevelWidget = new app.filterWidgets.Select({ model: edLevelFilter });
    this.schoolTypeWidget = new app.filterWidgets.Select({ model: schoolTypeFilter});

  },

  render: function() {
    var renderedWidgets = [
      this.quickSearchWidget.render().el,
      this.edLevelWidget.render().el,
      this.schoolTypeWidget.render().el
    ];
    this.$el.prepend(renderedWidgets);
    return this;
  }
});

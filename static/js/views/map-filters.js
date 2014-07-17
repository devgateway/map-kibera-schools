app.views.MapFilters = Backbone.View.extend({

  initialize: function(opts) {

    var schoolTypeFilter = new app.models.SelectFilter({
      name: 'School Type',
      key: 'osm:operator:type',
      schools: opts.schools
    });

    var edLevelFilter = new app.models.SelectFilter({
      name: 'Education Level',
      key: 'osm:education:type',
      schools: opts.schools
    });

    this.filters = new app.models.Filters([
      schoolTypeFilter,
      edLevelFilter,
    ]);
    this.filters.schools = opts.schools;

    this.schoolTypeWidget = new app.filterWidgets.Select({ model: schoolTypeFilter});
    this.edLevelWidget = new app.filterWidgets.Select({ model: edLevelFilter });

    // this.schoolTypeWidget = new app.filterWidgets.Select(_.extend({
    //   name: "School Type",
    //   key: { osm: "osm:operator:type",
    //          kenyaopendata: "kenyaopendata:Sponsor of School" }
    // }, widgetsCommon));

    // this.quickSearchWidget = new app.filterWidgets.QuickSearch(_.extend({
    //   name: "Schools List",
    //   key: { osm: "osm:name",
    //          kenyaopendata: "kenyaopendata:official_name" }
    //   }, widgetsCommon));
  },

  render: function() {
    var renderedWidgets = [
      this.schoolTypeWidget.render().el,
      this.edLevelWidget.render().el,
      // this.quickSearchWidget.render().el
    ];

    this.$el.prepend(renderedWidgets);
    return this;
  }
});

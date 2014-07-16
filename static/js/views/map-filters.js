app.views.MapFilters = Backbone.View.extend({

  initialize: function(opts) {
    _.extend(this, opts);
  },

  render: function() {
    var widgets = [],
        widgetCommon = { tagName: 'li',
                         schools: this.schools };

    widgets.push(new app.filterWidgets.Select(_.extend({}, widgetCommon, {
      name: "Education Level",
      key: { osm: "osm:education:type",
             kenyaopendata: "kenyaopendata:Level of Education" }
    })));

    widgets.push(new app.filterWidgets.Select(_.extend({}, widgetCommon, {
      name: "Type of School",
      key: { osm: "osm:operator:type",
             kenyaopendata: "kenyaopendata:Sponsor of School" }
    })));

    widgets.push(new app.filterWidgets.QuickSearch(_.extend({}, widgetCommon, {
      name: "Schools List",
      key: { osm: "osm:name",
             kenyaopendata: "kenyaopendata:official_name" }
    })));

    this.$el.prepend(widgets);
    return this;
  }
});

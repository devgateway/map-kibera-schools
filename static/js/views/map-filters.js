app.views.MapFilters = Backbone.View.extend({

  initialize: function(opts) {

    var widgetsCommon = {
      tagName: 'li',
      things: opts.schools
    };

    this.edLevelWidget = new app.filterWidgets.Select(_.extend({
      name: "Education Level",
      key: { osm: "osm:education:type",
             kenyaopendata: "kenyaopendata:Level of Education" }
    }, widgetsCommon));

    // this.schoolTypeWidget = new app.filterWidgets.Select(_.extend({
    //   name: "Education Level",
    //   key: { osm: "osm:education:type",
    //          kenyaopendata: "kenyaopendata:Level of Education" }
    //   }, widgetsCommon));

    // this.quickSearchWidget = new app.filterWidgets.QuickSearch(_.extend({
    //   name: "Schools List",
    //   key: { osm: "osm:name",
    //          kenyaopendata: "kenyaopendata:official_name" }
    //   }, widgetCommon));
  },

  render: function() {
    var renderedWidgets = [
      this.edLevelWidget.render().el,
      // this.schoolTypeWidget.render().el,
      // this.quickSearchWidget.render().el
    ];

    this.$el.prepend(renderedWidgets);
    return this;
  }
});

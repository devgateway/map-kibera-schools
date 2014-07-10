App.views.MapFilters = Backbone.View.extend({
  render: function() {
    var container = this.$el;
    this.collection.each(function(filter) {
      var widgetName = filter.get('widget');
      if (widgetName === 'select') {
        var filterView = new SelectWidget({model: filter});
      } else if (widgetName === 'fuzzy-search') {
        var filterView = new QuickSearchWidget({collection: schools});
      } else {
        throw 'Unknown filter widget: ' + filter.get('widget');
      }
      container.prepend(filterView.render().el);
    });
    return this;
  }
});

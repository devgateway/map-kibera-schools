app.views.SchoolsStats = Backbone.View.extend({

  template: _.template('<h3>Schools: <%= schools.length %></h3>'),

  initialize: function() {
    this.listenTo(this.collection, 'add change:excluded', this.render);
  },

  render: function() {
    this.$el.html(this.template({schools: this.collection.notExcluded()}));
    return this;
  }
});

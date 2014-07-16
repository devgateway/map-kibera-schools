app.views.MapAllSchools = Backbone.View.extend({
  initialize: function() {
    this.map = new app.views.Map({ el: this.el });
    this.collection.each(this.map.pinSchool);
    this.map.listenTo(this.collection, 'add', this.map.pinSchool);
  }
});

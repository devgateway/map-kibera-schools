app.models.SchoolFields = Backbone.Collection.extend({
  url: '/app/fields.json',
  model: Backbone.Model.extend({}),
  initialize: function() {
    this.fetch();
  }
});

app.models.SchoolFields = Backbone.Collection.extend({
  url: '/_fields.json',
  model: Backbone.Model.extend({}),
  initialize: function() {
    this.fetch();
  }
});

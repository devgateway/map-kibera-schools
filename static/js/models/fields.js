App.models.SchoolFields = Backbone.Collection.extend({
  url: '/_fields.json',
  model: Backbone.Model,
  initialize: function() {
    this.fetch();
  }
});

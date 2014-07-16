app.models.Schools = Backbone.Collection.extend({

  url: '/_schools.json',  // app-optimized version of the standard
                          // `schools.geojson` so that we can do less work.
  model: Backbone.Model.extend({}),

  initialize: function() {
    this.fetch();
  }

});

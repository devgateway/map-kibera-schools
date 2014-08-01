app.views.MapOneSchool = Backbone.View.extend({

  initialize: function() {
    this.map = new app.views.Map({ el: this.el });
    this.map.pinSchool(this.model);
    this.model.set('selected', true);
  }

});
